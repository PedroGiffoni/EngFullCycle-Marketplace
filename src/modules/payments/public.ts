export interface PaymentEvent {orderId:string;eventId:string;traceparent:string}
export interface PaymentGateway {charge(event:PaymentEvent):Promise<{status:'paid';duplicate:boolean}>}
