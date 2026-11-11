import * as THREE from 'three';
export function createView(host:HTMLElement){
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
 renderer.setClearColor(0xeae6dd,1);host.replaceChildren(renderer.domElement);const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('aria-label','Luminária fictícia em 3D. Setas esquerda e direita giram; Home restaura.');
 const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(35,1,.01,10);camera.position.set(.65,.45,.7);camera.lookAt(0,.18,0);
 scene.add(new THREE.HemisphereLight(0xffffff,0x8c8271,3));const light=new THREE.DirectionalLight(0xffffff,4);light.position.set(-2,3,2);scene.add(light);
 const group=new THREE.Group();scene.add(group);
 const clay=new THREE.MeshStandardMaterial({color:0x904530,roughness:.65});const wood=new THREE.MeshStandardMaterial({color:0x846342,roughness:.85});const metal=new THREE.MeshStandardMaterial({color:0x33332e,roughness:.4});
 const base=new THREE.Mesh(new THREE.CylinderGeometry(.09,.10,.035,48),wood);base.position.y=.0175;
 const stem=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,.25,24),metal);stem.position.y=.16;
 const shade=new THREE.Mesh(new THREE.ConeGeometry(.12,.12,64,1,true),clay);shade.position.y=.34;
 clay.side=THREE.DoubleSide;group.add(base,stem,shade);
 const draw=()=>renderer.render(scene,camera);const resize=()=>{const w=host.clientWidth||320,h=host.clientHeight||340;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();draw();};
 const observer=new ResizeObserver(resize);observer.observe(host);
 let pointer:number|undefined;let lastX=0;
 const down=(event:PointerEvent)=>{pointer=event.pointerId;lastX=event.clientX;canvas.setPointerCapture(pointer);};
 const move=(event:PointerEvent)=>{if(pointer!==event.pointerId)return;group.rotation.y+=(event.clientX-lastX)*.01;lastX=event.clientX;draw();};
 const up=()=>{pointer=undefined;};const rotate=()=>{group.rotation.y+=Math.PI/6;draw();};const reset=()=>{group.rotation.y=0;draw();};
 const key=(event:KeyboardEvent)=>{if(['ArrowLeft','ArrowRight','Home'].includes(event.key)){event.preventDefault();if(event.key==='Home')reset();else{group.rotation.y+=event.key==='ArrowLeft'?-.2:.2;draw();}}};
 canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);canvas.addEventListener('keydown',key);resize();
 return {resize,rotate,reset,dispose(){observer.disconnect();canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up);canvas.removeEventListener('keydown',key);for(const mesh of [base,stem,shade])mesh.geometry.dispose();clay.dispose();wood.dispose();metal.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();}};
}
