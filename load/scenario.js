import http from 'k6/http';
import {check,sleep} from 'k6';
export const options={stages:[{duration:'10s',target:10},{duration:'30s',target:10},{duration:'10s',target:0}],thresholds:{'http_req_duration{operation:catalog}':['p(95)<300'],'http_req_duration{operation:order}':['p(95)<300'],'http_req_duration{operation:create}':['p(95)<500'],'http_req_failed':['rate<0.01'],checks:['rate>0.99']}};
const base=__ENV.BASE_URL||'http://localhost:3000';
export default function(){
 const catalog=http.get(`${base}/api/products`,{tags:{operation:'catalog'}});check(catalog,{'catálogo 200':r=>r.status===200,'catálogo tem peças':r=>r.json('products').length===4});
 const order=http.get(`${base}/api/orders/${__ENV.ORDER_ID||'00000000-0000-4000-8000-000000000001'}`,{tags:{operation:'order'}});check(order,{'pedido 200':r=>r.status===200,'pedido tem itens':r=>r.json('items').length>0});
 const created=http.post(`${base}/api/orders`,JSON.stringify({items:[{productId:'vaso-terra',quantity:1}]}),{headers:{'Content-Type':'application/json'},tags:{operation:'create'}});check(created,{'criação 201':r=>r.status===201,'total autoritativo':r=>r.json('totalCents')===32000});sleep(.1);
}
