#!/usr/bin/env node
import { realpathSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { load } from "./deps.mjs";
import { capturePage } from "./compare/capture.mjs";

const asUrl=(value)=>/^https?:/.test(value)?value:pathToFileURL(resolve(value)).href;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

export async function compareProduct({target,reference,name="product precedent",outPath="/tmp/shine-product-compare.png"}){
  const {chromium}=load("playwright"),sharp=load("sharp"),browser=await chromium.launch();
  try{
    const capture=async(value)=>{const page=await browser.newPage({viewport:{width:1280,height:800}});await page.goto(asUrl(value),{waitUntil:"networkidle"});await page.evaluate(()=>document.fonts?.ready);const result=await capturePage(page);await page.close();return result;};
    const [current,precedent]=await Promise.all([capture(target),capture(reference)]);
    const expected=precedent.facts.productPatterns||{},actual=current.facts.productPatterns||{},failures=[];
    if(!Object.keys(expected).length)failures.push(`${name} exposes no data-product-pattern conventions`);
    for(const [pattern,want] of Object.entries(expected)){
      const got=actual[pattern];
      if(!got){failures.push(`missing product pattern ${pattern}`);continue;}
      if(got.tag!==want.tag)failures.push(`${pattern}: root changed from ${want.tag} to ${got.tag}`);
      if(!same(got.directChildren,want.directChildren))failures.push(`${pattern}: direct anatomy diverges (${want.directChildren.join(",")} → ${got.directChildren.join(",")})`);
      if(!same(got.directControls,want.directControls))failures.push(`${pattern}: direct control model diverges (${want.directControls.join(",")} → ${got.directControls.join(",")})`);
      for(const key of ["display","gridTemplateColumns","padding","borderRadius","backgroundColor"])if(got.style[key]!==want.style[key])failures.push(`${pattern}: ${key} diverges (${want.style[key]} → ${got.style[key]})`);
    }
    const W=800,a=await sharp(current.screenshot).resize({width:W}).png().toBuffer(),b=await sharp(precedent.screenshot).resize({width:W}).png().toBuffer();
    const [ma,mb]=await Promise.all([sharp(a).metadata(),sharp(b).metadata()]);
    await sharp({create:{width:W*2+24,height:Math.max(ma.height,mb.height),channels:3,background:{r:24,g:24,b:24}}}).composite([{input:a,left:0,top:0},{input:b,left:W+24,top:0}]).png().toFile(outPath);
    return {status:failures.length?1:0,failures,report:`Product precedent: ${name}\nShared patterns: ${Object.keys(expected).join(", ")||"none"}\nComposite: ${outPath}`};
  }finally{await browser.close();}
}

if(process.argv[1]&&realpathSync(process.argv[1])===fileURLToPath(import.meta.url)){
  const args=process.argv.slice(2),opt=(flag)=>args.includes(flag)?args[args.indexOf(flag)+1]:"",pos=args.filter((value,index)=>!value.startsWith("-")&&(index===0||!args[index-1].startsWith("--")));
  if(pos.length<2){console.error("usage: node verify/compare-product.mjs <page|url> <product-reference-page|url> [--name name --out png]");process.exit(2);}
  const result=await compareProduct({target:pos[0],reference:pos[1],name:opt("--name")||"product precedent",outPath:opt("--out")||"/tmp/shine-product-compare.png"});
  console.log(result.report);if(result.failures.length){console.error("product compare: product conventions diverged:");for(const failure of result.failures)console.error(`  ${failure}`);}process.exit(result.status);
}
