import Fastify from 'fastify';
import {randomUUID} from 'node:crypto';
import {Counter,Histogram,Registry} from 'prom-client';
import {tracer} from './platform/telemetry.js';
import type {Catalog} from './modules/catalog/public.js';
import {DomainError,type Orders} from './modules/orders/public.js';
import type {PaymentEvent} from './modules/payments/public.js';
import type {Span} from '@opentelemetry/api';
declare module 'fastify' {interface FastifyRequest {started:number;span:Span}}
export function buildApp(deps:{catalog:Catalog;orders:Orders;submit:(event:PaymentEvent)=>Promise<void>;ready:()=>Promise<void>;logger?:boolean}){
 const app=Fastify({logger:deps.logger??true,genReqId:()=>randomUUID(),bodyLimit:16384,ajv:{customOptions:{removeAdditional:false,coerceTypes:false}}});
 const registry=new Registry();
 const requests=new Counter({name:'http_requests_total',help:'HTTP requests',labelNames:['route','method','status'],registers:[registry]});
 const duration=new Histogram({name:'http_request_duration_seconds',help:'HTTP latency',labelNames:['route','method'],buckets:[.01,.025,.05,.1,.2,.3,.5,1,2],registers:[registry]});
 app.addHook('onRequest',async(req,reply)=>{req.started=performance.now();req.span=tracer.startSpan(`${req.method} ${req.routeOptions.url??'unmatched'}`);reply.header('x-request-id',req.id);reply.header('x-trace-id',req.span.spanContext().traceId);reply.header('x-app-env',process.env.APP_ENV??'development');});
 app.addHook('onResponse',async(req,reply)=>{const route=req.routeOptions.url??'unmatched';duration.labels(route,req.method).observe((performance.now()-req.started)/1000);requests.labels(route,req.method,String(reply.statusCode)).inc();req.span.setAttribute('http.response.status_code',reply.statusCode);req.span.end();req.log.info({traceId:req.span.spanContext().traceId,route,status:reply.statusCode},'request completed');});
 app.setErrorHandler((error,req,reply)=>{req.log.error(error);const status=error instanceof DomainError?error.statusCode:(error as {statusCode?:number}).statusCode??500;reply.status(status).send({error:status<500?(error as Error).message:'Não foi possível concluir. Tente novamente.',requestId:req.id});});
 app.get('/health',async()=>({status:'ok',environment:process.env.APP_ENV??'development'}));
 app.get('/ready',async()=>{await deps.ready();return {status:'ready'};});
 app.get('/metrics',async(_req,reply)=>reply.type(registry.contentType).send(await registry.metrics()));
 app.get<{Querystring:{category?:string}}>('/api/products',{schema:{querystring:{type:'object',additionalProperties:false,properties:{category:{type:'string',enum:['Iluminação','Objetos','Mobiliário']}}}}},async req=>({products:await deps.catalog.list(req.query.category)}));
 app.get<{Params:{id:string}}>('/api/products/:id',async req=>{const product=await deps.catalog.find(req.params.id);if(!product)throw new DomainError('Peça não encontrada.',404);return product;});
 app.post<{Body:{items:{productId:string;quantity:number}[]}}>('/api/orders',{schema:{body:{type:'object',required:['items'],additionalProperties:false,properties:{items:{type:'array',minItems:1,maxItems:30,items:{type:'object',additionalProperties:false,required:['productId','quantity'],properties:{productId:{type:'string',minLength:1,maxLength:80},quantity:{type:'integer',minimum:1,maximum:20}}}}}}}},async(req,reply)=>reply.code(201).send(await deps.orders.create(req.body.items)));
 app.get<{Params:{id:string}}>('/api/orders/:id',{schema:{params:{type:'object',required:['id'],properties:{id:{type:'string',format:'uuid'}}}}},async req=>{const order=await deps.orders.get(req.params.id);if(!order)throw new DomainError('Pedido não encontrado.',404);return order;});
 app.post<{Params:{id:string}}>('/api/orders/:id/payments',{schema:{params:{type:'object',required:['id'],properties:{id:{type:'string',format:'uuid'}}},body:{type:'object',additionalProperties:false}}},async(req,reply)=>{
  const order=await deps.orders.get(req.params.id);if(!order)throw new DomainError('Pedido não encontrado.',404);
  if(order.status==='paid')return reply.code(200).send({orderId:order.id,status:'paid'});
  const ctx=req.span.spanContext();
  await deps.submit({orderId:order.id,eventId:`payment-${order.id}`,traceparent:`00-${ctx.traceId}-${ctx.spanId}-01`});
  return reply.code(202).send({orderId:order.id,status:'processing'});
 });
 return app;
}
