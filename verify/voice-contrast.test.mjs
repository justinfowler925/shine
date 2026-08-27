import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const source=readFileSync(new URL("../tokens/voices/ant.css",import.meta.url),"utf8");
const shadcn=readFileSync(new URL("../tokens/voices/shadcn-zinc.css",import.meta.url),"utf8");
const value=(name)=>source.match(new RegExp(`--shine-color-${name}:\\s*(#[0-9a-f]{6})`,`i`))?.[1];
const luminance=(hex)=>{const channels=hex.match(/[0-9a-f]{2}/gi).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*channels[0]+.7152*channels[1]+.0722*channels[2]};
const contrast=(a,b)=>{const values=[luminance(a),luminance(b)].sort((x,y)=>y-x);return (values[0]+.05)/(values[1]+.05)};
const ratio=contrast(value("primary"),value("primary-fg"));
assert(ratio>=4.5,`Ant primary action contrast ${ratio.toFixed(2)}:1 < 4.5`);
assert.match(source,/colorPrimaryActive #0958d9/,"accessible Ant derivation must stay documented");
assert.match(source,/fg-muted:\s*rgba\(0, 0, 0, 0\.65\)/,"Ant muted text must use colorTextSecondary, not the AA-failing tertiary token");
assert(contrast("#595959","#ffffff")>=4.5,"Ant muted text fails AA on its canvas");
assert.match(shadcn,/fg-muted:\s*light-dark\(oklch\(44\.2% 0\.017 285\.786\)/,"shadcn muted text must use zinc-600, not the measured-AA-failing zinc-500");
console.log(`voice contrast PASS: Ant primary action ${ratio.toFixed(2)}:1; Ant muted 7.00:1; shadcn muted zinc-600`);
