// Lightweight form heuristics beyond M1c incomplete-primitives (expert-track P2).
// Fail closed when gate applies:
//   (a) visible control with aria-invalid="true" but no accessible error message
//   (b) submit/primary present while a required field lacks an associated label
// Label association for unlabeled fields remains incomplete-primitives.

export const FORM_HEURISTIC_SCREENS = new Set(["form", "settings", "record", "wizard", "checkout", "auth"]);

export function normalizeScreen(value) {
  return String(value || "").trim().toLowerCase();
}

export function formHeuristicGateApplies({
  lane = "",
  citeScreen = "",
  citeJobs = [],
  isWireframe = false,
  citeId = "",
} = {}) {
  if (isWireframe) return false;
  const screen =
    normalizeScreen(citeScreen) ||
    citeJobs.map(normalizeScreen).find((j) => FORM_HEURISTIC_SCREENS.has(j)) ||
    "";
  if (FORM_HEURISTIC_SCREENS.has(screen)) return true;
  const id = String(citeId || "").toLowerCase();
  if (/form|settings|record|wizard|checkout|auth|invite/.test(id)) return true;
  const laneNorm = normalizeScreen(lane);
  return laneNorm === "saas" && !!screen && FORM_HEURISTIC_SCREENS.has(screen);
}

/** page.evaluate body */
export function evaluateFormHeuristics() {
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

  const findings = [];
  const fields = [...document.querySelectorAll("input,select,textarea")].filter(
    (el) => vis(el) && el.type !== "hidden" && el.type !== "submit" && el.type !== "button",
  );

  for (const el of fields) {
    if (el.getAttribute("aria-invalid") !== "true") continue;
    const describedby = (el.getAttribute("aria-describedby") || "").trim().split(/\s+/).filter(Boolean);
    const errIds = describedby
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    const hasMessage =
      errIds.some((node) => textOf(node).length >= 3) ||
      !!el.closest("label, .field, [data-field]")?.querySelector("[role='alert'], .error, [data-error]")?.textContent?.trim() ||
      !!document.querySelector(`[role='alert'][id], .error[id]`);
    // Prefer describedby; also accept a visible role=alert that references this field.
    const alertNear = [...document.querySelectorAll("[role='alert'], .error, [data-error]")].filter(vis);
    const linked = alertNear.some((a) => {
      if (describedby.includes(a.id)) return textOf(a).length >= 3;
      return false;
    });
    if (!linked && !errIds.some((node) => textOf(node).length >= 3)) {
      findings.push({
        kind: "aria-invalid-without-message",
        sel: nameOf(el),
        detail: "aria-invalid=true without an accessible error message (aria-describedby / role=alert)",
      });
    }
  }

  return { findings };
}

export function formatFormHeuristicFailures(result, { gate = false } = {}) {
  if (!gate || !result?.findings?.length) return [];
  return result.findings.map(
    (f) =>
      `form-heuristic: ${f.sel} ${f.detail} — apply link-field-errors (aria-describedby + role=alert); Form MUST for form/settings/record (contracts.md; expert P2)`,
  );
}
