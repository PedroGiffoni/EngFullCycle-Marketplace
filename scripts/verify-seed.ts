import { pool } from "../src/platform/db.js";
const result = await pool.query(
  `SELECT (SELECT count(*)::int FROM orders.orders WHERE id::text LIKE '00000000-0000-4000-8000-%') orders,(SELECT count(*)::int FROM orders.items WHERE order_id::text LIKE '00000000-0000-4000-8000-%') items`,
);
console.log(JSON.stringify(result.rows[0]));
if (result.rows[0].orders !== 100000 || result.rows[0].items !== 100000)
  process.exitCode = 1;
await pool.end();
