#!/usr/bin/env node
import {createServer} from "node:http";
import {readFileSync} from "node:fs";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {proveUsability, readUsabilityContract} from "./usability.mjs";

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const canonical=readFileSync(join(ROOT,"skill/SKILL.md"),"utf8");
const published=readFileSync(join(ROOT,"site/SKILL.md"),"utf8");
if(published!==canonical) throw new Error("public SKILL.md drifted from skill/SKILL.md");
const vercel=JSON.parse(readFileSync(join(ROOT,"vercel.json"),"utf8"));
const csp=vercel.headers.flatMap(rule=>rule.headers||[]).find(header=>header.key==="Content-Security-Policy")?.value||"";
if(!/connect-src\s+'self'/.test(csp)) throw new Error("site CSP blocks the page from loading its own SKILL.md");

const contract=readUsabilityContract(join(ROOT,"site/shine-usability.json"),{citeId:"shadcn-blog"});
const server=createServer((request,response)=>{
 const path=request.url==="/SKILL.md"?join(ROOT,"site/SKILL.md"):join(ROOT,"site/skill.html");
 response.writeHead(200,{"Content-Type":request.url==="/SKILL.md"?"text/markdown; charset=utf-8":"text/html; charset=utf-8","Content-Security-Policy":csp});
 response.end(readFileSync(path));
});

await new Promise((accept,reject)=>{server.once("error",reject);server.listen(0,"127.0.0.1",accept)});
try {
 const address=server.address();
 const result=await proveUsability({target:`http://127.0.0.1:${address.port}/skill`,contractPath:join(ROOT,"site/shine-usability.json"),citeId:"shadcn-blog"});
 if(result.status!==0||result.objects!==contract.objects.length) throw new Error("public skill usability proof returned an incomplete result");
 console.log(`public skill PASS: canonical Markdown + ${result.objects} objects + ${result.flows[0].steps} copy steps`);
} finally {
 await new Promise(resolveClose=>server.close(resolveClose));
}
