# SHINE

[![License: MIT](https://img.shields.io/badge/license-MIT-stone.svg)](./LICENSE)
[![Release](https://img.shields.io/badge/release-v2.0.0-0c0a09.svg)](https://github.com/justinfowler925/shine/releases/tag/v2.0.0)
[![Site](https://img.shields.io/badge/site-shine--blond.vercel.app-0c0a09.svg)](https://shine-blond.vercel.app)
[![Skill](https://img.shields.io/badge/skill-%2Fshine-a8a29e.svg)](./skill/SKILL.md)
[![Doctor](https://img.shields.io/badge/doctor-local%20gate-16a34a.svg)](./verify/doctor.mjs)
[![Corpus](https://img.shields.io/badge/corpus-~1.2GB%20sparse-3f3f46.svg)](./skill/references/corpus.md)

**A design system agents can’t deviate from — and a UX director that looks at the rendered page, names what is wrong, matches a real template from the design kits, and proves the fix with pixels.**

Shine owns the token layer, the design corpus, the agent skill, and the measure loop. **V3** deleted the fiction V2 shipped — generated "DNA pack" stubs, a likeness score computed by grepping the page source for attributes, and a cite ritual policing files nobody could read (the full teardown is in [docs/audit-2026-08-21.md](./docs/audit-2026-08-21.md)) — and replaced it with retrieval that hands the agent something real: `corpus/cite.mjs` resolves a job in plain words to ≤3 templates, extracts registry JSON into readable source, and points at harvested screenshots as they land. New screens start in **Wireframe** (interactive discovery → gray-box HTML → locked brief + `DESIGN.md`). Existing surfaces run **look → name → match → restructure → repaint → prove (measure + compare)**. Hooks block off-token writes on Cursor and Codex; `doctor.mjs` proves the wiring bites.

**Site:** [shine-blond.vercel.app](https://shine-blond.vercel.app) · **Registry:** [`npx shadcn add`](https://shine-blond.vercel.app/r/) · **Repo:** [`justinfowler925/shine`](https://github.com/justinfowler925/shine) · **Release:** [v2.0.0](https://github.com/justinfowler925/shine/releases/tag/v2.0.0)

---

## What you get

| Layer | What it does |
| --- | --- |
| **UI/UX agent** | `/shine` skill + `shine-ux` subagent — Wireframe, Build, Polish, Audit, Copy, Adoption |
| **Templates** | `corpus/cite.mjs "<job>"` — 41 curated rows, synonym matching, registry JSON auto-extracted to readable source, harvested shots as Phase 2 lands |
| **Technique transfer** | Measured rules from 18 products + pinned kits (shadcn, Radix, Carbon, Ant, MUI, Spectrum, Fluent, APG, …) |
| **Tokens** | One DTCG source → CSS, Tailwind v4, artifacts, Python, email, Docs, Office, Salesforce |
| **Voices** | `tokens/voices/<family>.css` + the kit's own token sources — kit paint is legal via custom-property definitions |
| **Corpus** | `~/design-corpus` — sparse upstream source; `rg` before inventing any API |
| **Enforcement** | design-lint + stop-sweep, per-edit and turn-end, on both surfaces |
| **Verification** | `measure.mjs` (axe, per-pixel contrast, composition, family checks) + `compare.mjs` (side-by-side pixels, facts, no verdict) |
| **Doctor** | `verify/doctor.mjs` — wiring, gate bite (seeded violations), pack payload, compare mismatch |
| **Benchmark** | `benchmark/run.mjs` — 24 deterministic fixture-conformance pages using production cite retrieval. It does **not** run the model/shine-ux agent; the `9f6a2cf` arm is one bad fixture duplicated 24× and is ineligible for preference claims. |

---

## Modes

| Mode | When |
| --- | --- |
| **Wireframe** | New surface / no UI yet — discovery with cited options → gray-box → locked brief |
| **Build** | Paint under shine tokens from a locked brief (or existing shell) |
| **Polish** | Upgrade stubs in place; cite + remeasure |
| **Audit** | Score and report; change nothing unless asked |
| **Copy** | Presentation as argument — beliefs, sequence, slop tells |
| **Adoption** | Will anyone open it? Ritual, persona, path — first for internal tools |

Default: **Wireframe** if new; otherwise **Build** unless the ask is clearly a review.

**V2 notes:** [docs/RELEASE-v2.md](./docs/RELEASE-v2.md) · [CHANGELOG](./CHANGELOG.md)

---

## Install & deploy

Shine is not a daemon. **Deploy = immutable release + atomic current pointer + hooks + doctor.**
The native **Codex skill is canonical**. Cursor receives the same skill and a compatibility
agent generated from that release; it is not a second implementation. Plain **VS Code is not supported**
(no Agent Skills / Cursor-style hooks path). Copilot Chat / Windsurf / others are out of scope
unless they grow an equivalent skill + hook surface.

### 0. Prerequisites

- Node 20+ (`node`, `npm`)
- Git
- Codex and/or Cursor installed
- Optional for measure loop: Playwright Chromium (comes with `npm install` in this repo)

### 1. Clone and install

```sh
git clone https://github.com/justinfowler925/shine.git ~/Projects/shine
cd ~/Projects/shine && npm install
npm run build   # wraps tokens/ — emit both lanes
npm run verify  # wraps tokens/ — prove emit targets by computed value
```

Build a versioned release from a clean `main` checkout. The release contains its source SHA,
Node version, corpus digest, and skill digest; `current` is replaced atomically:

```sh
node scripts/release.mjs
export SHINE="$HOME/.local/share/shine/current"
```

Never point an installed skill at a feature checkout, detached worktree, or another tree's
`node_modules`. Skill text resolves tools from the loaded `current` symlink.

### 2. Codex

**Native skill + compatibility alias:**

```sh
mkdir -p ~/.agents/skills ~/.Codex/agents
ln -sfn "$SHINE/skill" ~/.agents/skills/shine
ln -sfn "$SHINE/agents/shine-ux.md" ~/.Codex/agents/shine-ux.md
```

**Hooks (enforcement — skill alone is not enough):** merge into `~/.Codex/hooks.json`
under `hooks` (create the file if missing). Point at the skill symlink, not a checkout:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "$HOME/.agents/skills/shine/run-hook.sh design-lint.mjs",
            "timeout": 15,
            "statusMessage": "shine design-lint"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "$HOME/.agents/skills/shine/run-hook.sh stop-sweep.mjs",
            "timeout": 20,
            "statusMessage": "shine stop sweep"
          }
        ]
      }
    ],
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "$HOME/.agents/skills/shine/run-hook.sh doctor.mjs --quiet",
            "timeout": 30,
            "statusMessage": "shine doctor"
          }
        ]
      }
    ]
  }
}
```

Restart Codex after creating `~/.agents/skills/` mid-session. Invoke **shine**. It executes
inside the current task; the `shine-ux` file exists only for backward compatibility.

Plugin path (optional): `hooks/hooks.json` is the portable PostToolUse/Stop hook
manifest. The user-level `settings.json` snippets above are what the
doctor checks on a normal laptop install.

### 3. Cursor

**Generated compatibility deployment:**

```sh
mkdir -p ~/.cursor/skills ~/.cursor/agents
ln -sfn "$SHINE/skill" ~/.cursor/skills/shine
ln -sfn "$SHINE/agents/shine-ux.md" ~/.cursor/agents/shine-ux.md
```

**Hooks:** merge into `~/.cursor/hooks.json` (Cursor blocks on **exit code 2**, not JSON
`decision`). Point at the **skill symlink**, not a checkout — `run-hook.sh` lives in
the loaded tree, so retargeting `~/.cursor/skills/shine` retargets the gates.

```json
{
  "afterFileEdit": [
    {
      "command": "$HOME/.cursor/skills/shine/run-hook.sh design-lint.mjs",
      "timeout": 15
    }
  ],
  "stop": [
    {
      "command": "$HOME/.cursor/skills/shine/run-hook.sh stop-sweep.mjs",
      "timeout": 30
    }
  ],
  "sessionStart": [
    {
      "command": "$HOME/.cursor/skills/shine/run-hook.sh doctor.mjs --quiet",
      "timeout": 30
    }
  ]
}
```

Reload Cursor (or restart) so hooks and skills pick up. Use **shine** / **shine-ux** on UI
tasks. New surfaces default to Wireframe.

### 4. VS Code and everyone else

| Surface | Skill | Agent | Lint hooks | Status |
| --- | --- | --- | --- | --- |
| Codex | `~/.agents/skills/shine` | `~/.Codex/agents/shine-ux.md` | `hooks.json` | **Supported** |
| Cursor | `~/.cursor/skills/shine` | `~/.cursor/agents/shine-ux.md` | `hooks.json` | **Supported** |
| VS Code (stock) | — | — | — | **Not supported** |
| VS Code + Copilot | — | — | — | **Not supported** |

There is no VS Code extension and no LSP. Tokens/registry still work in any app that
consumes `@shine` CSS or `npx shadcn add` — that is the **design system**, not the **agent**.

### 5. Design corpus (required for kit/API truth)

```sh
./corpus/acquire.sh ~/design-corpus
# pin to lockfile later:
./corpus/acquire.sh --restore ~/design-corpus
```

~1.2 GB sparse. Query with `rg` — see
`skill/references/corpus.md`.

### 6. Prove it is deployed

```sh
cd "$SHINE"
node verify/doctor.mjs
```

Expect PASS lines for: skill frontmatter, Cursor + Claude skill symlinks, `shine-ux` on both
surfaces, per-edit lint + stop sweep on both, session-start doctor, token emit, reference
map. Any FAIL means that surface is not actually in force.

```sh
node verify/doctor.mjs --full   # composition fixtures (launches Chromium)
```

Measure a page after Build:

```sh
node verify/measure.mjs /abs/path/to/page.html
```

### 7. Updating

```sh
git -C "$SHINE" fetch origin && git -C "$SHINE" checkout --detach origin/main
cd "$SHINE" && npm install && npm run build
node verify/doctor.mjs
npm run sync-consumers   # re-vendor token copies into consumer apps
```

Symlinks mean both IDEs read the new skill/agents immediately. No separate “publish”
step. GitHub Actions runs `doctor.yml` on a self-hosted runner when needed. Local `node verify/doctor.mjs` remains the session-start gate.

### 8. Consumers (tokens into apps)

```sh
npm run sync-consumers          # vendor via consumers.local (see consumers.example)
npm run sync-consumers -- --check
```

Registry install for a greenfield React app:

```sh
npx shadcn init https://shine-blond.vercel.app/r/shine.json
# catalog: https://shine-blond.vercel.app/r/
```

---

## Architecture

```
1. CORPUS      ~/design-corpus (pinned upstream)     → never invent an API
2. TOKENS      DTCG → CSS / Tailwind / artifact / py → one visual language
3. REGISTRY    @shine on shine-blond.vercel.app/r/   → installable themes + base
4. KNOWLEDGE   skill/ + references/                  → judgment, not just bans
5. ENFORCEMENT design-lint + stop-sweep (both IDEs)  → model can’t skip it
6. VERIFY      measure → axe → contrast → compose    → proof, not claims
```

Two lanes, one engine: `@shine/personal` (dark-first) and `@shine/brand` (brand-locked,
light-only). The brand lane ships placeholder values — point `SHINE_BRAND_OVERRIDE` at a
private palette and it builds into gitignored `tokens/local/`, never the tracked tree.
See [`tokens/README.md`](./tokens/README.md) § Private brand lanes.

---

## Status

| Check | How |
| --- | --- |
| Wiring + gates + tokens | `node verify/doctor.mjs` (and `--full` for composition fixtures) |
| GitHub Actions | `doctor` on every PR via the self-hosted runner (justin-macbook-shine) |
| License | MIT |
| Homepage | https://shine-blond.vercel.app |

---

## Docs map

| Path | Use |
| --- | --- |
| [`README.md`](./README.md) § Install & deploy | Codex + Cursor wiring; VS Code not supported |
| [`skill/references/wireframe.md`](./skill/references/wireframe.md) | Discovery → gray-box → locked brief |
| [`skill/references/`](./skill/references/) | Contracts, taste, kits, techniques, dashboards, … |
| [`agents/shine-ux.md`](./agents/shine-ux.md) | Thin executor subagent |
| [`research/director-plan.md`](./research/director-plan.md) | Director loop: job → diagnose → retrieve → DNA → prove |
| [`research/`](./research/) | Full measurements and ecosystem notes |

---

## Contributing / changing shine

1. Branch from `main` (shared checkouts: don’t reset hard).
2. Change skill, tokens, hooks, or verify.
3. Run `node verify/doctor.mjs` — this is the acceptance test.
4. PR → merge. Symlinks mean Cursor and Claude pick up `main` on pull.

Never add `paths:` / `globs:` to `skill/SKILL.md` frontmatter — a path-gated authority is an absent authority.

---

## License

[MIT](./LICENSE)

---

## Deep dive

> Historical research notes from V1/V2. The V2 'DNA pack / critic' design described below
> was measured as fiction and demolished on 2026-08-21 — see [docs/audit-2026-08-21.md](./docs/audit-2026-08-21.md)
> and [docs/unfuck-plan.md](./docs/unfuck-plan.md) for what replaced it.

Why this exists, corpus/token/registry research, enforcement detail, budgets, and earned traps — receipts for agents and humans.

### Origin

Multiple products, multiple visual languages, zero shared code. Brand tokens hand-transcribed into one app. A personal site carrying nine copies of the same `:root` block.

The `shine` skill is the design authority on both surfaces (`~/.agents/skills/shine` and
`~/.cursor/skills/shine` → `"$SHINE/skill"`). The `shine-ux` subagent
(`agents/shine-ux.md`, linked into `~/.cursor/agents` and `~/.Codex/agents`) is the
director — the parent launches it and does not freelance the loop. Tools resolve from
the loaded skill realpath, never a hardcoded checkout.

**The organizing insight:** shadcn's *default token values*, not its components, produce the homogeneous "AI look." Measured: every reference-grade accent sits at OKLCH chroma 0.13–0.24; Tailwind's `-600` row is 0.245–0.288. The tokens are the tell. So: wipe the defaults, own the token layer, enforce against rendered pixels.

### Architecture (research notes)

```
1. CORPUS      real library source on disk       → never hallucinate an API
2. TOKENS      one DTCG source → 7+ emit targets → one visual language
3. REGISTRY    your own shadcn namespace         → owning design
4. KNOWLEDGE   contracts + taste + navigation    → judgment, not just rules
5. ENFORCEMENT design-lint on every write        → model can't skip it
6. VERIFY      render → measure → critique       → proof, not claims
```

One plugin, `shine`. Iterate as a skills-dir plugin (`claude plugin init shine --with skills agents hooks`) — no install step, live `SKILL.md` edits. Promote to a marketplace later.

---

### 1. Corpus

Full clones **5.1 GB** → shallow **1.5 GB** → **sparse ~1.2 GB** (AdminLTE-list expansion
2026-08-12: Mantine, Chakra, HeroUI, Headless UI, Tremor, Blueprint, Park UI, RSuite,
Grommet, Ant Design Pro). Recharts and Motion dominate history; value dirs stay sparse.

shadcn specifically: the repo is 67 MB, the actual component set is **372 KB of TSX** or **550 KB as registry JSON**. Don't clone it — fetch the JSON. Docs come as raw markdown by appending `.md` to any docs URL.

**Acquisition gotchas.** shadcn's `/r/index.json` lists only 62 `registry:ui` items; the full 411-item manifest is the in-repo `apps/v4/registry.json`. Radix docs live in `radix-ui/website`, not `primitives`. Skip `tailwindcss.com` — 964 MB, no license. Motion and Recharts ship no in-repo docs.

**Home:** any machine with disk headroom for ~1.2 GB sparse clones.

**Query with ripgrep, not embeddings.** The real questions are "what props does `<XAxis>` take" — exact symbol lookups, which `rg` answers in milliseconds with file:line and zero staleness. Curated to source only the corpus is ~50–150 MB of real `.ts`/`.tsx`. Semantic search solves a problem that doesn't exist here.

**Serving: `git clone` on each machine.** Claude Code's native Read/Grep/Glob become the interface — full local speed, offline, nothing to keep alive. Rejected: network FS mounts, coupling the corpus to an app daemon, and standing up an MCP server just to serve files.

**No fine-tuning.** Fine-tuning teaches a distribution, not facts; the failure mode is confidently inventing a plausible prop that does not exist. Retrieval over pinned source beats a fine-tune here.

### Charts — the premise needs correcting

| Library | Latest | Released | State |
|---|---|---|---|
| visx | 4.0.0 | 2026-06-11 | Modernization only, zero new packages. One Airbnb engineer, 56 of 100 recent commits. `@visx/theme` never published to npm. |
| nivo | 0.99.0 | 2025-05 (14mo) | 24 unreleased commits. Fixes land, never ship. |
| D3 | 7.9.0 | 2024-03 (29mo) | Frozen because finished — it's math. But `@types/d3` is 33 months stale. |
| Observable Plot | 0.6.17 | 2025-02 (18mo) | 42 unreleased commits. A merge-clean 0.6.18 release PR has sat untouched for 4 months. Observable pivoted the company elsewhere. |
| **Recharts** | 3.10.1 | 2026-07-25 | **55M downloads/week** (~100× visx), commit today, **and it's what shadcn's charts already wrap.** |

visx and nivo occupy the same slot. **Depend on D3 (math + SSR) + Recharts (React); hold visx for custom work.** Vendor all four anyway — MIT, ~40 MB — but vendoring is not depending.

Two things none of them do: **dense time-series** (all SVG-first, dead at 10–20k nodes → uPlot or Lightweight Charts) and **SVG→PNG** (`@resvg/resvg-js` or `sharp`; load fonts explicitly). For static images, D3's pure-math modules are the strongest path — no DOM, deterministic, ~21 kB.

### License exclusions

Harvesting into a published registry is redistribution. Using ≠ redistributing.

| | Problem |
|---|---|
| **Aceternity UI** | Assumed MIT; **has no license at all.** No repo, no LICENSE. Terms claim ownership of all material and forbid redistribution. |
| **React Bits, Animate UI** | MIT **+ Commons Clause** — explicitly bars redistributing components "alone, in a bundle, or as a ported version." Exactly this use case. |
| **Origin UI** | Now `cosscom/coss` (Cal.com), **AGPL-3.0** default with `apps/ui/` carved out MIT. |
| **GSAP** | Free but not OSI. No forking, no redistribution, bans competing animation tools. |
| **tailwindcss.com** | 964 MB, no license file. |
| **Apple HIG** | Copyrighted, no grant. Read, never copy. |

Clean: Magic UI, Motion Primitives, Kibo, cult/ui, Kokonut, Eldora, Fancy Components (MIT), Tremor (Apache-2.0), and all of shadcn/visx/nivo/D3/Recharts.

## 2. Tokens

Emit targets (both lanes where applicable): CSS custom properties, Tailwind v4 `@theme`,
inline artifact CSS, Python constants, email (json + starter HTML), Google Docs Apps Script,
Office OOXML map, Salesforce transcription spec. Consumers vendor via `npm run sync-consumers`.

**Two non-negotiables:**

**`--color-*: initial` wipes Tailwind's default palette.** The "arbitrary values erode the token contract" critique mostly dissolves when there's no off-system value to reach for.

**Two layers, bridged by `@theme inline`.** Raw palette in `@theme`; semantic aliases in `@theme inline`; mode mapping in plain `:root` / `[data-theme="dark"]` properties that generate no utilities. Components only say `bg-surface text-fg`. Omitting `inline` is the #1 cause of "dark mode doesn't switch" in v4.

**Source: DTCG 2025.10 → Terrazzo.** The spec went final 2025-10-28. Terrazzo has resolvers, modes, and the only first-party Tailwind v4 emitter; Style Dictionary's own docs admit incomplete 2025.10 support and it has no resolver.
- ⚠️ `tr.designtokens.org` redirects to a draft stamped "do not implement." Use `designtokens.org/tr/2025.10/`.
- ⚠️ A bare hex is no longer a valid color — `$value` is `{colorSpace, components, alpha, hex}`.
- ⚠️ Verify whether `@terrazzo/plugin-tailwind` emits `@theme` or `@theme inline`; documented output shows plain `@theme` with literal values, which wouldn't support runtime switching.

**Palette:** OKLCH, fixed lightness ladder, chroma tapering at the ends, states derived with relative color syntax, themes collapsed with `light-dark()`. Gamut-clamp at build with `culori`. `@supports` with a custom property in the test always returns true — feature-detect with a literal.

**Contrast: gate on WCAG 2 AA, report APCA as advisory.** APCA was pulled from WCAG 3 in July 2023 and the April 2026 draft says the algorithm is undetermined. `apca-w3` is frozen since 2022 and carries a "Limited W3 License," not MIT. Use `chroma-js` — real `contrastAPCA()`, one dependency. (`culori` has no APCA; widely repeated and false.)

**Single-file artifacts: hand-written CSS.** Nesting and `:has()` went Baseline Widely in June 2026, subgrid in March; `@layer`, container queries, `color-mix()`, `oklch()` a year or more. `light-dark()` halves the theme code. `data-variant` attributes give a variant API identical at the call site — the same pattern shadcn adopted with `data-slot`. Zero JS, zero FOUC, and the tokens *are* the artifact. (`@tailwindcss/browser` is 282 KB with no `eval`/`fetch`, so technically inlinable — rejected for size, flash-of-unstyled on every load, and being explicitly not production-supported.)

**Version corrections:**
- `class-variance-authority` is pinned at 0.7.1 from **2024-11**; v1 has been beta 2+ years. Use **`tailwind-variants@3.3.1`** — has slots, which cva lacks and every multi-part component needs.
- Base UI renamed: `@base-ui-components/react` is dead at RC; live is **`@base-ui/react` v1.7.0**. It became shadcn's default base 2026-07-03.
- **`@tanstack/react-table@9.0.0` shipped 2026-08-04** and breaks everything. Pin `^8.21.3`.
- `tailwind-merge` must be `^3`. Tailwind 4.3.3, React 19.2.8, Next 16.3.0.

## 3. Registry

**`registry:base` with `extends: "none"` is an entire design language in one JSON file.** Its `config` sets style, icon library, base color, aliases, *and* registers your namespaces into a consumer's `components.json`. `cssVars` ships OKLCH tokens and can override Tailwind's own variables, not just add colors. `css` is recursive.

```
registry:base   @shine            config + tokens + css
registry:theme  @shine/brand brand-locked, pure cssVars
registry:theme  @shine/personal   the other lane
registry:ui     wrapped upstream       registryDependencies + cssVars override
```

Files dedupe by target path (last wins) and `cssVars`/`css` deep-merge — that's what makes wrapping upstream and overriding only tokens work.

**Host: a public GitHub repo with `registry.json` at root is itself a registry.** `npx shadcn add justinfowler925/shine/button#v1.0.0`, refs pinnable to tags or SHAs. Private namespaces work via `${ENV_VAR}` header expansion.

⚠️ You **must** serve a catalog at `/r/registry.json` or `list`, `search`, and every MCP browse tool silently return nothing while `add` works fine.
⚠️ `registry:base.config` is in the CLI's Zod schema but not the published JSON Schema. Validate with `shadcn registry validate`.

**Don't build an MCP.** shadcn ships an official one in the CLI, registry-agnostic — it reads `components.json#registries` from cwd. `npx shadcn@latest mcp init --client claude`.

## 4. Knowledge

Non-negotiables at the **top** of each `SKILL.md` — after compaction only the first 5,000 tokens of a skill are re-attached, 25,000 across all.

- `SKILL.md` — index and routing, under 500 lines (Wireframe / Audit / Build / Polish / Copy / Adoption)
- `references/contracts.md` — ported from the Cursor `ui-ux` skill, plus shadcn's own MIT Agent Skill (`skills/shadcn/rules/*.md`, Incorrect/Correct pairs)
- `references/taste.md` — the positive authority
- `references/corpus.md`, `color-type.md`, `motion.md`
- `references/voice.md` — any surface that speaks or listens. A voice layer is a summarizer with manners, never a screen reader: write-for-the-mouth rules, the LLM summarizer harness, playback-scoped command grammar. Every rule earned building two voice layers in one day (2026-08-05).
- `references/copy.md` — the Copy mode's rubric: the presentation layer as an argument. First principle is Hormozi's value equation (*$100M Offers*) rendered as the five beliefs a buyer must feel — outcome, works-for-*me*, soon, easy, worth-it/trust — each mapped to the element that carries it; a belief with no carrying element is a copy gap, same status as a token gap. Plus question-sequence layout, checkable rules from Ogilvy / Dunford / Miller / Wiebe / Heath / Cialdini / Sierra / Krug / JTBD / Schwartz, and 10 copy slop tells — the linguistic twin of the visual twelve.
- `references/dashboards.md` — any surface answering "what is happening and what do I do about it". The four questions every metric must answer, metric-card anatomy, direction as a per-metric property rather than a palette, drill-down models, forecast uncertainty, queue and alerting design, accountability surfaces, and eight dashboard myths that do not survive contact with their primary sources.
- `references/dataviz.md` — Cleveland & McGill's encoding ranking and what follows from it, the chart denylist *with the perceptual reason for each*, colour under CVD, and number formatting.
- `references/ai-surfaces.md` — any surface where a model does work a human is accountable for. Ten topologies, with chat named as the usual wrong answer; streaming, steerability, review gates, provenance, failure UX, handoff.
- `references/performance.md` — Core Web Vitals and the Miller/Card latency budgets, render thresholds (SVG → canvas → aggregate), the optimisation playbook in yield order.

**No `paths:` / `globs:` on this skill, ever.** Both scope it to matching files and Cursor then withholds it from every other context — a path-gated authority is an absent authority. This README recommended `paths: ["**/*.tsx", "**/*.css", "**/*.html"]` until 2026-08-08, which is precisely how the design authority went missing on a UI written inside a `.py`. `design-lint.mjs` hard-blocks the key and `verify/doctor.mjs` fails on it.

### Ingestion policy: numbers and rules, never layouts or images

Dribbble and Behance are out. Their terms forbid scraping and each shot is copyrighted by an individual, so nobody could grant rights — but the real reason is that **shots are posters, not software**: no empty states, no errors, no 200-row tables, fake data at perfect lengths. That's a large part of *why* generated UI looks the way it does. Browse galleries with your eyes.

What works instead, already proven: **measure production CSS.** ~4.5 MB extracted from 18 shipped products. A measurement is a fact, not a design. Re-runnable extractors exist in the session scratchpad.

**Three rulesets already written for agents** — the highest-value find of the research: `vercel-labs/web-interface-guidelines/AGENTS.md` (~150 numeric MUST/SHOULD/NEVER), `interfaces.rauno.me` (stricter, often disagrees with Vercel — keep both and note conflicts), `emilkowal.ski/ui/agents-with-taste` (already tables).

**Mine in order:** IBM Carbon (Apache-2.0, already emits DTCG, descriptions read as agent rules verbatim) → GitHub Primer (MIT, ships `$extensions["org.primer.llm"]` — rules written *for a model*, including a `size-fine`/`size-coarse` pointer-type split worth stealing) → Material 3 (Apache-2.0) → USWDS (CC0).

### What `taste.md` contains

Measured, not asserted:

- **Duration mode across 4.5 MB is exactly 150ms.** 100–150 micro, 150–250 standard, 200–300 overlays; exits ~20% faster than entrances.
- **Adjacent surfaces differ ~2pp of lightness** (range 1.6–3.9). Borders carry separation, not fills. ≥6pp is a smell.
- **The type scale is two ratios** — ~1.12 UI band, ~1.22 display. A single ratio is why generated scales feel wrong.
- **Tracking depends on size *and weight*.** At 32px, regular takes 1.6× more negative tracking than bold. Crosses negative at 20–24px, reaching −0.02 to −0.035em by 48px.
- **Line-height peaks at body size and falls both directions** — 1.33 @12 → 1.5 @16 → 1.0 @64. Floor 1.33. Dense UIs cut padding, never leading.
- **Accent chroma 0.13–0.24.** Tailwind's `-600` row is 0.245–0.288.
- **Shadows ≥2 layers, top-layer alpha ≤6% light, blur ≥8px carries negative spread ≈ −blur/4.** Tailwind's `shadow-lg` is 10% on both. Dark is the same geometry at ~4× alpha plus a 1px inner top highlight.
- **Elevation = hairline ring + blur layers + background ring.** A bare drop shadow leaves a mushy edge.
- **Radii nest as `child = parent − padding`** — shipped as literal `calc()` in Stripe and Liveblocks.
- **Correction:** "grays must be tinted" is 7-of-12 true. Vercel and Observable are chroma exactly zero on purpose. The invariant is hue-*consistency*, not hue-presence.
- **90 failure tells**, each written so a program can detect it.

## 5. Enforcement

The model can ignore a skill. It can't ignore a hook.

**Two gates × two surfaces = four wirings, plus the doctor at session start.**

| What | Claude Code | Cursor |
|---|---|---|
| per-edit lint (`hooks/design-lint.mjs`) | `PostToolUse` on `Edit|Write|MultiEdit` | `afterFileEdit` |
| turn-end sweep (`hooks/stop-sweep.mjs`) | `Stop` | `stop` |
| wiring check (`verify/doctor.mjs --quiet`) | `SessionStart` | `sessionStart` |

The sweep reads `git status --porcelain`, so it catches files written via Bash,
heredocs and generators — the per-edit lint never sees those. Claude Code blocks on
`{"decision":"block"}` on stdout; Cursor blocks on **exit code 2** with the reason on
stderr. One script per gate, two contracts inside it.

### The routine for changing shine

Every shine failure to date has been a wiring failure that printed nothing: the skill
scoped to six file extensions so it never loaded for UI inside a `.py`; the lint keyed
on the same extensions; Cursor never wired the lint at all; the sweep wired on one
surface with its own stale copy of the file list; the lint blocking the token layer it
depends on. All of them looked like "no findings". So:

```sh
node verify/doctor.mjs          # the full suite: wiring, both gates fed a known violation, token propagation
node verify/doctor.mjs --ci     # the machine-independent subset
```

**The local doctor is the gate for machine wirings; CI runs the `--ci` subset.**
`.github/workflows/` runs the `--ci` lane on the self-hosted runner (`justin-macbook-shine`;
hosted runners cannot start on this account — billing-locked by choice). That registration
followed the old repo object when this repo was scrubbed and recreated, so every run sat
`queued` until it expired while the runner reported itself healthy under the old name —
re-registered in #18; verify a runner by `gh api repos/O/R/actions/runners`, never by its
own config file. The machine-local checks (hook wirings, skill symlinks, vendored copies)
only ever execute on the laptop, which is why the token-freshness checks (every src token
present in every target, **and** every dimension's emitted value equal to source) live in
the doctor rather than only in CI.

It proves the gates *bite* rather than merely exist, and it fails when a consumer's
vendored token copy is stale. Run it after any change to a hook, the skill frontmatter,
or the tokens — and never claim shine is enforced without its output.

Consumers with no build step vendor `tokens/dist/<lane>/artifact.css` and own a
`--check` mode in `npm run sync-consumers` (via `consumers.local`). Add a
new consumer to the `consumers` list in `doctor.mjs` or its copy will go stale in
silence.

Off-the-shelf covers two of three: arbitrary Tailwind values via `eslint-plugin-better-tailwindcss` `no-restricted-classes` with regex `\[([^\[\]]*?)\](?!:)`; hardcoded CSS colors via `stylelint-declaration-strict-value` (known limit: `rgb(var(--x))` slips through). **Off-scale spacing, font-size cardinality, and radii consistency have no tool — write it, against computed values.**

`oxlint-tailwindcss@1.7.0` shipped 2026-08-04 with a literal "Design-System Discipline" rule category and reads your actual `@theme`. Exactly right, one maintainer, zero days old. Pin it, treat as bonus.

## 6. Verification

Serves the brain rule *verify the layer the user actually experiences* — and its corollary that grepping CSS proves nothing, because the string can be present and inert. **Measure the box.**

`npm install` at the repo root — Playwright, axe-core and sharp are declared in shine's own `package.json`. `verify/deps.mjs` resolves from that install.

```
render      Playwright — file://, or page.route() virtual origin for ESM
measure     getComputedStyle + getBoundingClientRect   ← the non-negotiable step
a11y        axe-core injected offline
contrast    per-pixel worst-case
regression  toHaveScreenshot, local baselines
lint        ~100 lines of scale/cardinality assertions on computed values
critique    screenshot → multimodal, max 3 passes, last
```

**Three findings that shape it.**

`file://` blocks ESM — `<script type="module">` fails CORS at origin `null`. Fix beats a dev server: `page.route('https://harness.local/**')` intercepts in-process. This also kills the case for Storybook/Ladle/Histoire.

**axe returns `incomplete`, not pass/fail, for text over a gradient** — so the most common designer contrast failure is the one the a11y tool refuses to answer. Method: read `color`, get the text box, set the text `visibility:hidden`, screenshot clipped to that box, decode via `OffscreenCanvas` in-page, contrast against every pixel. Report worst-case and p5, never the mean. On a real page this returned **1.00:1** where axe said nothing.

`document.fonts.ready` before any measurement, or you measure fallback-font geometry. And axe green ≈ **57%** of issues — 98% for contrast, **2.49% for keyboard navigation**.

Screenshot critique has prior art and a ceiling: *Vision-Guided Iterative Refinement* (arXiv 2604.05839) measures **+17.8% over three cycles, plateauing after ~3**, and found LoRA fine-tuning captured only 25% of the benefit. Cap at 3, run last, so the model critiques taste rather than re-deriving that contrast is 1.00.

---

## Distribution

Deploy the skill to every agent surface you use (Cursor and Codex both symlink one tree). Authoring into one IDE's skills folder alone is how parity breaks.

Design rules → `agent-rules/always/80-design-*.md` (four required frontmatter keys: `id`, `title`, `order`, `why`). `brain-build.py --write` compiles to `~/.claude/CLAUDE.md` and per-repo `.cursor/rules/`. Brain carries rules; the plugin carries corpus and contracts. Commit the brain **and** every repo whose generated files changed.

## Decisions

**Name:** `shine`. `/shine` in Claude Code, `@shine` as the registry namespace.

**House voice (fallback): dark-first, dense, instrumental, with editorial type discipline.** Kit-faithful cites carry their own DNA. Derived from dark operational tooling that ships daily — dense command surfaces, one accent, semantic status colors.

**Two lanes, one engine:** `@shine/brand` (brand-locked) and `@shine/personal`.

**One resolved tension:** `anti-patterns.md` bans "warm-cream + serif + terracotta" as slop, and `cca-f-exam-reference` is a 2,924-line warm-terracotta-on-paper system. The ban is right as a *default* — it's the most common LLM signature — and wrong as an absolute, because cca-f is a long-form reading surface. Scoped to product and marketing surfaces, explicitly permitted for reading surfaces.

## Ship order

1. **Kill the zero-state.** `claude plugin init shine`, port `component-contracts.md`, add shadcn's Agent Skill rules. Done when `/shine` works. ✅ shipped.
2. **One token source.** DTCG + Terrazzo → CSS vars + Tailwind `@theme`. Prove on a real multi-page site: nine `:root` blocks → one import, screenshot-diffed. ✅ shipped 2026-08-05 — `tokens/`, both lanes; pages pixel-identical after migration. Verified findings in `tokens/README.md`.
3. **`taste.md`.** ✅ shipped (`skill/references/taste.md`).
4. **Corpus.** Acquisition script + `corpus.lock` committed. ✅ shipped 2026-08-05 —
   49 pins at ~1.2 GB on the laptop, shadcn as 411 registry JSON items, `corpus/acquire.sh`
   (+ `--restore`), lockfile pins every SHA. Query guide: `skill/references/corpus.md`.
5. **Registry.** `registry:base` published; `npx shadcn add` works into a clean project.
   ✅ shipped 2026-08-05 — `registry/build.mjs` generates `registry.json` + `site/r/*.json`
   from `tokens/dist` so it cannot drift. Proven: init + add into a
   clean Vite project, computed values match source in light and dark.
6. **Enforcement, then the measure loop.** ✅ shipped 2026-08-05 — `hooks/design-lint.mjs`
   (PostToolUse) + `hooks/stop-sweep.mjs` (Stop), both proven to block bad writes and pass
   token-correct ones. `verify/measure.mjs` implements render → measure → axe → per-pixel
   contrast → scale lint; its first run caught a real 3.41:1 defect the token gate's 3.0
   threshold had passed (fixed at source, gate tightened to 4.5).

Only step 2 blocks anything downstream.

## Scope — all eight resolved

**In, decided:**

1. **Salesforce — in, as a palette target only.** Corrected after verifying against **SLDS 2** (GA Winter '26; Cosmos is a *theme* on it, not the system). My first pass said "token names map onto SLDS design tokens," which was wrong twice over: SLDS 1 design tokens (`--lwc-*`) are **formally deprecated and absent from SLDS 2 themes**, and overriding global `--slds-g-*` hooks is **explicitly prohibited** by Salesforce.

   The real leverage is small and good: the token chain resolves `r → g → s → c`, so overriding **~17 `--slds-r-color-brand-*` reference steps recolors the entire accent system across every component.** Salesforce ships a genuinely first-class contract for this — DTCG-compliant JSON, 717 tokens, dark values, deprecation flags, and a `cssProperties` allowlist per token. Consume `flat.json` as the authority; never hand-maintain a mapping.

   The hard limit is delivery, not design: **there is no supported org-wide CSS injection point in internal Lightning Experience.** `loadStyle` is component-scoped, and the only sanctioned global path is the Themes and Branding UI — a human clicking in Setup. So the Salesforce output is a **brand-palette spec an admin transcribes**, plus per-component CSS for LWCs we own. Same tier as email: constrained by the renderer.

   Budget for "our brand colors on Salesforce's design system," not "our design system on Salesforce." Roughly a day of emitter work. Full detail and this org's actual state in `research/salesforce.md`. ✅ shipped 2026-08-05 — `tokens/plugins/salesforce.mjs` emits the transcription spec (`salesforce.md`), the LWC `:host` fallback block (`salesforce.css`), and machine-readable `salesforce.json`. Authority is `@salesforce-ux/design-tokens@4.0.0` flat.json; the 17 brand steps keep Cosmos's lightness ladder re-seeded from `color.primary`, and the 23 recolored g-hooks are resolved from the authority file's own `var()` chains — no hand-maintained mapping.
2. **Google Docs first, Office second.** Reversed from my original ordering. Docs has no CSS and no token API — the emit target is an Apps Script that applies named paragraph/character styles, plus a template doc carrying the palette. Office (`.pptx`/`.docx`/`.pdf`) follows the same shape via the existing brand-plugin writers, pointed at the shared token source instead of hardcoded hexes. ✅ shipped 2026-08-05 — `docs.gs` (both lanes; fonts + colors only, because no type-scale tokens exist and an emitter must not invent one) and `office.json` (brand lane: OOXML theme slots + full literal map, the seam the writers consume).
3. **Email — in.** One of nine emit targets: tables, inline styles, no custom properties, no flexbox in Outlook. Tokens compile to a literal-value inliner; the constraint is the renderer, not the design. ✅ shipped 2026-08-05 — `email.json` (inliner map) + `email.html` (bulletproof 600px starter, CTA copy rules baked into the placeholder text). The plugin asserts its own constraints at build, and `npm run verify` renders the emitted starter and reads the CTA's computed background.
4. **Migration — active.** Consumer apps vendor shine tokens via `npm run sync-consumers` and a local `consumers.local` map (`consumers.example`). Alias bridges keep app-local names pointed at `--shine-*`.
5. **Interface copy — in.** Cheap and high-leverage: a reference file of label, error, empty-state and loading conventions. Vague button labels are among the loudest amateur tells and cost nothing to fix. ✅ shipped 2026-08-05 as `skill/references/copy.md`, and it grew past label conventions into a fourth skill mode: the whole presentation layer read as an argument, with Hormozi's five buyer beliefs as the first principle and the microcopy conventions folded into its element checklist.
6. **Keyboard choreography — in, as contracts.** Most of it already exists in the ported component contracts (focus order, traps, escape behavior). Automation catches 2.49%, so this stays a written standard checked by review, not a linter.
7. **Imagery — in, and specifically anti-stock.** Stock photography is a uniformity tell in exactly the way default tokens are. The rule set defines what to use instead: real product surfaces, generated texture and gradient fields, data as ornament, and typographic covers. No people-pointing-at-laptops, ever.
8. **Performance budget — in, and it doubles as the context budget.** See below.

## Budgets

Two of them, and the second is the one that matters day to day.

**Ship budget.** CSS ≤ 20 KB gzip. JS ≤ 40 KB gzip for an app route, 0 KB for a document or artifact. Fonts ≤ 2 files. No dependency enters without a measured gzip number — the corpus makes heavy things easy to reach for, and three.js alone is 22.6 MB unpacked.

**Context budget — the answer to "does this raw-dog my agent window."** It does not, by construction.

Only the skill *index* is ever resident: 255 lines, ~14 KB, still inside the 5,000-token window that survives compaction. Everything else sits on disk and is read on demand, one file at a time, only when the task touches it. A typical UI task runs `node corpus/cite.mjs <screen>`, opens those corpus files, then one reference. Do not load all 27. The full corpus is ~1.2 GB on disk (49 pins after AdminLTE-list expansion) and contributes **zero tokens** until ripgrep returns a specific match, which is why retrieval beat embeddings here.

Hard caps, from the platform's own limits: `SKILL.md` under 500 lines, non-negotiables in the first 5,000 tokens because that's all that survives compaction, 25,000 tokens total across all re-attached skills. Detail belongs in `research/`, never in the index.

This is also why the research below is on disk rather than in this README.

## research/

Everything the plan compressed out, kept whole. Loaded only when relevant.

| File | What's in it |
| --- | --- |
| `research/taste.md` | The positive authority. Measured token values from 18 shipped products, 40 checkable rules, and the 84-item failure taxonomy — each written so a program can detect it. |
| `research/motion.md` | Duration and easing token set, Material 3's actual published values, browser Baseline status per feature, and the correct `prefers-reduced-motion` implementation (reduced, not none). |
| `research/color-type.md` | OKLCH palette method, contrast policy, the size-and-weight tracking curve, fluid scales, typeface shortlist, and the icon stroke-to-grid ratio rule. |
| `research/ecosystem.md` | Registry map with license status, the primitive-layer comparison, charting maintenance data, and the design systems worth mining ranked by numeric density. |
| `research/verification.md` | The measure loop, tool versions, and the specific traps — including three false readings my own harness produced. |
| `research/corpus.md` | Clone manifest with sparse paths, footprint numbers, and the acquisition script. |
| `research/salesforce.md` | SLDS 2 token tiers and what's actually overridable, the delivery constraint, `slds-linter` in CI, and the inventory to run against a target org before scoping anything. |

## Done means

1. `/shine` works; `claude plugin validate --strict` clean.
2. Design-lint blocks a bad write (`#ff0000`, `p-[13px]`) and passes a token-correct one.
3. One token change propagates to all emit targets — verified by rendering each and reading computed values, not grepping for the hex (seven targets in the personal-lane proof; the brand-lane-only Salesforce/Office emits self-validate at build and were mutation-proven once).
4. A component installed via `npx shadcn add` into a clean project renders correct tokens in light and dark.
5. A multi-page site regenerated, screenshot-diffed, contrast measured per-pixel on gradient text.
6. `brain-build.py` exits 0; Claude Code and Cursor both carry the design rules.

## Fix first


## Traps

- **HTML/CSS inside a host-language string** (Python/Go/Ruby templates) needs careful escaping; render, then `node --check` on any embedded JS.
- **Plugin agents silently ignore `hooks`, `mcpServers`, `permissionMode`.** Enforcement goes in plugin-level `hooks/hooks.json`.
- **Creating `~/.claude/skills/` mid-session needs a restart.**
- **Marketplace installs copy the plugin**, breaking relative `../` refs. Symlink shared files.
- **Figma's Variables REST API is Enterprise-only**, both directions. Confirm seat status before scoping any Figma work.
