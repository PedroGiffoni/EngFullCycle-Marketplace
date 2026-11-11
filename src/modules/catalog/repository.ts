import { pool } from "../../platform/db.js";
import type { Catalog, Product } from "./public.js";
export class CatalogRepository implements Catalog {
  async list(category?: string): Promise<Product[]> {
    const { rows } = await pool.query(
      "SELECT data FROM catalog.products WHERE ($1::text IS NULL OR data->>'category'=$1) ORDER BY id",
      [category ?? null],
    );
    return rows.map((r) => r.data);
  }
  async find(id: string): Promise<Product | undefined> {
    const { rows } = await pool.query(
      "SELECT data FROM catalog.products WHERE id=$1",
      [id],
    );
    return rows[0]?.data;
  }
}
