import {describe,it,expect} from 'vitest';
import {total,transition} from '../src/modules/orders/domain.js';
describe('domínio de pedidos',()=>{
 it('congela e soma centavos sem arredondamento flutuante',()=>expect(total([{productId:'x',name:'x',priceCents:89000,quantity:2},{productId:'y',name:'y',priceCents:32000,quantity:1}])).toBe(210000));
 it.each([0,-1,1.5,21,NaN])('rejeita quantidade %s',quantity=>expect(()=>total([{productId:'x',name:'x',priceCents:100,quantity}])).toThrow('Quantidade'));
 it('rejeita vazio e excesso de linhas',()=>{expect(()=>total([])).toThrow();expect(()=>total(Array(31).fill({quantity:1,priceCents:1}))).toThrow();});
 it('só permite pagar pedido pendente',()=>{expect(transition('pending')).toBe('paid');expect(()=>transition('paid')).toThrow('já pago');});
});
