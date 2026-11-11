import type {RedisClientType} from 'redis';
import type {Catalog,Product} from './public.js';
export class CachedCatalog implements Catalog {
  constructor(private source:Catalog,private redis:RedisClientType,private enabled:boolean,private ttl=30){}
  async list(category?:string):Promise<Product[]>{
    if(!this.enabled)return this.source.list(category);
    const key=`catalog:v1:${category??'all'}`;
    try{if(this.redis.isReady){const value=await this.redis.get(key);if(value)return JSON.parse(value);}}catch{/* Banco é fonte da verdade. */}
    const products=await this.source.list(category);
    try{if(this.redis.isReady)await this.redis.set(key,JSON.stringify(products),{EX:this.ttl});}catch{/* Cache best effort. */}
    return products;
  }
  find(id:string){return this.source.find(id);}
}
