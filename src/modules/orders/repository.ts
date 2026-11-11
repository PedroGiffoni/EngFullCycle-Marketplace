import { pool, transaction } from "../../platform/db.js";
import type { Catalog } from "../catalog/public.js";
import { DomainError, type Order, type Orders } from "./public.js";
import { total } from "./domain.js";
import { randomUUID } from "node:crypto";
export class OrderRepository implements Orders {
  constructor(private catalog: Catalog) {}
  async create(
    input: { productId: string; quantity: number }[],
  ): Promise<Order> {
    const items = await Promise.all(
      input.map(async (item) => {
        const product = await this.catalog.find(item.productId);
        if (!product) throw new DomainError("Peça não encontrada.", 404);
        return { ...item, name: product.name, priceCents: product.priceCents };
      }),
    );
    const order: Order = {
      id: randomUUID(),
      status: "pending",
      items,
      totalCents: total(items),
    };
    await transaction(async (db) => {
      await db.query(
        "INSERT INTO orders.orders(id,status,total_cents) VALUES($1,$2,$3)",
        [order.id, order.status, order.totalCents],
      );
      for (const item of items)
        await db.query(
          "INSERT INTO orders.items(order_id,product_id,name,quantity,price_cents) VALUES($1,$2,$3,$4,$5)",
          [order.id, item.productId, item.name, item.quantity, item.priceCents],
        );
    });
    return order;
  }
  async get(id: string): Promise<Order | undefined> {
    const { rows } = await pool.query(
      'SELECT id,status,total_cents AS "totalCents" FROM orders.orders WHERE id=$1',
      [id],
    );
    if (!rows.length) return undefined;
    const items = await pool.query(
      'SELECT product_id AS "productId",name,quantity,price_cents AS "priceCents" FROM orders.items WHERE order_id=$1 ORDER BY id',
      [id],
    );
    return { ...rows[0], items: items.rows };
  }
}
