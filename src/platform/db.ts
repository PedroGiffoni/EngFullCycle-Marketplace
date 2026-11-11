import pg from "pg";
export const pool = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL ??
    "postgres://forma:forma_local@localhost:55432/forma",
  max: Number(process.env.DB_POOL_MAX ?? 20),
  connectionTimeoutMillis: 10000,
  ...(process.env.DATABASE_SSL === "true"
    ? {
        ssl: {
          rejectUnauthorized: true,
          ...(process.env.DATABASE_CA_CERT
            ? { ca: process.env.DATABASE_CA_CERT }
            : {}),
        },
      }
    : {}),
});
export interface Queryable {
  query: pg.Pool["query"];
}
export async function transaction<T>(
  fn: (db: pg.PoolClient) => Promise<T>,
): Promise<T> {
  const db = await pool.connect();
  try {
    await db.query("BEGIN");
    const result = await fn(db);
    await db.query("COMMIT");
    return result;
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  } finally {
    db.release();
  }
}
