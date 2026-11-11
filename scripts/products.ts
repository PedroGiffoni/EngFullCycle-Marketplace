import type {Product} from '../src/modules/catalog/public.js';
export const products:Product[]=[
 {id:'luminaria-arco',name:'Luminária Arco',category:'Iluminação',material:'Alumínio pintado e madeira',dimensions:'40 × 24 × 24 cm',description:'Luz baixa para a mesa. Uma cúpula ampla sobre uma base de madeira.',priceCents:89000,image:'/images/luminaria.svg',model:true,fictional:true},
 {id:'vaso-terra',name:'Vaso Terra',category:'Objetos',material:'Cerâmica fosca',dimensions:'28 × 18 × 18 cm',description:'Volume suave para flores secas ou para compor sozinho.',priceCents:32000,image:'/images/vaso.svg',model:false,fictional:true},
 {id:'banco-linha',name:'Banco Linha',category:'Mobiliário',material:'Madeira',dimensions:'45 × 40 × 30 cm',description:'Escala pequena, presença tranquila. Um apoio ao lado do sofá.',priceCents:125000,image:'/images/banco.svg',model:false,fictional:true},
 {id:'bandeja-plano',name:'Bandeja Plano',category:'Objetos',material:'Madeira',dimensions:'3 × 38 × 24 cm',description:'Uma superfície para reunir os pequenos objetos do dia.',priceCents:26000,image:'/images/bandeja.svg',model:false,fictional:true}
];
