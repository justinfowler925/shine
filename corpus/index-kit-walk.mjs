#!/usr/bin/env node
/**
 * Kit-walk catalog rows — HeroUI atoms + missing Tailwind-family pages.
 * Imported by index-templates.mjs. Justin override 2026-10-09: absorb kits
 * fully so cite can reconstruct HeroUI / Tailwind screens (structure; house
 * paint for Clearspeed consumers via kit affinity).
 *
 * Inventories: Project store internal/heroui-kit-inventory.md,
 * internal/tailwind-kit-inventory.md.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const SKIP_HEROUI = new Set(["rac", "icons.tsx", "index.ts"]);

/** Map HeroUI component folder → catalog screen + jobs. */
export function herouiScreenJobs(name) {
  const n = String(name || "");
  if (/^(button|close-button|toggle-button|toggle-button-group|button-group)$/.test(n)) {
    return { screen: "form", jobs: ["form", "chrome", "button", "heroui", n] };
  }
  if (/^(input|textarea|textfield|text-field|text-area|checkbox|checkbox-group|radio|radio-group|select|form|fieldset|label|description|error-message|field-error|number-field|search-field|input-group|input-otp|slider|switch|switch-group|autocomplete|combo-box)$/.test(n)) {
    return { screen: "form", jobs: ["form", "form-app", "input", "fields", "heroui", n] };
  }
  if (/^(date-|time-field|calendar|range-calendar)/.test(n) || n === "calendar" || n === "calendar-year-picker") {
    return { screen: "calendar", jobs: ["calendar", "form", "date", "heroui", n] };
  }
  if (/^(modal|drawer|popover|tooltip|toast|alert-dialog)$/.test(n)) {
    return { screen: "form", jobs: ["overlay", "dialog", "heroui", n] };
  }
  // table stays queue (worklist affinity). list-box/pagination are collection atoms —
  // not Operate worklists; avoid queue structural-signature (DataTable/Table) false fails.
  if (n === "table") {
    return { screen: "queue", jobs: ["queue", "table", "crud", "heroui", n] };
  }
  if (/^(list-box|list-box-item|list-box-section|pagination)$/.test(n)) {
    return { screen: "catalog", jobs: ["catalog", "collection", "list", "heroui", n] };
  }
  if (/^(tabs|breadcrumbs|accordion|disclosure|disclosure-group|link|header|toolbar)$/.test(n)) {
    // header is the HeroUI navbar atom (docs slug /navbar) — cite "heroui navbar" must hit it.
    const navJobs = n === "header" ? ["navbar", "nav", "header"] : [n];
    return { screen: "app-shell", jobs: ["app-shell", "navigation", "heroui", ...navJobs] };
  }
  if (/^(spinner|skeleton|progress-bar|progress-circle|meter|alert|empty-state)$/.test(n)) {
    return { screen: "async-state", jobs: ["async-state", "loading", "feedback", "heroui", n] };
  }
  if (/^(card|surface|separator)$/.test(n)) {
    return { screen: "catalog", jobs: ["catalog", "layout", "heroui", n] };
  }
  if (/^color-/.test(n)) {
    return { screen: "form", jobs: ["form", "picker", "color", "heroui", n] };
  }
  if (/^(menu|menu-item|menu-section|dropdown|tag|tag-group)$/.test(n)) {
    return { screen: "form", jobs: ["form", "menu", "collections", "heroui", n] };
  }
  if (n === "avatar" || n === "badge" || n === "chip") {
    return { screen: "record", jobs: ["record", "data-display", "heroui", n] };
  }
  if (n === "typography" || n === "kbd") {
    return { screen: "blog", jobs: ["typography", "heroui", n] };
  }
  return { screen: "form", jobs: ["component", "heroui", n] };
}

/**
 * @param {{ exists: (rel: string) => boolean, corpus: string }} ctx
 * @returns {object[]}
 */
/** Docs slug when the component folder name is not a public /docs/components/<slug> page. */
const HEROUI_DOCS_SLUG = {
  header: "navbar",
  "calendar-year-picker": "calendar",
  "date-input-group": "date-field",
  "color-input-group": "color-field",
  menu: "dropdown",
  "menu-item": "dropdown",
  "menu-section": "dropdown",
  "switch-group": "switch",
  tag: "chip",
  "list-box-item": "list-box",
  "list-box-section": "list-box",
};

/** No public HeroUI docs page and no honest parent demo — retire with reason. */
const HEROUI_NO_PUBLIC_DOCS = new Set(["empty-state"]);

/**
 * Alias folders that share a parent docs demo shot — keep the primary selectable,
 * retire aliases so cite inventory is not inflated with clone packs.
 * Primary kept: dropdown, list-box, chip, switch, calendar, color-field, date-field.
 */
const HEROUI_ALIAS_PARENT = {
  menu: "dropdown",
  "menu-item": "dropdown",
  "menu-section": "dropdown",
  "list-box-item": "list-box",
  "list-box-section": "list-box",
  tag: "chip",
  "switch-group": "switch",
  "calendar-year-picker": "calendar",
  "color-input-group": "color-field",
  "date-input-group": "date-field",
};

export function buildHeroUiAtomRows(ctx) {
  const root = join(ctx.corpus, "heroui/packages/react/src/components");
  if (!existsSync(root)) return [];
  const rows = [];
  for (const entry of readdirSync(root)) {
    if (SKIP_HEROUI.has(entry)) continue;
    const abs = join(root, entry);
    const isDir = statSync(abs).isDirectory();
    if (!isDir) continue;
    // Prefer the primary tsx named like the folder; else the directory itself.
    const base = `heroui/packages/react/src/components/${entry}`;
    const primary = [`${entry}.tsx`, "index.tsx", "index.ts"]
      .map((f) => `${base}/${f}`)
      .find((rel) => ctx.exists(rel));
    const path = primary || base;
    if (!ctx.exists(path)) continue;
    const id = `heroui-${entry}`;
    const { screen, jobs } = herouiScreenJobs(entry);
    const title = `HeroUI ${entry.replace(/-/g, " ")}`;
    const docsSlug = HEROUI_DOCS_SLUG[entry] || entry;
    const noDocs = HEROUI_NO_PUBLIC_DOCS.has(entry);
    const aliasOf = HEROUI_ALIAS_PARENT[entry];
    const retired = noDocs || Boolean(aliasOf);
    const retiredReason = noDocs
      ? "no public HeroUI docs page to harvest a real shot; use parent heroui-* or figma-heroui-*"
      : aliasOf
        ? `alias of heroui-${aliasOf} — shared parent docs demo shot; cite heroui-${aliasOf} instead`
        : undefined;
    rows.push({
      id,
      screen,
      kit: "heroui",
      title,
      path: ctx.exists(path) ? path : `heroui/packages/react/src/components/${entry}`,
      preview: noDocs ? "" : `https://www.heroui.com/docs/components/${docsSlug}`,
      license: "MIT",
      kind: "source",
      startFrom: 8,
      jobs,
      scope: "component",
      note: noDocs
        ? "No public HeroUI docs page for this atom; retired — use parent component cite or figma-heroui-*"
        : aliasOf
          ? `Retired alias — shared /${docsSlug} demo with heroui-${aliasOf}; do not cite as a distinct pack`
          : docsSlug !== entry
            ? `Kit-walk atom — docs demo at /${docsSlug} (folder ${entry} has no dedicated page); port to house shadcn`
            : "Kit-walk atom — structure from HeroUI; Clearspeed consumers port to house shadcn via kit affinity",
      ...(retired ? { selectable: false, retiredReason } : {}),
    });
  }
  return rows.sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Figma-harvested HeroUI packs under corpus/packs/figma-heroui-*.
 * Prefer-copy fileKey GAn1SrbKJYiKqz9SmHHCRm has the full 38-page tree
 * (use_figma figma.root.children) — MCP get_metadata without nodeId is incomplete.
 */
export function buildHeroUiFigmaPackRows(shineRoot) {
  const packsDir = join(shineRoot, "corpus/packs");
  if (!existsSync(packsDir)) return [];
  const rows = [];
  for (const entry of readdirSync(packsDir).sort()) {
    if (!entry.startsWith("figma-heroui-")) continue;
    const dir = join(packsDir, entry);
    if (!statSync(dir).isDirectory()) continue;
    if (!existsSync(join(dir, "shot.png"))) continue;
    let meta = {};
    try {
      meta = JSON.parse(readFileSync(join(dir, "meta.json"), "utf8"));
    } catch { /* optional */ }
    const page = meta?.capture?.figma?.page || entry.replace(/^figma-heroui-/, "");
    const nodeId = meta?.capture?.figma?.nodeId || "";
    const fileKey = meta?.capture?.figma?.fileKey || "GAn1SrbKJYiKqz9SmHHCRm";
    const kind = meta?.capture?.figma?.kind || "component";
    const slug = entry.replace(/^figma-heroui-/, "");
    const screen =
      kind === "cover" || /welcome|v3-cover|cover/.test(slug) ? "marketing"
      : kind === "tokens" || /theme/.test(slug) ? "catalog"
      : kind === "icons" || kind === "brand" || kind === "atoms" ? "catalog"
      : /table/.test(slug) ? "queue"
      : /calendar|date|input|select|checkbox|radio|switch|slider|form|otp|number/.test(slug) ? "form"
      : /tabs|navbar|link|breadcrumb|accordion/.test(slug) ? "app-shell"
      : /spinner|progress|skeleton|toast|alert/.test(slug) ? "async-state"
      : /card|carousel|avatar|badge|chip|user/.test(slug) ? "catalog"
      : "form";
    const jobs = ["heroui-figma", "figma-kit", slug, page.toLowerCase().replace(/\s+/g, "-"), kind];
    rows.push({
      id: entry,
      screen,
      // House paint (shadcn-zinc). Structure affinity still tags jobs with heroui-figma.
      kit: "shadcn-registry",
      title: `HeroUI Figma · ${page}${kind === "atoms" ? " (atoms)" : kind === "tokens" ? " (tokens)" : ""}`,
      // Blueprint source is corpus/blueprints/<id>.md (materialize); path marks the pack dir.
      path: `packs/${entry}`,
      preview: nodeId
        ? `https://www.figma.com/design/${fileKey}?node-id=${nodeId.replace(":", "-")}`
        : `https://www.figma.com/design/${fileKey}`,
      license: "MIT",
      kind: "blueprint",
      startFrom: kind === "cover" ? 2 : kind === "component" ? 6 : 4,
      jobs,
      // Token boards (radius/typography) are small sections — component floor applies.
      scope: kind === "cover" ? "page" : "component",
      note: "Figma Example/Theme harvest from prefer-copy GAn1Srb… (full 38-page tree) — structure only; paint house shadcn for Clearspeed",
      selectable: true,
    });
  }
  return rows;
}

/**
 * Full-kit Figma packs (M3 / TailGrids / Myna / Bootstrap) under corpus/packs/figma-*.
 * Discovers on-disk packs so the catalog tracks the harvest, not a hand list.
 * Selectability is decided by the caller via referenceHealth.
 */
export function buildFigmaKitPackRows(shineRoot, { prefixes = ["figma-m3-", "figma-tailgrids-", "figma-myna-", "figma-bootstrap-"] } = {}) {
  const packsDir = join(shineRoot, "corpus/packs");
  if (!existsSync(packsDir)) return [];
  const familyMeta = {
    m3: { label: "Material 3", jobTag: "material-figma", extraJobs: ["mui", "material3"] },
    tailgrids: { label: "TailGrids", jobTag: "tailwind-figma", extraJobs: ["tailgrids"] },
    myna: { label: "Myna UI", jobTag: "tailwind-figma", extraJobs: ["myna", "shadcn"] },
    bootstrap: { label: "Bootstrap 5", jobTag: "bootstrap-figma", extraJobs: ["bootstrap"] },
  };
  const rows = [];
  for (const entry of readdirSync(packsDir).sort()) {
    const prefix = prefixes.find((p) => entry.startsWith(p));
    if (!prefix) continue;
    const dir = join(packsDir, entry);
    if (!statSync(dir).isDirectory()) continue;
    if (!existsSync(join(dir, "shot.png"))) continue;
    let meta = {};
    try {
      meta = JSON.parse(readFileSync(join(dir, "meta.json"), "utf8"));
    } catch { /* optional */ }
    let manifest = {};
    try {
      manifest = JSON.parse(readFileSync(join(dir, "manifest.json"), "utf8"));
    } catch { /* optional */ }
    const family = prefix.replace(/^figma-/, "").replace(/-$/, "");
    const fam = familyMeta[family] || { label: family, jobTag: "figma-kit", extraJobs: [] };
    const slug = entry.slice(prefix.length);
    const page = meta?.capture?.figma?.page || meta?.title || slug.replace(/-/g, " ");
    const nodeId = meta?.capture?.figma?.nodeId || meta?.nodeId || "";
    const fileKey = meta?.capture?.figma?.fileKey || meta?.fileKey || "";
    const screen =
      manifest.screen
      || (/cover|welcome|thumbnail|hero|banner|cta|about|faq|marketing/.test(slug) ? "marketing"
        : /table|queue|pagination|list-group|data-table/.test(slug) ? "queue"
        : /sign-in|sign-up|auth|login/.test(slug) ? "auth"
        : /settings/.test(slug) ? "settings"
        : /chat/.test(slug) ? "chat"
        : /chart|stats/.test(slug) ? "charts"
        : /error|404|empty/.test(slug) ? "empty"
        : /alert|toast|spinner|progress|skeleton|sonner/.test(slug) ? "async-state"
        : /nav|tabs|breadcrumb|accordion|menubar|sidebar|drawer/.test(slug) ? "app-shell"
        : /input|form|button|checkbox|radio|select|switch|slider|modal|dialog|dropdown|textarea|toggle|tooltip|popover|calendar|otp/.test(slug) ? "form"
        : "catalog");
    const baseJobs = Array.isArray(manifest.jobs) && manifest.jobs.length
      ? [...manifest.jobs]
      : ["figma-kit", fam.jobTag, ...fam.extraJobs, slug, String(page).toLowerCase().replace(/\s+/g, "-")];
    // "tailgrids forms" must hit form-elements — include plural job tag.
    if (slug === "form-elements" || /form-elements/.test(slug)) {
      for (const j of ["forms", "form", "form-elements"]) {
        if (!baseJobs.includes(j)) baseJobs.push(j);
      }
    }
    const jobs = baseJobs;
    rows.push({
      id: entry,
      screen,
      kit: "shadcn-registry",
      title: `${fam.label} Figma · ${page}`,
      path: `packs/${entry}`,
      preview: fileKey && nodeId
        ? `https://www.figma.com/design/${fileKey}?node-id=${String(nodeId).replace(":", "-")}`
        : fileKey
          ? `https://www.figma.com/design/${fileKey}`
          : "",
      license: "n/a",
      kind: "blueprint",
      startFrom: /cover|welcome|thumbnail/.test(slug) ? 2 : 5,
      jobs,
      scope: /cover|welcome|thumbnail|hero|sign-in|settings|error/.test(slug) ? "page" : "component",
      note: `Full-kit Figma harvest (${fam.label}) — structure only; paint house shadcn for Clearspeed`,
      selectable: true,
      family,
    });
  }
  return rows;
}

/**
 * Full-page HeroUI next-app routes.
 * Marketing clones (home/about/docs/pricing) were harvested as one heroui.com
 * homepage PNG — retired until page-true unique shots exist. Blog kept only if
 * it has a distinct shot (not the homepage clone group).
 */
const HEROUI_MARKETING_CLONE_REASON =
  "homepage clone theater — docs/home/about/pricing shared one heroui.com PNG; retired until page-true unique shots are harvested";

export function buildHeroUiPageRows(ctx) {
  const pages = [
    { id: "heroui-home", screen: "marketing", path: "heroui-next-app/app/page.tsx", title: "HeroUI next-app home (marketing shell)", jobs: ["marketing", "landing", "heroui", "home"], rank: 4, clone: true },
    { id: "heroui-about", screen: "marketing", path: "heroui-next-app/app/about/page.tsx", title: "HeroUI next-app about", jobs: ["marketing", "about", "heroui"], rank: 5, clone: true },
    { id: "heroui-blog", screen: "blog", path: "heroui-next-app/app/blog/page.tsx", title: "HeroUI next-app blog", jobs: ["blog", "article", "heroui"], rank: 4, clone: false },
    { id: "heroui-docs", screen: "app-shell", path: "heroui-next-app/app/docs/page.tsx", title: "HeroUI next-app docs shell", jobs: ["app-shell", "docs", "heroui"], rank: 5, clone: true },
    { id: "heroui-pricing", screen: "pricing", path: "heroui-next-app/app/pricing/page.tsx", title: "HeroUI next-app pricing", jobs: ["pricing", "plans", "marketing", "heroui"], rank: 3, clone: true },
  ];
  return pages
    .filter((t) => ctx.exists(t.path))
    .map((t) => {
      const layout = "heroui-next-app/app/layout.tsx";
      const sources = ctx.exists(layout) ? [t.path, layout] : [t.path];
      return {
        id: t.id,
        screen: t.screen,
        kit: "heroui",
        title: t.title,
        path: t.path,
        preview: "https://www.heroui.com",
        license: "MIT",
        kind: "source",
        startFrom: t.rank,
        jobs: t.jobs,
        scope: "page",
        sources,
        entrypoints: sources,
        note: t.clone
          ? HEROUI_MARKETING_CLONE_REASON
          : "Kit-walk page — HeroUI next-app route (page + app layout for pack source floor)",
        ...(t.clone
          ? { selectable: false, retiredReason: HEROUI_MARKETING_CLONE_REASON }
          : {}),
      };
    });
}

/**
 * Missing Tailwind-family pages from internal/tailwind-kit-inventory.md.
 * Skip playground near-dups.
 */
export function missingTailwindPages() {
  return [
    // flowbite
    { id: "flowbite-sign-up", kit: "flowbite-admin", screen: "auth", rank: 7, path: "flowbite-admin/content/authentication/sign-up.html", preview: "https://flowbite-admin-dashboard.vercel.app/authentication/sign-up/", title: "Flowbite sign-up", jobs: ["auth", "signup", "sign-up", "register"] },
    { id: "flowbite-forgot-password", kit: "flowbite-admin", screen: "auth", rank: 8, path: "flowbite-admin/content/authentication/forgot-password.html", preview: "https://flowbite-admin-dashboard.vercel.app/authentication/forgot-password/", title: "Flowbite forgot password", jobs: ["auth", "forgot-password", "reset", "recovery"] },
    { id: "flowbite-reset-password", kit: "flowbite-admin", screen: "auth", rank: 9, path: "flowbite-admin/content/authentication/reset-password.html", preview: "https://flowbite-admin-dashboard.vercel.app/authentication/reset-password/", title: "Flowbite reset password", jobs: ["auth", "reset-password", "password", "recovery"] },
    { id: "flowbite-profile-lock", kit: "flowbite-admin", screen: "auth", rank: 10, path: "flowbite-admin/content/authentication/profile-lock.html", preview: "https://flowbite-admin-dashboard.vercel.app/authentication/profile-lock/", title: "Flowbite profile lock", jobs: ["auth", "lock-screen", "reauth", "session"] },
    { id: "flowbite-404", kit: "flowbite-admin", screen: "empty", rank: 4, path: "flowbite-admin/content/pages/404.html", preview: "https://flowbite-admin-dashboard.vercel.app/pages/404/", title: "Flowbite 404", jobs: ["empty", "404", "not-found", "error"] },
    { id: "flowbite-500", kit: "flowbite-admin", screen: "empty", rank: 5, path: "flowbite-admin/content/pages/500.html", preview: "https://flowbite-admin-dashboard.vercel.app/pages/500/", title: "Flowbite 500", jobs: ["empty", "500", "server-error", "error"] },
    { id: "flowbite-maintenance", kit: "flowbite-admin", screen: "empty", rank: 6, path: "flowbite-admin/content/pages/maintenance.html", preview: "https://flowbite-admin-dashboard.vercel.app/pages/maintenance/", title: "Flowbite maintenance", jobs: ["empty", "maintenance", "downtime", "status"] },
    // tailadmin
    { id: "tailadmin-signup", kit: "tailadmin-react", screen: "auth", rank: 4, path: "tailadmin-react/src/pages/AuthPages/SignUp.tsx", preview: "https://free-react-demo.tailadmin.com/signup", title: "TailAdmin sign-up", jobs: ["auth", "signup", "sign-up", "register"] },
    { id: "tailadmin-blank", kit: "tailadmin-react", screen: "empty", rank: 3, path: "tailadmin-react/src/pages/OtherPage/Blank.tsx", preview: "https://free-react-demo.tailadmin.com/blank", title: "TailAdmin blank page", jobs: ["empty", "blank", "starter", "canvas"] },
    { id: "tailadmin-not-found", kit: "tailadmin-react", screen: "empty", rank: 4, path: "tailadmin-react/src/pages/OtherPage/NotFound.tsx", preview: "https://free-react-demo.tailadmin.com/404", title: "TailAdmin not found", jobs: ["empty", "404", "not-found", "error"] },
    { id: "tailadmin-bar-chart", kit: "tailadmin-react", screen: "charts", rank: 4, path: "tailadmin-react/src/pages/Charts/BarChart.tsx", preview: "https://free-react-demo.tailadmin.com/bar-chart", title: "TailAdmin bar chart page", jobs: ["charts", "chart", "bar", "analytics", "dataviz"] },
    { id: "tailadmin-line-chart", kit: "tailadmin-react", screen: "charts", rank: 5, path: "tailadmin-react/src/pages/Charts/LineChart.tsx", preview: "https://free-react-demo.tailadmin.com/line-chart", title: "TailAdmin line chart page", jobs: ["charts", "chart", "line", "analytics", "dataviz"] },
    { id: "tailadmin-alerts", kit: "tailadmin-react", screen: "form", rank: 6, path: "tailadmin-react/src/pages/UiElements/Alerts.tsx", preview: "https://free-react-demo.tailadmin.com/alerts", title: "TailAdmin alerts gallery", jobs: ["component", "alert", "feedback", "banner", "tailadmin"] },
    { id: "tailadmin-avatars", kit: "tailadmin-react", screen: "record", rank: 5, path: "tailadmin-react/src/pages/UiElements/Avatars.tsx", preview: "https://free-react-demo.tailadmin.com/avatars", title: "TailAdmin avatars gallery", jobs: ["component", "avatar", "identity"] },
    { id: "tailadmin-badges", kit: "tailadmin-react", screen: "form", rank: 7, path: "tailadmin-react/src/pages/UiElements/Badges.tsx", preview: "https://free-react-demo.tailadmin.com/badge", title: "TailAdmin badges gallery", jobs: ["component", "badge", "status", "chip"] },
    { id: "tailadmin-buttons", kit: "tailadmin-react", screen: "form", rank: 8, path: "tailadmin-react/src/pages/UiElements/Buttons.tsx", preview: "https://free-react-demo.tailadmin.com/buttons", title: "TailAdmin buttons gallery", jobs: ["component", "button", "cta", "controls"] },
    { id: "tailadmin-images", kit: "tailadmin-react", screen: "catalog", rank: 7, path: "tailadmin-react/src/pages/UiElements/Images.tsx", preview: "https://free-react-demo.tailadmin.com/images", title: "TailAdmin images gallery", jobs: ["component", "image", "media", "gallery"] },
    { id: "tailadmin-videos", kit: "tailadmin-react", screen: "catalog", rank: 8, path: "tailadmin-react/src/pages/UiElements/Videos.tsx", preview: "https://free-react-demo.tailadmin.com/videos", title: "TailAdmin videos gallery", jobs: ["component", "video", "media", "player"] },
    // windmill
    { id: "windmill-forgot-password", kit: "windmill-react", screen: "auth", rank: 6, path: "windmill-react/src/pages/ForgotPassword.js", preview: "https://windmill-dashboard-react.vercel.app/forgot-password", title: "Windmill forgot password", jobs: ["auth", "forgot-password", "recovery"] },
    { id: "windmill-404", kit: "windmill-react", screen: "empty", rank: 5, path: "windmill-react/src/pages/404.js", preview: "https://windmill-dashboard-react.vercel.app/404", title: "Windmill 404", jobs: ["empty", "404", "not-found", "error"] },
    { id: "windmill-blank", kit: "windmill-react", screen: "empty", rank: 6, path: "windmill-react/src/pages/Blank.js", preview: "https://windmill-dashboard-react.vercel.app/app/blank", title: "Windmill blank", jobs: ["empty", "blank", "starter"] },
    { id: "windmill-buttons", kit: "windmill-react", screen: "form", rank: 7, path: "windmill-react/src/pages/Buttons.js", preview: "https://windmill-dashboard-react.vercel.app/app/buttons", title: "Windmill buttons gallery", jobs: ["component", "button", "cta"] },
    { id: "windmill-cards", kit: "windmill-react", screen: "catalog", rank: 6, path: "windmill-react/src/pages/Cards.js", preview: "https://windmill-dashboard-react.vercel.app/app/cards", title: "Windmill cards gallery", jobs: ["component", "card", "catalog"] },
    { id: "windmill-modals", kit: "windmill-react", screen: "form", rank: 8, path: "windmill-react/src/pages/Modals.js", preview: "https://windmill-dashboard-react.vercel.app/app/modals", title: "Windmill modals gallery", jobs: ["component", "modal", "overlay", "dialog"] },
    // untitled application without demos
    { id: "untitled-empty-state", kit: "untitled-ui-react", screen: "empty", rank: 3, path: "untitled-ui-react/components/application/empty-state/empty-state.tsx", preview: "https://www.untitledui.com/react/components/empty-states", title: "Untitled UI empty state", jobs: ["empty", "empty-state", "zero"] },
    { id: "untitled-modals", kit: "untitled-ui-react", screen: "form", rank: 5, path: "untitled-ui-react/components/application/modals/modal.tsx", preview: "https://www.untitledui.com/react/components/modals", title: "Untitled UI modals", jobs: ["overlay", "modal", "dialog"] },
    { id: "untitled-slideout", kit: "untitled-ui-react", screen: "form", rank: 6, path: "untitled-ui-react/components/application/slideout-menus/slideout-menu.tsx", preview: "https://www.untitledui.com/react/components/slideout-menus", title: "Untitled UI slideout menus", jobs: ["overlay", "sheet", "slideout", "drawer"] },
  ];
}
