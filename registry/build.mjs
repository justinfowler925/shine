#!/usr/bin/env node
// registry/build.mjs — emit the @shine shadcn registry from the token pipeline.
//
// The registry is a GENERATED artifact: it parses tokens/dist/{lane}/tokens.css
// (Terrazzo output) and resolves every alias to a literal, so a token edit in
// tokens/src propagates here with `npm run build && node registry/build.mjs`.
// Never hand-edit registry.json or site/r/*.json.
//
// Emits:
//   registry.json           GitHub-mode registry (npx shadcn add justinfowler925/shine/<item>)
//   site/r/registry.json    catalog for URL-mode namespace + MCP list/search
//   site/r/<item>.json      item JSON with file contents embedded

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");

// ---- parse Terrazzo tokens.css into { selector: { name: value } } ----------
function parseTokensCss(css) {
  const blocks = {};
  css = css.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const m of css.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
    const sel = m[1].trim();
    const vars = {};
    for (const v of m[2].matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) vars[v[1]] = v[2].trim();
    blocks[sel] = Object.assign(blocks[sel] ?? {}, vars);
  }
  return blocks;
}

// resolve var(--x) references to literals (values may chain)
function resolveAll(vars) {
  const out = {};
  const resolve = (val, depth = 0) => {
    if (depth > 8) throw new Error(`alias cycle: ${val}`);
    return val.replace(/var\(--([\w-]+)\)/g, (_, name) => {
      const next = vars[name];
      if (next === undefined) throw new Error(`unresolved alias --${name}`);
      return resolve(next, depth + 1);
    });
  };
  for (const [k, v] of Object.entries(vars)) out[k] = resolve(v);
  return out;
}

function lane(name) {
  const blocks = parseTokensCss(read(`tokens/dist/${name}/tokens.css`));
  const root = blocks[":root"] ?? {};
  const light = blocks['[data-theme="light"]']
    ? resolveAll({ ...root, ...blocks['[data-theme="light"]'] })
    : resolveAll(root);
  const dark = blocks['[data-theme="dark"]']
    ? resolveAll({ ...root, ...blocks['[data-theme="dark"]'] })
    : resolveAll(root);
  // personal lane is dark-first: :root IS dark, light lives in [data-theme="light"]
  return name === "personal"
    ? { dark: resolveAll(root), light }
    : { light: resolveAll(root), dark };
}

// ---- map shine semantics onto the canonical shadcn key set -----------------
// key set matches shadcn's own theme-* items (verified against the corpus:
// shadcn-registry/items/theme-stone.json)
function shadcnVars(v, chart) {
  const g = (k) => v[k] ?? null;
  const bg = g("shine-color-bg"), fg = g("shine-color-fg");
  const subtle = g("shine-color-bg-subtle"), border = g("shine-color-border");
  const entries = {
    background: bg,
    foreground: fg,
    card: subtle,
    "card-foreground": fg,
    popover: subtle,
    "popover-foreground": fg,
    primary: g("shine-color-primary"),
    "primary-foreground": g("shine-color-primary-fg"),
    secondary: subtle,
    "secondary-foreground": fg,
    muted: subtle,
    "muted-foreground": g("shine-color-fg-muted"),
    accent: subtle,
    "accent-foreground": fg,
    destructive: g("shine-color-danger"),
    border,
    input: border,
    ring: g("shine-color-ring"),
    radius: g("shine-radius-md"),
    "chart-1": g(chart[0]),
    "chart-2": g(chart[1]),
    "chart-3": g(chart[2]),
    "chart-4": g(chart[3]),
    "chart-5": g(chart[4]),
    sidebar: subtle,
    "sidebar-foreground": fg,
    "sidebar-primary": g("shine-color-primary"),
    "sidebar-primary-foreground": g("shine-color-primary-fg"),
    "sidebar-accent": subtle,
    "sidebar-accent-foreground": fg,
    "sidebar-border": border,
    "sidebar-ring": g("shine-color-ring"),
  };
  // brand has no status colors on purpose — omit rather than invent
  return Object.fromEntries(Object.entries(entries).filter(([, val]) => val != null));
}

// full --shine-* passthrough so var(--shine-*) works in consumer code
const shinePassthrough = (v) => Object.fromEntries(Object.entries(v).map(([k, val]) => [k, val]));

const personal = lane("personal");
const brand = lane("brand");

const PERSONAL_CHART = [
  "shine-color-primary",
  "shine-color-status-ok",
  "shine-color-status-warn",
  "shine-color-status-crit",
  "shine-color-fg-muted",
];
// brand palette only — no invented status colors
const BRAND_CHART = [
  "shine-color-brand-navy",
  "shine-color-brand-action",
  "shine-color-brand-anchor",
  "shine-color-brand-text-muted",
  "shine-color-brand-tint",
];

const themeVars = (l) => ({
  // wipe Tailwind's default palette: no off-system color left to reach for
  "color-*": "initial",
  "font-sans": l.light["shine-font-sans"] ?? l.light["shine-font-body"],
  ...(l.light["shine-font-mono"] ? { "font-mono": l.light["shine-font-mono"] } : {}),
  ...(l.light["shine-font-serif"] ? { "font-serif": l.light["shine-font-serif"] } : {}),
});

const cssVarsFor = (l, chart) => ({
  theme: themeVars(l),
  light: { ...shadcnVars(l.light, chart), ...shinePassthrough(l.light) },
  dark: { ...shadcnVars(l.dark, chart), ...shinePassthrough(l.dark) },
});

const HOMEPAGE = "https://github.com/justinfowler925/shine";
const R_URL = "https://shine-blond.vercel.app/r/{name}.json";

const swatchSource = read("registry/swatch.tsx");

const items = [
  {
    name: "shine",
    type: "registry:base",
    extends: "none",
    title: "shine",
    description:
      "The shine design system base: dark-first, dense, instrumental. Wipes the default palette; every value comes from the token source.",
    author: "shine",
    config: {
      // must be a style the default registry serves: bare registryDependencies
      // ("utils", "button") resolve to ui.shadcn.com/r/styles/{style}/{name}.json.
      // shine's identity lives in the tokens, not the style label.
      style: "new-york-v4",
      iconLibrary: "lucide",
      tailwind: { baseColor: "neutral" },
      registries: { "@shine": R_URL },
    },
    dependencies: ["tailwind-merge", "clsx", "tw-animate-css", "lucide-react", "tailwind-variants"],
    registryDependencies: ["utils"],
    cssVars: cssVarsFor(personal, PERSONAL_CHART),
    css: {
      '@import "tw-animate-css"': {},
      "@layer base": {
        "*": { "@apply border-border outline-ring/50": {} },
        body: { "@apply bg-background text-foreground": {} },
      },
    },
  },
  {
    name: "personal",
    type: "registry:theme",
    title: "shine / personal",
    description: "The personal lane: dark-first, ember accent, stone grays.",
    cssVars: cssVarsFor(personal, PERSONAL_CHART),
  },
  {
    name: "brand",
    type: "registry:theme",
    title: "shine / brand",
    description:
      "The brand-locked lane. Light-only on purpose — dark bands are palette sections, not a theme. No invented status colors.",
    cssVars: cssVarsFor(brand, BRAND_CHART),
  },
  {
    name: "swatch",
    type: "registry:ui",
    title: "Token Swatch",
    description: "Renders every semantic token as a labeled swatch. Install to eyeball a theme in situ.",
    registryDependencies: [],
    files: [{ path: "registry/swatch.tsx", type: "registry:ui", target: "components/ui/swatch.tsx" }],
  },
];

// ---- emit -------------------------------------------------------------------
const catalog = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "shine",
  homepage: HOMEPAGE,
  items,
};
writeFileSync(join(ROOT, "registry.json"), JSON.stringify(catalog, null, 2) + "\n");

mkdirSync(join(ROOT, "site/r"), { recursive: true });
writeFileSync(join(ROOT, "site/r/registry.json"), JSON.stringify(catalog, null, 2) + "\n");
for (const item of items) {
  const out = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    ...item,
    files: item.files?.map((f) => ({ ...f, content: swatchSource })),
  };
  if (!out.files) delete out.files;
  writeFileSync(join(ROOT, `site/r/${item.name}.json`), JSON.stringify(out, null, 2) + "\n");
}

console.log(`registry.json + site/r/{${items.map((i) => i.name).join(",")},registry}.json written`);
console.log(`personal dark bg=${personal.dark["shine-color-bg"]}  light bg=${personal.light["shine-color-bg"]}`);
console.log(`brand bg=${brand.light["shine-color-bg"]} (light-only)`);
