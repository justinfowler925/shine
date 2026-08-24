#!/usr/bin/env node
import {cpSync, existsSync, mkdirSync, readFileSync, readlinkSync, renameSync, rmSync, symlinkSync, writeFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {execFileSync} from "node:child_process";
import {basename, dirname, join, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const SOURCE=resolve(dirname(fileURLToPath(import.meta.url)),".."),args=process.argv.slice(2),opt=n=>args.includes(n)?args[args.indexOf(n)+1]:"";
const root=resolve(opt("--root")||join(process.env.HOME||"",".local/share/shine"));
const install=!args.includes("--no-install");
const sourceManifest=join(SOURCE,"release.json");
const sha=existsSync(sourceManifest)?JSON.parse(readFileSync(sourceManifest,"utf8")).sha:execFileSync("git",["rev-parse","HEAD"],{cwd:SOURCE,encoding:"utf8"}).trim();
const release=join(root,"releases",sha),stage=join(root,"releases",`.${sha}.${process.pid}`),current=join(root,"current"),next=join(root,`.current.${process.pid}`);
const npmCli=process.env.SHINE_NPM_CLI||"/opt/homebrew/lib/node_modules/npm/bin/npm-cli.js";
const digest=file=>createHash("sha256").update(readFileSync(file)).digest("hex");
if(existsSync(release)){const manifest=JSON.parse(readFileSync(join(release,"release.json"),"utf8"));if(manifest.sha!==sha)throw new Error("release directory identity mismatch");}
else{
 mkdirSync(dirname(stage),{recursive:true});
 cpSync(SOURCE,stage,{recursive:true,filter:path=>!/(^|\/)\.git($|\/)|(^|\/)node_modules($|\/)/.test(path)});
 if(install){if(!existsSync(npmCli))throw new Error(`npm CLI missing: ${npmCli}`);execFileSync(process.execPath,[npmCli,"ci"],{cwd:stage,stdio:"inherit"});execFileSync(process.execPath,[npmCli,"ci","--ignore-scripts"],{cwd:join(stage,"verify/fixtures/integrations"),stdio:"inherit"});}
 const manifest={version:1,sha,createdAt:new Date().toISOString(),node:process.version,dependenciesInstalled:install,corpusSha256:digest(join(SOURCE,"corpus/templates.json")),skillSha256:digest(join(SOURCE,"skill/SKILL.md"))};
 writeFileSync(join(stage,"release.json"),JSON.stringify(manifest,null,2)+"\n");renameSync(stage,release);
}
rmSync(next,{force:true});symlinkSync(release,next);renameSync(next,current);
const installed=resolve(readlinkSync(current));
if(installed!==release)throw new Error(`atomic pointer mismatch: ${installed}`);
console.log(JSON.stringify({release,current,sha,node:process.version},null,2));
