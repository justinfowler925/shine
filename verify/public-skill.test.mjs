#!/usr/bin/env node
import assert from "node:assert/strict";
import {load} from "./deps.mjs";
import {createServer} from "node:http";
import {readFileSync} from "node:fs";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {proveUsability, readUsabilityContract} from "./usability.mjs";

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const canonical=readFileSync(join(ROOT,"skill/SKILL.md"),"utf8");
const bundled=readFileSync(join(ROOT,"site/shine-skill.md"),"utf8");
assert.ok(bundled.includes("Table quality — shared patterns and executable outcomes"),"download omits table-quality reference");
assert.ok(bundled.includes("require the full repository install"),"guidance must distinguish the executable tools");
const published=readFileSync(join(ROOT,"site/SKILL.md"),"utf8");
if(published!==canonical) throw new Error("public SKILL.md drifted from skill/SKILL.md");
const vercel=JSON.parse(readFileSync(join(ROOT,"vercel.json"),"utf8"));
const csp=vercel.headers.flatMap(rule=>rule.headers||[]).find(header=>header.key==="Content-Security-Policy")?.value||"";
if(!/connect-src\s+'self'/.test(csp)) throw new Error("site CSP blocks the page from loading its own SKILL.md");

const contract=readUsabilityContract(join(ROOT,"site/skill-usability.json"),{citeId:"shadcn-blog"});
const server=createServer((request,response)=>{
 const markdown=["/SKILL.md","/shine-skill.md"].includes(request.url);
 const path=markdown?join(ROOT,"site",request.url.slice(1)):join(ROOT,"site/skill.html");
 response.writeHead(200,{"Content-Type":markdown?"text/markdown; charset=utf-8":"text/html; charset=utf-8","Content-Security-Policy":csp});
 response.end(readFileSync(path));
});

await new Promise((accept,reject)=>{server.once("error",reject);server.listen(0,"127.0.0.1",accept)});
try {
 const address=server.address();
 const result=await proveUsability({target:`http://127.0.0.1:${address.port}/skill`,contractPath:join(ROOT,"site/skill-usability.json"),citeId:"shadcn-blog"});
 if(result.status!==0||result.objects!==contract.objects.length) throw new Error("public skill usability proof returned an incomplete result");
 const browser=await load("playwright").chromium.launch();
 try {
   const context=await browser.newContext({permissions:["clipboard-read","clipboard-write"]});
   const page=await context.newPage();await page.goto(`http://127.0.0.1:${address.port}/skill`);
   await page.getByTestId("copy-skill").click();
   assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),bundled,"copy must contain the actual complete Markdown, not a placeholder or HTML response");
   const download=await page.request.get(`http://127.0.0.1:${address.port}/shine-skill.md`);
   assert.equal(await download.text(),bundled);
 }finally{await browser.close();}
 console.log(`public skill PASS: canonical Markdown + ${result.objects} objects + ${result.flows[0].steps} copy steps`);
} finally {
 await new Promise(resolveClose=>server.close(resolveClose));
}
