import type pg from 'pg';
import {DomainError} from './public.js';
import {transition} from './domain.js';
// API pública transacional: pagamento não acessa tabelas de pedidos diretamente.
export async function payOrder(db:pg.PoolClient,id:string){
  const {rows}=await db.query('SELECT status,total_cents FROM orders.orders WHERE id=$1 FOR UPDATE',[id]);
  if(!rows.length)throw new DomainError('Pedido não encontrado.',404);
  transition(rows[0].status);
  await db.query('UPDATE orders.orders SET status=$2 WHERE id=$1',[id,'paid']);return rows[0].total_cents as number;
}
