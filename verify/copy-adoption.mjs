// Lightweight copy / adoption DOM heuristics for measure + prove binding helpers.
// Machine gate = reliable DOM presence only. Belief honesty, ritual quality, and
// OCR stay agent (skill/references/copy.md, adoption.md).
//
// Heuristics (fail closed when the gate applies):
//   1. No document title and no visible H1 → page has no "what is this" anchor
//   2. Empty / stub instructional copy ("No data", blank empty-state body, etc.)
//
// Schema presence for diagnosis check fields lives in core/diagnosis.mjs.

export const COPY_HEURISTIC_LANES = new Set(["saas", "marketing"]);
export const COPY_HEURISTIC_SCREENS = new Set([
  "datagrid",
  "dashboard",
  "settings",
  "form",
  "record",
  "queue",
  "lex",
  "marketing",
  "catalog",
  "app-shell",
]);

export function normalizeScreen(value) {
  return String(value || "").trim().toLowerCase();
}

/**
 * Whether copy DOM heuristics hard-fail.
 * Wireframes skip. Applies when --lane saas|marketing, or cite screen is a known
 * Operate / marketing page. Missing lane + unknown cite → off (backward-compat).
 */
export function copyHeuristicGateApplies({
  lane = "",
  citeScreen = "",
  citeKind = "",
  isWireframe = false,
} = {}) {
  if (isWireframe) return false;
  const resolvedLane = normalizeScreen(lane);
  if (COPY_HEURISTIC_LANES.has(resolvedLane)) return true;
  const screen = normalizeScreen(citeScreen) || normalizeScreen(citeKind);
  return COPY_HEURISTIC_SCREENS.has(screen);
}

/**
 * page.evaluate body — title/H1 + stub instructional copy.
 * @returns {{ title: string, h1Count: number, h1Text: string, findings: Array<{kind:string,sel:string,detail:string}> }}
 */
export function evaluateCopyHeuristics() {
  // Inline constants — page.evaluate serializes the function only (no module closures).
  const emptyInstructional =
    /^(no data|n\/a|na|none|empty|coming soon|tbd|todo|placeholder|—+|-+|\.+|\u2026)$/i;
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
  };
  const nameOf = (el) =>
    el.tagName.toLowerCase() +
    (el.id ? `#${el.id}` : "") +
    (typeof el.className === "string" && el.className
      ? `.${el.className.split(/\s+/).filter(Boolean)[0] || ""}`
      : "");
  const textOf = (el) => (el?.innerText || el?.textContent || "").replace(/\s+/g, " ").trim();

  const title = (document.title || "").replace(/\s+/g, " ").trim();
  const h1s = [...document.querySelectorAll("h1")].filter(vis);
  const h1Text = h1s.map(textOf).filter(Boolean).join(" | ");

  const findings = [];
  if (!title && h1s.length === 0) {
    findings.push({
      kind: "missing-page-title",
      sel: "html",
      detail: "no document.title and no visible h1 — first-screen 'what is this' has no anchor",
    });
  } else if (!title && h1s.some((el) => !textOf(el))) {
    findings.push({
      kind: "empty-h1",
      sel: nameOf(h1s.find((el) => !textOf(el)) || h1s[0]),
      detail: "visible h1 is empty and document.title is blank",
    });
  }

  const emptyCandidates = document.querySelectorAll(
    [
      "[data-shine-empty]",
      "[data-empty-state]",
      ".empty-state",
      "[class*='empty-state' i]",
      "[class*='EmptyState']",
      "[role='status']",
    ].join(","),
  );
  for (const el of emptyCandidates) {
    if (!vis(el)) continue;
    const text = textOf(el);
    if (!text || emptyInstructional.test(text)) {
      findings.push({
        kind: "empty-instructional",
        sel: nameOf(el),
        detail: text
          ? `instructional empty-state copy is a stub (${JSON.stringify(text)})`
          : "empty-state region has no instructional copy",
      });
    }
  }

  // Primary CTAs with no accessible name (blank button / link styled as button).
  for (const el of document.querySelectorAll("a[href], button, [role='button']")) {
    if (!vis(el)) continue;
    const aria = (el.getAttribute("aria-label") || "").trim();
    const labelled = (el.getAttribute("aria-labelledby") || "").trim();
    const text = textOf(el);
    if (!aria && !labelled && !text) {
      // Icon-only unnamed is already incomplete-primitives; skip elements that only host an icon.
      if (el.querySelector("svg,img,[data-icon],.lucide")) continue;
      findings.push({
        kind: "blank-cta",
        sel: nameOf(el),
        detail: "interactive control has no visible or accessible label",
      });
    }
  }

  return { title, h1Count: h1s.length, h1Text, findings };
}

export function formatCopyHeuristicFailures(result, { gate = false } = {}) {
  if (!gate || !result?.findings?.length) return [];
  return result.findings.map(
    (f) => `copy: ${f.kind} (${f.sel}) — ${f.detail}`,
  );
}
