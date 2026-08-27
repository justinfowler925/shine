export function assessStructure({ facts, screen, reference={}, lane="", brandLocked=false, brief="", prior=[] }) {
  const failures=[];
  const tableScreen=/^(queue|crud|dashboard)$/.test(screen);
  if (facts.regions.length < 2) failures.push(`structure: ${facts.regions.length} regions; expected a composed region graph`);
  if (facts.focalShare < 0.18) failures.push(`structure: focal region share ${facts.focalShare} < 0.18`);
  if (tableScreen) {
    if (!facts.tableCount) failures.push(`structure: ${screen} cite has no table/grid`);
    if (!facts.toolbar) failures.push(`structure: ${screen} cite has no toolbar`);
    if (!facts.interactions.search || !facts.interactions.sort || !facts.interactions.page || !facts.interactions.rowAction) failures.push(`interaction: ${screen} needs search, sort, pagination and row actions`);
    if (facts.rowCount < 2) failures.push(`structure: table-presence clone has ${facts.rowCount} row(s)`);
  }
  if (facts.controls.length && !facts.interactions.primary && !tableScreen) failures.push("interaction: controls exist but no primary action is identifiable");
  const counts={table:facts.tableCount,navigation:facts.navigationCount,chart:facts.chartCount,summary:facts.summaryCount,form:facts.interactions.form?1:0};
  for(const requirement of reference.required||[])if(!counts[requirement])failures.push(`reference: ${requirement} required by cited ${screen} structure`);
  const originalityApplicable=!brandLocked && lane!=="lex" && /^(marketing|saas)$/.test(lane);
  if (originalityApplicable && (!brief || !facts.signature?.name)) failures.push("originality: brief-specific visible signature required for saas/marketing");
  if (originalityApplicable && facts.signature && !facts.signature.text) failures.push("originality: signature region is empty");
  if (originalityApplicable && facts.signature) {
    const words=(value)=>String(value||"").toLowerCase().match(/[a-z0-9]+/g)||[];
    const briefWords=words(brief).map(w=>w.endsWith("s")?w.slice(0,-1):w).filter(w=>w.length>3);
    const signatureWords=new Set(words(`${facts.signature.name} ${facts.signature.text}`).map(w=>w.endsWith("s")?w.slice(0,-1):w));
    const sharedStem=(a,b)=>{let i=0;while(i<a.length&&i<b.length&&a[i]===b[i])i++;return i>=6};
    const ownsSubject=(briefWord)=>[...signatureWords].some(signatureWord=>signatureWord===briefWord||(briefWord.length>=5&&signatureWord.length>=5&&(briefWord.startsWith(signatureWord)||signatureWord.startsWith(briefWord)||sharedStem(briefWord,signatureWord))));
    if (briefWords.length && !briefWords.some(ownsSubject)) failures.push("originality: signature does not name the brief subject");
    if ((facts.signature.box?.share||0)<0.01) failures.push("originality: signature is an attribute stamp, not a meaningful region");
  }
  if (originalityApplicable) for (const item of prior) if (item.brief && item.brief!==brief && item.structureFingerprint===facts.structureFingerprint)
    failures.push(`originality: cross-brief structural clone of ${item.brief}`);
  return { failures, originalityApplicable, proof:{regionGraph:facts.regions,regionOrder:facts.regions.map((r)=>r.name||r.tag),focalShare:facts.focalShare,controlInventory:facts.controls,density:facts.density,keyInteractions:facts.interactions,referenceCounts:counts,brief,signature:facts.signature,structureFingerprint:facts.structureFingerprint,lane,brandLocked} };
}
