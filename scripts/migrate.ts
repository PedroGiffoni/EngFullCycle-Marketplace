import { pool } from "../src/platform/db.js";
export async function migrate() {
  await pool.query(`
CREATE SCHEMA IF NOT EXISTS catalog; CREATE SCHEMA IF NOT EXISTS orders; CREATE SCHEMA IF NOT EXISTS payments;
CREATE TABLE IF NOT EXISTS catalog.products(id text PRIMARY KEY,data jsonb NOT NULL);
CREATE TABLE IF NOT EXISTS orders.orders(id uuid PRIMARY KEY,status text NOT NULL CHECK(status IN ('pending','paid')),total_cents integer NOT NULL CHECK(total_cents>0),created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS orders.items(id bigserial PRIMARY KEY,order_id uuid NOT NULL REFERENCES orders.orders(id),product_id text NOT NULL,name text NOT NULL,quantity integer NOT NULL CHECK(quantity BETWEEN 1 AND 20),price_cents integer NOT NULL CHECK(price_cents>0));
CREATE INDEX IF NOT EXISTS items_order_idx ON orders.items(order_id);
CREATE TABLE IF NOT EXISTS payments.processed(event_id text PRIMARY KEY,order_id uuid NOT NULL UNIQUE,traceparent text NOT NULL,processed_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS payments.receipts(order_id uuid PRIMARY KEY,event_id text NOT NULL UNIQUE REFERENCES payments.processed(event_id),amount_cents integer NOT NULL CHECK(amount_cents>0));
ALTER TABLE catalog.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments.processed ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments.receipts ENABLE ROW LEVEL SECURITY;
`);
}
if (process.argv[1]?.endsWith("migrate.ts")) {
  await migrate();
  console.log("Migrações aplicadas.");
  await pool.end();
}
