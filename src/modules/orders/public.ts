export interface OrderItem {productId:string;name:string;quantity:number;priceCents:number}
export interface Order {id:string;status:'pending'|'paid';totalCents:number;items:OrderItem[]}
export interface Orders {create(items:{productId:string;quantity:number}[]):Promise<Order>;get(id:string):Promise<Order|undefined>}
export class DomainError extends Error {constructor(message:string,public statusCode=422){super(message);}}
