import { migrate } from "../scripts/migrate.js";
import { seedProducts } from "../scripts/seed.js";
import { CatalogRepository } from "../src/modules/catalog/repository.js";
import { OrderRepository } from "../src/modules/orders/repository.js";
import { SimulatedPayment } from "../src/modules/payments/simulated.js";
import { buildApp } from "../src/app.js";
import { pool } from "../src/platform/db.js";
export { pool };
export const catalog = new CatalogRepository();
export const orders = new OrderRepository(catalog);
export const payment = new SimulatedPayment();
export async function setup() {
  await migrate();
  await seedProducts();
  return buildApp({
    catalog,
    orders,
    submit: async (event) => {
      await payment.charge(event);
    },
    ready: async () => {
      await pool.query("SELECT 1");
    },
    logger: false,
  });
}
