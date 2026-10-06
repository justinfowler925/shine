# Nucleus consumer — `@shadcn/lint` recipe

**Milestone:** N1 / D2 (denoise easy kit)  
**Consumer:** [justin-fowler_cspd/nucleus](https://github.com/justin-fowler_cspd/nucleus)  
**Package:** `@shadcn/lint@0.2.0` (ESLint flat config only — **one** primary Tailwind DS lint; do not also add Oxlint / Biome TW plugins)

Stops hex / off-token / component-restyle re-pollution in Operate UI. Complements the changed-line `ui:clearspeed` gate (raw color / font / `transition: all` on touched lines). Shine `measure` / `prove` remain gate of record for structure and job.

## Install (Nucleus)

```bash
npm i -D @shadcn/lint@0.2.0
```

Requires ESLint ≥9.30 (Nucleus already ships ESLint 10 + `typescript-eslint`). Reuse `tseslint.parser` — no need for a second `@typescript-eslint/parser` install if `typescript-eslint` is present.

## Clearspeed token map

Nucleus Tailwind uses the `nx` prefix (`components.json` → `tailwind.prefix`). Theme colors are declared in `src/styles/tailwind.css` `@theme inline`, bound to Shine Clearspeed brand roles from `src/styles/shine-tokens.css`.

| Prefer (utilities) | Role | Avoid |
|---|---|---|
| `nx:bg-primary` / `nx:text-primary` | Brand navy / action roles via `@theme` | `nx:bg-pink-500`, indigo placeholders, raw `#hex` in className |
| `nx:bg-background` | Canvas | `nx:bg-[var(--shine-color-brand-canvas)]` when `@theme` already maps it |
| `nx:text-foreground` | Body text | Arbitrary shine text vars for the same role |
| `nx:text-muted-foreground` | Secondary text | — |
| `nx:border-border` | Hairline | — |
| `nx:bg-muted` | Subtle canvas | — |
| `nx:border-input` | Form chrome (declare `--color-input` in `@theme`) | Undeclared `input` token |
| `nx:bg-(--shine-color-brand-action)` | Signal Orange when no `@theme` alias yet | `nx:bg-[#ED5925]` |

Brand accent remains **Signal Orange** `#ED5925` / hover `#D24A1B` from `brand.json` — never invent indigo. Prefer `@theme` aliases; CSS-var shorthands `nx:bg-(--shine-*)` are acceptable bridges. Prefer migrating `nx:*-[var(--shine-*)]` → `@theme` tokens over time.

## ESLint flat-config snippet

Merge into Nucleus `eslint.config.mjs` (keep the existing correctness baseline). Scope `@shadcn/lint` to `src/components/**` at **warn** first; ratchet to `error` per rule when clean.

```js
import tseslint from "typescript-eslint";
import { plugin as shadcn } from "@shadcn/lint";

// …existing correctness config…

export default [
  // …existing blocks…
  {
    files: ["src/components/**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { shadcn },
    settings: {
      shadcn: {
        ui: "@/components/ui",
        note:
          "Clearspeed Operate: prefer @theme tokens in src/styles/tailwind.css (nx:bg-primary, nx:text-muted-foreground, nx:border-border). Brand accent is Signal Orange via shine tokens — never indigo placeholders.",
      },
    },
    rules: {
      "shadcn/no-raw-colors": [
        "warn",
        {
          // Product CSS module classes (not Tailwind palette).
          allow: ["text-button"],
        },
      ],
      "shadcn/no-arbitrary-values": [
        "warn",
        {
          allow: [
            "layout",
            // Transitional Shine/Clearspeed CSS-var bridges.
            "*-[var(--shine-*)]",
            "*-[family-name:var(--shine-*)]",
            "*-[inset_*_var(--cs-*)]",
          ],
        },
      ],
      "shadcn/no-restyle": [
        "warn",
        {
          allow: ["layout"],
          componentImports: ["^@/components/ui(?:/|$)"],
          contracts: [
            {
              pattern: "^Table(Head|Cell)$",
              allow: ["layout", "typography", "nx:tabular-nums", "empty-cell"],
            },
            {
              pattern: "^Button$",
              allow: ["layout", "w-full", "nx:w-full", "nx:py-2", "py-2", "btn"],
            },
            {
              pattern: "^Textarea$",
              allow: ["layout", "typography", "nx:font-mono", "font-mono"],
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/components/ui/**/*.{js,jsx,ts,tsx}"],
    rules: {
      "shadcn/no-restyle": "off",
      "shadcn/no-arbitrary-values": "off",
    },
  },
];
```

## Ratchet

1. **warn** on `src/components/**` (this recipe).  
2. Keep `npm run lint` green (`--max-warnings 0` once baseline is clean, or pin a measured cap while migrating).  
3. Promote each rule to **error** when that rule’s warning count hits zero.  
4. Do **not** install Oxlint / Biome / a second TW DS plugin alongside this — single primary stack.

## Agents

After UI edits under `src/components/**`, run `npm run lint` and fix new `@shadcn/lint` findings. Do not widen `allow` for raw palette colors without a documented design exception.

## Related

- Profile: `skill/references/clearspeed/profile-instructions.md`  
- Brand palette: `skill/references/clearspeed/brand.json`  
- Local token sync: `consumers.example` → `consumers.local`  
- Upstream: https://github.com/shadcn-ui/lint
