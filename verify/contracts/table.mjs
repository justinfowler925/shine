// Capability vocabulary only. Executable proof lives in table-quality.mjs.
export const DATAGRID_CAPABILITIES = Object.freeze([
  "source", "pattern", "sort", "search", "filter", "pagination", "visibility",
  "rowAction", "loading", "empty", "filteredEmpty", "error", "retry", "keyboard",
]);
export function dataGridContractGaps(result) {
  return DATAGRID_CAPABILITIES.filter(capability => result?.[capability] !== true);
}
// Read-only discovery/geometry. Never infer working behavior from DOM attributes.
export function evaluateDataGrids() {
  return [...document.querySelectorAll('table,[role="grid"],[data-shine-datagrid]')]
    .filter(el => el.matches('[role="grid"],[data-shine-datagrid]') || el.querySelectorAll('th,[role="columnheader"]').length >= 2 || el.querySelector('button,input,select'))
    .map(el => {const r=el.getBoundingClientRect(); return {
      selector:el.id ? `#${CSS.escape(el.id)}` : el.tagName.toLowerCase(),
      area:+(r.width*r.height/(innerWidth*innerHeight)).toFixed(3),
    };});
}
