import { fileURLToPath } from "node:url";
import fastifyStatic from "@fastify/static";
import { createClient } from "redis";
import { pool } from "./platform/db.js";
import { provider } from "./platform/telemetry.js";
import { paymentQueue } from "./platform/queue.js";
import { CatalogRepository } from "./modules/catalog/repository.js";
import { CachedCatalog } from "./modules/catalog/cache.js";
import { OrderRepository } from "./modules/orders/repository.js";
import { SimulatedPayment } from "./modules/payments/simulated.js";
import { buildApp } from "./app.js";
import { migrate } from "../scripts/migrate.js";
import { seedProducts } from "../scripts/seed.js";
await migrate();
await seedProducts();
const redis = createClient({
  url: process.env.REDIS_URL ?? "redis://localhost:6379",
  disableOfflineQueue: true,
  socket: {
    connectTimeout: 1000,
    reconnectStrategy: (retries) => Math.min(100 * retries, 1000),
  },
});
redis.on("error", (error) =>
  console.error(
    JSON.stringify({
      level: "warn",
      component: "catalog-cache",
      message: error.message,
    }),
  ),
);
void redis.connect();
const catalog = new CachedCatalog(
  new CatalogRepository(),
  redis,
  process.env.CATALOG_CACHE_ENABLED !== "false",
  Number(process.env.CATALOG_CACHE_TTL ?? 30),
);
const queue = paymentQueue(new SimulatedPayment());
const app = buildApp({
  catalog,
  orders: new OrderRepository(catalog),
  submit: queue.submit,
  ready: async () => {
    await pool.query("SELECT 1");
  },
});
await app.register(fastifyStatic, {
  root: fileURLToPath(new URL("../dist/web/", import.meta.url)),
});
app.setNotFoundHandler((req, reply) =>
  req.url.startsWith("/api/")
    ? reply.code(404).send({ error: "Rota não encontrada.", requestId: req.id })
    : reply.sendFile("index.html"),
);
await app.listen({ host: "0.0.0.0", port: Number(process.env.PORT ?? 3000) });
async function stop() {
  await app.close();
  await queue.close();
  if (redis.isOpen) await redis.close();
  await pool.end();
  await provider.shutdown();
}
process.on("SIGTERM", () => void stop());
process.on("SIGINT", () => void stop());
