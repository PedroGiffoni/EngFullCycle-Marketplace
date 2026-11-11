import {transaction} from '../../platform/db.js';
import {payOrder} from '../orders/index.public.js';
import type {PaymentEvent,PaymentGateway} from './public.js';
export class SimulatedPayment implements PaymentGateway {
  async charge(event:PaymentEvent){
    return transaction(async db=>{
      const claim=await db.query('INSERT INTO payments.processed(event_id,order_id,traceparent) VALUES($1,$2,$3) ON CONFLICT(event_id) DO NOTHING RETURNING event_id',[event.eventId,event.orderId,event.traceparent]);
      if(!claim.rowCount)return {status:'paid' as const,duplicate:true};
      const amount=await payOrder(db,event.orderId);
      await db.query('INSERT INTO payments.receipts(order_id,event_id,amount_cents) VALUES($1,$2,$3)',[event.orderId,event.eventId,amount]);
      return {status:'paid' as const,duplicate:false};
    });
  }
}
