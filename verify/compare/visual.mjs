export async function palette(sharp, buf) {
  const {data,info}=await sharp(buf).resize(64,64,{fit:"inside"}).raw().toBuffer({resolveWithObject:true}); const counts=new Map();
  for(let i=0;i+2<data.length;i+=info.channels){const key=[data[i],data[i+1],data[i+2]].map((c)=>Math.min(255,Math.round(c/24)*24)).join(",");counts.set(key,(counts.get(key)||0)+1)}
  const total=[...counts.values()].reduce((a,b)=>a+b,0); return [...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5).map(([rgb,n])=>({rgb:`rgb(${rgb})`,pct:Math.round(n/total*100)}));
}
export async function pixelCalibration(sharp, a, b) {
  const aa=await sharp(a).resize(64,64,{fit:"fill"}).raw().toBuffer(),bb=await sharp(b).resize(64,64,{fit:"fill"}).raw().toBuffer(); let changed=0,max=0;
  for(let i=0;i<Math.min(aa.length,bb.length);i++){const d=Math.abs(aa[i]-bb[i]);if(d>1)changed++;max=Math.max(max,d)} return {changedChannels:changed,maxChannelDelta:max,baseline:changed===0&&max===0};
}
export function assessVisual({facts,row,tokens=""}) {
  const failures=[]; const family=row?.dna?.family||"",strict=Boolean(row?.reference?.required?.length);
  if(strict&&!facts.voice)failures.push("visual: data-shine-voice must declare kit-faithful or adapted");
  if(strict&&facts.voice==="adapted"&&!facts.adaptation)failures.push("visual: adapted work must name its structural adaptation in data-shine-adaptation");
  if(strict&&facts.voice==="kit-faithful"&&family&&!facts.family)failures.push(`visual: kit-faithful work must declare data-dna-family=${family}`);
  if(facts.voice==="kit-faithful"&&family&&facts.family&&facts.family!==family) failures.push(`visual: kit-faithful family is ${facts.family}; cite is ${family}`);
  const font=(tokens.match(/--shine-font-sans:\s*([^;]+)/)||[])[1]; if(facts.voice==="kit-faithful"&&font){const first=font.split(",")[0].replace(/["']/g,"").trim().toLowerCase();if(first&&!facts.bodyFont.toLowerCase().includes(first))failures.push(`visual: body font ${facts.bodyFont}; kit font ${font.trim()}`)}
  return {failures,proof:{geometry:facts.regions.map((r)=>r.box),typography:facts.typography,palette:facts.palette,spacing:facts.spacing,radii:facts.radii,body:{font:facts.bodyFont,size:facts.bodySize,bg:facts.bodyBg,fg:facts.bodyColor}}};
}
