import {createHash} from 'node:crypto';
import {readFile,readdir,writeFile} from 'node:fs/promises';
const paths=[];
async function walk(path){for(const entry of await readdir(path,{withFileTypes:true})){const name=`${path}/${entry.name}`;if(entry.isDirectory())await walk(name);else paths.push(name);}}
for(const path of ['src','web','scripts','load'])await walk(path);
paths.push('package.json','package-lock.json','Dockerfile','docker-compose.yml');
const files={};const hash=createHash('sha256');
for(const path of paths.sort()){const data=await readFile(path);files[path]=createHash('sha256').update(data).digest('hex');hash.update(path).update(data);}
await writeFile('docs/evidencias/revision.json',JSON.stringify({capturedAt:new Date().toISOString(),type:'sha256-source-manifest-not-git-commit',revision:hash.digest('hex'),files},null,2));
