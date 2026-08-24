export function assessStructure({ facts, screen, lane="", brandLocked=false, brief="", prior=[] }) {
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
  const originalityApplicable=!brandLocked && lane!=="lex" && /^(marketing|saas)$/.test(lane);
  if (originalityApplicable && (!brief || !facts.signature?.name)) failures.push("originality: brief-specific visible signature required for saas/marketing");
  if (originalityApplicable && facts.signature && !facts.signature.text) failures.push("originality: signature region is empty");
  if (originalityApplicable) for (const item of prior) if (item.brief && item.brief!==brief && item.structureFingerprint===facts.structureFingerprint)
    failures.push(`originality: cross-brief structural clone of ${item.brief}`);
  return { failures, originalityApplicable, proof:{regionGraph:facts.regions,regionOrder:facts.regions.map((r)=>r.name||r.tag),focalShare:facts.focalShare,controlInventory:facts.controls,density:facts.density,keyInteractions:facts.interactions,brief,signature:facts.signature,structureFingerprint:facts.structureFingerprint,lane,brandLocked} };
}
