// Browser-side DataGrid contract evaluator. This function is self-contained so
// Playwright can serialize it into the product page.
export async function evaluateDataGrids() {
  const visible = (el) => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return s.display !== "none" && s.visibility !== "hidden" && r.width > 0 && r.height > 0;
  };
  const roots = [document];
  for (let i = 0; i < roots.length; i += 1)
    for (const el of roots[i].querySelectorAll("*")) if (el.shadowRoot && !roots.includes(el.shadowRoot)) roots.push(el.shadowRoot);
  const candidates = [];
  for (const root of roots) for (const el of root.querySelectorAll('table,[role="grid"],[data-shine-datagrid]')) {
    const role = el.getAttribute("role");
    const mode = el.getAttribute("data-shine-contract") || el.getAttribute("data-contract");
    if (role === "presentation" || role === "none" || mode === "layout" || mode === "presentation") continue;
    if (el.tagName === "TABLE" && el.querySelectorAll("thead th, tr:first-child > th").length < 2 && !mode) continue;
    if (!candidates.includes(el)) candidates.push(el);
  }
  const results = [];
  for (const grid of candidates) {
    const host = grid.closest("[data-grid]") || grid.closest("section,main") || grid.parentElement || document.body;
    const query = (s) => host.querySelector(s);
    const queryAll = (s) => [...host.querySelectorAll(s)];
    const rows = () => queryAll("tbody tr,[role=row]").filter((r) => !r.closest("thead") && visible(r)).map((r) => r.innerText).join("\n");
    const clickChanges = async (control, snapshot) => {
      if (!control || !visible(control)) return false;
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const before = snapshot();
        control.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, composed: true }));
        await new Promise((done) => setTimeout(done, 50));
        if (snapshot() !== before) return true;
      }
      return false;
    };
    const sortControl = grid.querySelector("thead button,[aria-sort] button,[data-sort],[role=columnheader] button,.ant-table-column-sorters") || grid.querySelector("[role=columnheader],th[aria-sort]");
    const sortSnapshot = () => `${rows()}|${queryAll("[aria-sort]").map((e) => e.getAttribute("aria-sort")).join()}`;
    const beforeSort = sortSnapshot();
    if (sortControl) sortControl.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, composed: true }));
    await new Promise((done) => setTimeout(done, 50));
    const sort = sortSnapshot() !== beforeSort || queryAll("[aria-sort]").some((el) => !["", "none"].includes(el.getAttribute("aria-sort") || ""));
    const search = query('input[type="search"],[role="searchbox"],[data-filter-input]');
    let filter = false;
    if (search && visible(search)) {
      const before = rows();
      const old = search.value;
      const setter = Object.getOwnPropertyDescriptor(search instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, "value")?.set;
      setter?.call(search, search.getAttribute("data-shine-probe-value") || "__shine_no_match__");
      search.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true, data: search.value, inputType: "insertText" }));
      search.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
      await new Promise((done) => setTimeout(done, 0));
      filter = rows() !== before;
      setter?.call(search, old);
      search.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true, data: old, inputType: "insertText" }));
      search.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
      await new Promise((done) => setTimeout(done, 0));
    }
    const next = query('[data-page-next],nav[aria-label*="page" i] button:last-of-type,[aria-label*="next page" i]');
    const page = query("[data-virtualized]") ? true : await clickChanges(next, rows);
    const header = grid.querySelector("thead,[role=row]:first-child") || grid.querySelector("th,[role=columnheader]");
    const sticky = Boolean(header && ([header, ...header.querySelectorAll("th,[role=columnheader]")].some((e) => getComputedStyle(e).position === "sticky") || grid.closest("[data-virtualized]")));
    const scroller = grid.closest("[data-grid-scroll],.table-container,.table-responsive") || grid.parentElement;
    const overflow = Boolean(scroller && (/auto|scroll/.test(getComputedStyle(scroller).overflowX) || scroller.scrollWidth <= scroller.clientWidth));
    const bodyRows = queryAll("tbody tr,[role=row]").filter((r) => !r.closest("thead") && !r.querySelector('[role="columnheader"]') && r.querySelector('td,[role="gridcell"],[role="cell"]') && visible(r));
    const state = (name) => Boolean(query(`[data-state="${name}"],[data-${name}]`));
    const rect = grid.getBoundingClientRect();
    results.push({
      selector: grid.id ? `#${grid.id}` : grid.tagName.toLowerCase(),
      title: Boolean(host.querySelector("h1,h2,h3,[data-grid-title]")),
      toolbar: Boolean(host.querySelector('[data-toolbar],[data-shine-toolbar],[role="search"]')),
      filter: filter && Boolean(host.querySelector('[data-clear-filters],[aria-label*="clear" i]')),
      sort, sticky, overflow,
      page: page && Boolean(host.querySelector('[data-page-size],[data-page-range],[data-total],[data-virtualized]')),
      resize: Boolean(host.querySelector('[role="separator"],[data-column-resize],[data-resizable="true"]')),
      rowActions: bodyRows.length > 0 && bodyRows.every((r) => r.querySelector('button,[role="button"],[aria-haspopup="menu"],[data-row-action]')),
      states: state("loading") && state("empty") && state("filtered-empty") && state("error") && Boolean(query('[data-retry],[role="alert"] button')),
      semantics: grid.tagName === "TABLE" || (grid.getAttribute("role") === "grid" && Boolean(grid.querySelector('[role="columnheader"]')) && Boolean(grid.querySelector('[role="gridcell"],[role="cell"]'))),
      remoteMode: [grid, host].some((el) => el.hasAttribute("data-client-mode") || el.hasAttribute("data-server-mode") || el.hasAttribute("data-shine-data-mode")),
      area: +(rect.width * rect.height / (innerWidth * innerHeight)).toFixed(3),
    });
  }
  return results;
}
