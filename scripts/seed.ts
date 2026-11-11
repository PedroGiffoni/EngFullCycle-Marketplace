import {pool,transaction} from '../src/platform/db.js';
import {products} from './products.js';
import {migrate} from './migrate.js';
export async function seedProducts(){for(const product of products)await pool.query('INSERT INTO catalog.products(id,data) VALUES($1,$2) ON CONFLICT(id) DO UPDATE SET data=excluded.data',[product.id,product]);}
export async function seedOrders(){
 for(let start=1;start<=100000;start+=5000){await transaction(async db=>{
  await db.query(`INSERT INTO orders.orders(id,status,total_cents,created_at) SELECT ('00000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'pending',89000,'2026-11-01'::timestamptz FROM generate_series($1::int,$2::int) n ON CONFLICT(id) DO NOTHING`,[start,start+4999]);
  await db.query(`INSERT INTO orders.items(order_id,product_id,name,quantity,price_cents) SELECT o.id,'luminaria-arco','Luminária Arco',1,89000 FROM orders.orders o WHERE o.id BETWEEN ('00000000-0000-4000-8000-'||lpad($1::text,12,'0'))::uuid AND ('00000000-0000-4000-8000-'||lpad($2::text,12,'0'))::uuid AND NOT EXISTS(SELECT 1 FROM orders.items i WHERE i.order_id=o.id)`,[start,start+4999]);
 });}
}
if(process.argv[1]?.endsWith('seed.ts')){await migrate();await seedProducts();await seedOrders();console.log('Seed determinístico de 100.000 pedidos concluído.');await pool.end();}
