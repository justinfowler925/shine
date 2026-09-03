import { createHash } from "node:crypto";

export const stableHash = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

export async function capturePage(page) {
  const facts = await page.evaluate(() => {
    const visible = (el) => { const r=el.getBoundingClientRect(),s=getComputedStyle(el); return r.width>0&&r.height>0&&s.display!=="none"&&s.visibility!=="hidden"; };
    const box = (el) => { const r=el.getBoundingClientRect(); return { x:+(r.x/innerWidth).toFixed(3), y:+(r.y/innerHeight).toFixed(3), w:+(r.width/innerWidth).toFixed(3), h:+(r.height/innerHeight).toFixed(3), share:+(r.width*r.height/(innerWidth*innerHeight)).toFixed(3) }; };
    const regionEls=[...document.querySelectorAll("header,nav,aside,main,section,footer,form,table,[role=grid],[data-region]")].filter(visible);
    const regions=regionEls.map((el)=>({tag:el.tagName.toLowerCase(),role:el.getAttribute("role")||"",name:el.getAttribute("data-region")||el.getAttribute("aria-label")||el.querySelector("h1,h2,h3")?.textContent?.trim().slice(0,40)||"",box:box(el)}));
    const controls=[...document.querySelectorAll("button,a[href],input,select,textarea,[role=button]")].filter(visible).map((el)=>({tag:el.tagName.toLowerCase(),type:el.getAttribute("type")||el.getAttribute("role")||"",name:(el.getAttribute("aria-label")||el.textContent||"").trim().slice(0,40),box:box(el),radius:getComputedStyle(el).borderRadius}));
    const text=[...document.querySelectorAll("body *")].filter((el)=>visible(el)&&[...el.childNodes].some((n)=>n.nodeType===3&&n.textContent.trim()));
    const typography=[...new Set(text.map((el)=>{const s=getComputedStyle(el);return `${s.fontFamily}|${s.fontSize}|${s.fontWeight}|${s.letterSpacing}`}))].sort();
    const palette=[...new Set(text.flatMap((el)=>{const s=getComputedStyle(el);return [s.color,s.backgroundColor,s.borderColor]}).filter((c)=>c&&!/rgba\(0, 0, 0, 0\)|transparent/.test(c)))].sort();
    const spacing=[...new Set(regionEls.flatMap((el)=>{const s=getComputedStyle(el);return [s.gap,s.paddingTop,s.paddingRight,s.paddingBottom,s.paddingLeft]}).filter((v)=>v&&v!=="0px"))].sort();
    const radii=[...new Set([...document.querySelectorAll("button,input,select,table,section")].filter(visible).map((el)=>getComputedStyle(el).borderRadius))].sort();
    const signature=document.querySelector("[data-shine-signature]");
    const productPatterns=Object.fromEntries([...new Set([...document.querySelectorAll("[data-product-pattern]")].filter(visible).map((el)=>el.getAttribute("data-product-pattern")))].map((name)=>{
      const elements=[...document.querySelectorAll(`[data-product-pattern="${CSS.escape(name)}"]`)].filter(visible);
      const first=elements[0],style=getComputedStyle(first);
      const directChildren=[...new Set([...first.children].filter(visible).map((el)=>el.tagName.toLowerCase()))];
      const directControls=[...first.children].filter((el)=>el.matches("button,a[href],input,select,textarea,[role=button],[role=search]")).map((el)=>el.matches("[role=search]")?"search":el.tagName.toLowerCase()).sort();
      return [name,{count:elements.length,tag:first.tagName.toLowerCase(),directChildren,directControls,style:{display:style.display,gridTemplateColumns:style.gridTemplateColumns,padding:style.padding,borderRadius:style.borderRadius,backgroundColor:style.backgroundColor}}];
    }));
    const interactions={search:!!document.querySelector('input[type=search],[role=searchbox]'),sort:!!document.querySelector('[data-sort],[aria-sort]'),page:!!document.querySelector('[data-pagination],[aria-label*=pagination i]'),primary:!!document.querySelector('[data-primary],button[type=submit]'),form:!!document.querySelector("form"),rowAction:!!document.querySelector('[data-row-action],tbody a,tbody button')};
    const meaningful=(selector,minW,minH)=>[...document.querySelectorAll(selector)].filter((el)=>{const r=el.getBoundingClientRect();return visible(el)&&r.width>=minW&&r.height>=minH}).length;
    const body=getComputedStyle(document.body), root=document.documentElement;
    // Navigation can be a compact peer-control row (weekly owner roster, tabs,
    // breadcrumbs), not only a 100px-tall sidebar. Keep the width floor so an
    // incidental one-link wrapper cannot satisfy a page-level nav requirement.
    return {title:document.title,bodyFont:body.fontFamily,bodySize:body.fontSize,bodyBg:body.backgroundColor,bodyColor:body.color,regions,controls,typography,palette,spacing,radii,productPatterns,interactions,tableCount:document.querySelectorAll("table,[role=grid]").length,rowCount:document.querySelectorAll("tbody tr,[role=row]").length,chartCount:meaningful('svg,canvas,[data-chart],[role=img][aria-label*=chart i]',180,100),navigationCount:meaningful('nav,aside,[data-sidebar],[data-region*=navigation]',120,40),summaryCount:meaningful('[data-summary],[data-region*=summary],.metrics,.stats',160,60),toolbar:!!document.querySelector('[data-toolbar],.toolbar,[role=search]'),cite:root.getAttribute("data-cite")||document.body?.getAttribute("data-cite")||"",voice:root.getAttribute("data-shine-voice")||"",family:root.getAttribute("data-dna-family")||"",adaptation:root.getAttribute("data-shine-adaptation")||"",signature:signature&&visible(signature)?{name:signature.getAttribute("data-shine-signature")||"",text:signature.textContent.trim().slice(0,120),box:box(signature)}:null,textChars:(document.body.innerText||"").length,viewport:{w:innerWidth,h:innerHeight}};
  });
  const graph = facts.regions.map((r)=>`${r.tag}:${r.role}:${r.box.x},${r.box.y},${r.box.w},${r.box.h}`);
  facts.focalShare = Math.max(0,...facts.regions.map((r)=>r.box.share));
  facts.density = +((facts.textChars + facts.controls.length * 20) / (facts.viewport.w * facts.viewport.h) * 1000).toFixed(3);
  facts.structureFingerprint = stableHash({graph,controls:facts.controls.map((c)=>`${c.tag}:${c.type}`),interactions:facts.interactions,typography:facts.typography.map((t)=>t.split("|").slice(1).join("|")),spacing:facts.spacing,radii:facts.radii});
  return { facts, screenshot: await page.screenshot({ fullPage:true }) };
}
