import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import postcss from 'postcss';
import tailwind from '@tailwindcss/postcss';
export async function buildLibrary(output) {
 const root=resolve(fileURLToPath(new URL('../..',import.meta.url))),fixture=join(root,'verify/fixtures/blocks');
 mkdirSync(output,{recursive:true});const catalog=JSON.parse(readFileSync(join(root,'blocks/catalog.json'),'utf8')).blocks,files={};
 for(const block of catalog){const item=JSON.parse(readFileSync(join(root,'site/r/'+block.id+'.json'),'utf8'));if(item.files[0].content!==readFileSync(join(root,'blocks/'+block.id+'.tsx'),'utf8'))throw Error('Registry stale: '+block.id);files['@/components/shine/'+block.id]=item.files[0].content;}
 await build({entryPoints:[join(fixture,'library.tsx')],outfile:join(output,'app.js'),bundle:true,minify:true,jsx:'automatic',plugins:[{name:'published-library',setup(b){b.onResolve({filter:/^@\//},args=>files[args.path]?{path:args.path,namespace:'registry'}:{path:args.path==='@/lib/utils'?join(fixture,'utils.ts'):join(fixture,'ui',args.path.split('/').at(-1)+'.tsx')});b.onLoad({filter:/.*/,namespace:'registry'},args=>({contents:files[args.path],loader:'tsx',resolveDir:root}));}}]});
 const css=await postcss([tailwind()]).process(readFileSync(join(fixture,'theme.css'),'utf8'),{from:join(fixture,'theme.css')});writeFileSync(join(output,'app.css'),css.css);
 writeFileSync(join(output,'index.html'),'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Shine — working interface library</title><link rel="stylesheet" href="./app.css"></head><body><div id="root"></div><script src="./app.js"></script></body></html>');
 return {blocks:catalog.filter(item=>item.kind!=='page').length,pages:catalog.filter(item=>item.kind==='page').length};
}
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(await buildLibrary(resolve(process.argv[2]||'site/library')));
