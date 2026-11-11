import {DomainError,type OrderItem} from './public.js';
export function total(items:OrderItem[]):number{
  if(!items.length||items.length>30)throw new DomainError('Selecione de 1 a 30 itens.');
  for(const item of items)if(!Number.isInteger(item.quantity)||item.quantity<1||item.quantity>20)throw new DomainError('Quantidade deve ser inteira entre 1 e 20.');
  return items.reduce((sum,item)=>sum+item.quantity*item.priceCents,0);
}
export function transition(status:string){if(status!=='pending')throw new DomainError('Pedido já pago.',409);return 'paid' as const;}
