import { pool } from "../src/platform/db.js";
// Exclusivo do banco descartável e explicitamente nomeado do experimento.
if (
  process.env.APP_ENV !== "benchmark" ||
  new URL(process.env.DATABASE_URL ?? "").pathname !== "/forma_benchmark"
)
  throw Error(
    "Reset permitido somente em APP_ENV=benchmark e banco forma_benchmark.",
  );
await pool.query(
  "TRUNCATE payments.receipts,payments.processed,orders.items,orders.orders RESTART IDENTITY",
);
await pool.end();
console.log("Somente o banco descartável forma_benchmark foi reiniciado.");
