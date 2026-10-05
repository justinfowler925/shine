// App-shell content-share floor — fail closed for SaaS shells without requiring
// data-shine-probe="app-shell". Compact-vs-comfortable product density stays agent
// (skill/references/dashboards.md); this is chrome-vs-content only.

export const APP_SHELL_CONTENT_SHARE_FLOOR = 0.28;

/** Cite screens that are Operate shells — density applies without the probe. */
export const DENSITY_SHELL_SCREENS = new Set(["app-shell", "dashboard", "settings"]);

/** Lanes where chrome-heavy shells default to the density floor. */
export const DENSITY_OPERATE_LANES = new Set(["saas", "internal"]);

export function normalizeScreen(value) {
  return String(value || "").trim().toLowerCase();
}

export function isDensityShellScreen(screenOrKind) {
  return DENSITY_SHELL_SCREENS.has(normalizeScreen(screenOrKind));
}

export function isMarketingSurface({ citeId = "", screen = "" } = {}) {
  const id = String(citeId || "").toLowerCase();
  const scr = normalizeScreen(screen);
  return /marketing|hero/.test(id) || scr.startsWith("marketing") || scr === "hero";
}

function shellHintFromJobs(jobs = []) {
  for (const job of jobs) {
    if (isDensityShellScreen(job)) return normalizeScreen(job);
  }
  return "";
}

/**
 * Whether contentShare < APP_SHELL_CONTENT_SHARE_FLOOR hard-fails.
 *
 * Applies when:
 *   - data-shine-probe="app-shell" (legacy opt-in), or
 *   - cite screen/kind is app-shell | dashboard | settings (or a job with that name), or
 *   - lane is saas|internal and the cite is not a known non-shell surface
 *
 * Never applies to wireframes. Marketing surfaces skip the lane/cite path
 * (probe opt-in still bites so existing probe fixtures stay enforceable).
 */
export function densityGateApplies({
  lane = "",
  citeScreen = "",
  citeKind = "",
  citeJobs = [],
  appShellProbe = false,
  isWireframe = false,
  citeId = "",
} = {}) {
  if (isWireframe) return false;
  if (appShellProbe) return true;

  const screen = normalizeScreen(citeScreen) || shellHintFromJobs(citeJobs);
  const kind = normalizeScreen(citeKind);
  if (isMarketingSurface({ citeId, screen: screen || kind })) return false;
  if (isDensityShellScreen(screen) || isDensityShellScreen(kind)) return true;

  const laneNorm = normalizeScreen(lane);
  if (!DENSITY_OPERATE_LANES.has(laneNorm)) return false;

  // Operate lane without a resolved shell cite: fail closed when screen is unknown
  // (no cite / unresolved) so omitting the probe cannot dodge the floor. Known
  // non-shell screens (queue, form, auth, …) stay note-only.
  if (screen && !isDensityShellScreen(screen) && !isDensityShellScreen(kind)) return false;
  return true;
}

export function densityFailureMessage({ contentShare, chromeShare }) {
  return (
    `density: app-shell content share ${(contentShare * 100).toFixed(1)}% of viewport ` +
    `(chrome ${(chromeShare * 100).toFixed(1)}%) — content is losing to chrome; ` +
    `raise the main region's job or collapse nav (techniques.md §Hierarchy & density)`
  );
}
