let ready=false;
for(let i=0;i<60;i++){try{const response=await fetch('http://localhost:3000/ready');if(response.ok){ready=true;break;}}catch{/* Aguarda prontidão real. */}await new Promise(resolve=>setTimeout(resolve,1000));}
if(!ready)throw Error('Aplicação não ficou pronta em 60 segundos.');
