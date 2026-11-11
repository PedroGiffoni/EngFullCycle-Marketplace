import {test,expect} from '@playwright/test';
test('catálogo real, filtros, detalhe, sacola, quantidade e pagamento',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await expect(page.locator('.card')).toHaveCount(4);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:`docs/evidencias/catalogo-${info.project.name}.png`,fullPage:true});
 await page.getByRole('button',{name:'Objetos',exact:true}).click();await expect(page.locator('.card')).toHaveCount(2);
 await expect(page.getByRole('button',{name:'Objetos',exact:true})).toBeFocused();
 await page.getByRole('button',{name:'Todas as peças'}).click();await page.getByRole('button',{name:'Iluminação',exact:true}).click();await expect(page.locator('.card')).toHaveCount(1);
 await page.getByRole('button',{name:'Ver Luminária Arco'}).click();await expect(page.locator('#product-dialog')).toBeVisible();
 await page.screenshot({path:`docs/evidencias/detalhe-${info.project.name}.png`});
 await page.getByRole('button',{name:'Adicionar à sacola'}).click();await expect(page.locator('#cart-dialog')).toBeVisible();
 await page.getByRole('button',{name:'Aumentar Luminária Arco'}).click();await expect(page.locator('#cart-total')).toContainText('1.780,00');
 await page.screenshot({path:`docs/evidencias/carrinho-${info.project.name}.png`});
 await page.keyboard.press('Escape');await expect(page.locator('#cart-dialog')).not.toBeVisible();
 await page.locator('#open-cart').click();await page.getByRole('button',{name:'Criar pedido e pagar'}).click();await expect(page.locator('#cart-feedback')).toContainText('Pagamento simulado confirmado',{timeout:20000});
 await page.screenshot({path:`docs/evidencias/confirmacao-${info.project.name}.png`});expect(errors).toEqual([]);
});
test('3D tardio, teclado, retorno e liberação',async({page},info)=>{
 const resources:string[]=[];page.on('request',r=>resources.push(r.url()));await page.goto('/');await page.getByRole('button',{name:'Ver Luminária Arco'}).click();expect(resources.some(r=>r.includes('three-view'))).toBe(false);
 await page.getByRole('button',{name:'Ver em 3D'}).click();await expect(page.locator('#three-host canvas')).toBeVisible();
 await page.locator('#three-host canvas').focus();await page.keyboard.press('ArrowRight');await page.keyboard.press('Home');await page.getByRole('button',{name:'Girar peça'}).click();await page.getByRole('button',{name:'Restaurar vista'}).click();
 const measurements=await page.evaluate(()=>({activation:performance.getEntriesByName('product-3d-activation').map(e=>e.duration),resources:performance.getEntriesByType('resource').filter(e=>e.name.includes('three-view')).map(e=>({name:e.name,duration:e.duration,transferSize:(e as PerformanceResourceTiming).transferSize}))}));
 await test.info().attach('custo-3d',{body:JSON.stringify(measurements),contentType:'application/json'});
 await page.screenshot({path:`docs/evidencias/three-${info.project.name}.png`});await page.keyboard.press('Escape');await expect(page.locator('#three-host canvas')).toHaveCount(0);await expect(page.getByRole('button',{name:'Ver Luminária Arco'})).toBeFocused();
});
test('WebGL indisponível mantém compra; carregamento lento mostra feedback',async({page})=>{
 await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,type:string,...args:unknown[]){if(type.includes('webgl'))return null;return Reflect.apply(original,this,[type,...args]);} as typeof original;});
 await page.route('**/assets/three-view*',async route=>{await new Promise(resolve=>setTimeout(resolve,500));await route.continue();});
 await page.goto('/');await page.getByRole('button',{name:'Ver Luminária Arco'}).click();await page.getByRole('button',{name:'Ver em 3D'}).click();await expect(page.locator('#three-status')).toContainText('Carregando');await expect(page.locator('#three-status')).toContainText('indisponível');await expect(page.locator('#product-image')).toBeVisible();await page.getByRole('button',{name:'Adicionar à sacola'}).click();await expect(page.locator('#cart-dialog')).toBeVisible();
});
test('falha de catálogo, repetição e seleção vazia',async({page})=>{
 await page.route('**/api/products',route=>route.fulfill({status:500,contentType:'application/json',body:'{"error":"Falha de teste"}'}));await page.goto('/');await expect(page.locator('#catalog-state')).toContainText('Não foi possível');await page.unroute('**/api/products');await page.getByRole('button',{name:'Tentar novamente'}).click();await expect(page.locator('.card')).toHaveCount(4);
 await page.route('**/api/products?*',route=>route.fulfill({status:200,contentType:'application/json',body:'{"products":[]}'}));await page.getByRole('button',{name:'Objetos',exact:true}).click();await expect(page.locator('#catalog-state')).toContainText('Nenhuma peça');
});
test('contrastes reais de tokens',async({page})=>{
 await page.goto('/');const colors=await page.evaluate(()=>{const s=getComputedStyle(document.documentElement);return ['--ink','--paper','--muted','--clay','--surface'].map(v=>s.getPropertyValue(v).trim());});
 function luminance(hex:string){const c=hex.replace('#','');const expanded=c.length===3?[...c].map(x=>x+x).join(''):c;const rgb=[0,2,4].map(i=>parseInt(expanded.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;}
 function ratio(a:string,b:string){const [x,y]=[luminance(a),luminance(b)].sort((a,b)=>b-a);return (x+.05)/(y+.05);}
 const result={inkPaper:ratio(colors[0],colors[1]),mutedPaper:ratio(colors[2],colors[1]),whiteClay:ratio(colors[4],colors[3]),clayPaper:ratio(colors[3],colors[1])};for(const value of Object.values(result))expect(value).toBeGreaterThanOrEqual(4.5);await test.info().attach('contraste',{body:JSON.stringify(result),contentType:'application/json'});
});

