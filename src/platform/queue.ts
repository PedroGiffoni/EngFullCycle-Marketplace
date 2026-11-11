import {Queue,Worker,QueueEvents} from 'bullmq';
import {tracer,parentContext} from './telemetry.js';
import type {PaymentEvent,PaymentGateway} from '../modules/payments/public.js';
export function paymentQueue(gateway:PaymentGateway){
 const url=new URL(process.env.REDIS_URL??'redis://localhost:6379');
 const connection={host:url.hostname,port:Number(url.port||6379),password:url.password||undefined,maxRetriesPerRequest:null};
 const queue=new Queue<PaymentEvent>('payments',{connection});
 const events=new QueueEvents('payments',{connection});
 const worker=new Worker<PaymentEvent>('payments',async job=>{
  const span=tracer.startSpan('payment.consume',{},parentContext(job.data.traceparent));
  try{const result=await gateway.charge(job.data);span.setAttribute('payment.duplicate',result.duplicate);return result;}
  catch(error){span.recordException(error as Error);throw error;}finally{span.end();}
 },{connection,concurrency:4});
 return {
  async submit(event:PaymentEvent){await queue.add('simulate',event,{jobId:event.eventId,attempts:3,backoff:{type:'exponential',delay:200},removeOnComplete:1000,removeOnFail:1000});},
  async close(){await worker.close();await events.close();await queue.close();}
 };
}
