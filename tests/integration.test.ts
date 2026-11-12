import { beforeAll, afterAll, it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import { setup, pool, catalog, orders, payment } from "./setup.js";
import { transaction } from "../src/platform/db.js";
import { CachedCatalog } from "../src/modules/catalog/cache.js";
import { createClient } from "redis";
let app: Awaited<ReturnType<typeof setup>>;
beforeAll(async () => {
  app = await setup();
});
afterAll(async () => {
  await app.close();
  await pool.end();
});
it("persiste pedido e itens, preço autoritativo e estado", async () => {
  const order = await orders.create([
    { productId: "luminaria-arco", quantity: 2 },
  ]);
  expect(order.totalCents).toBe(178000);
  expect(await orders.get(order.id)).toEqual(order);
});
it("persiste uma sacola completa em ordem com preços e quantidades distintos", async () => {
  const products = await catalog.list();
  const input = products.map((product, index) => ({
    productId: product.id,
    quantity: index + 1,
  }));
  const order = await orders.create(input);
  expect(order.items).toHaveLength(4);
  expect(order.totalCents).toBe(
    products.reduce(
      (sum, product, index) => sum + product.priceCents * (index + 1),
      0,
    ),
  );
  expect((await orders.get(order.id))?.items).toEqual(order.items);
});
it("rollback PostgreSQL desfaz pedido e itens diante de erro", async () => {
  const id = randomUUID();
  await expect(
    transaction(async (db) => {
      await db.query(
        "INSERT INTO orders.orders(id,status,total_cents) VALUES($1,$2,$3)",
        [id, "pending", 100],
      );
      await db.query(
        "INSERT INTO orders.items(order_id,product_id,name,quantity,price_cents) VALUES($1,$2,$3,$4,$5)",
        [id, "x", "x", 0, 100],
      );
    }),
  ).rejects.toThrow();
  expect(await orders.get(id)).toBeUndefined();
});
it("pedido usa interface de catálogo e não persiste peça inexistente", async () => {
  await expect(
    orders.create([{ productId: "ausente", quantity: 1 }]),
  ).rejects.toThrow("não encontrada");
  expect(await catalog.find("ausente")).toBeUndefined();
  expect(await catalog.list("Objetos")).toHaveLength(2);
});
it("pagamento concorrente e reentrega causam um único efeito", async () => {
  const order = await orders.create([{ productId: "vaso-terra", quantity: 1 }]);
  const event = {
    orderId: order.id,
    eventId: `payment-${order.id}`,
    traceparent: "test",
  };
  const results = await Promise.all(
    Array.from({ length: 12 }, () => payment.charge(event)),
  );
  expect(results.filter((r) => !r.duplicate)).toHaveLength(1);
  expect((await orders.get(order.id))?.status).toBe("paid");
  expect(
    (
      await pool.query(
        "SELECT count(*)::int n FROM payments.receipts WHERE order_id=$1",
        [order.id],
      )
    ).rows[0].n,
  ).toBe(1);
  expect(
    (
      await pool.query(
        "SELECT count(*)::int n FROM payments.processed WHERE order_id=$1",
        [order.id],
      )
    ).rows[0].n,
  ).toBe(1);
});
it("falha e rollback do consumidor não deixam evento processado", async () => {
  const event = {
    orderId: randomUUID(),
    eventId: randomUUID(),
    traceparent: "test",
  };
  await expect(payment.charge(event)).rejects.toThrow();
  expect(
    (
      await pool.query("SELECT * FROM payments.processed WHERE event_id=$1", [
        event.eventId,
      ])
    ).rowCount,
  ).toBe(0);
});
it("flag ligada/desligada, hit e Redis indisponível preservam catálogo", async () => {
  const redis = createClient({
    url: process.env.REDIS_URL ?? "redis://localhost:6379",
  });
  await redis.connect();
  await redis.del("catalog:v1:all");
  const cached = new CachedCatalog(catalog, redis, true, 30);
  expect(await cached.list()).toEqual(await catalog.list());
  expect(await cached.list()).toEqual(await catalog.list());
  expect(await redis.ttl("catalog:v1:all")).toBeGreaterThan(0);
  expect(await new CachedCatalog(catalog, redis, false).list()).toEqual(
    await catalog.list(),
  );
  await redis.close();
  expect(await cached.list()).toEqual(await catalog.list());
  expect(await cached.find("vaso-terra")).toEqual(
    await catalog.find("vaso-terra"),
  );
});
