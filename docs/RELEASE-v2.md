# Shine 2.0

Public notes for the V2 release. Architecture internals live in `research/world-class-spec.md`.

## What V1 shipped

A design system an agent cannot quietly leave: DTCG tokens, catalog cite, measure (styles, axe, contrast, composition), doctor as the wiring gate, kit-faithful DNA **labels**, Wireframe lock.

That was a strong **compliance** product. It was not yet a director. A Carbon datatable cite could still emit Geist, a zinc sidebar, and eight-pixel radii — and pass.

## What V2 ships

| Piece | Job |
|---|---|
| **DNA packs** | `corpus/packs/<id>/` — specimen HTML + expanded DNA + region occupancy. Opening a Preview URL is not enough. |
| **Executable voices** | `tokens/voices/<family>.css` remaps `--shine-*`. “Retune tokens” is no longer a slogan. |
| **Critic** | `verify/critic.mjs` scores likeness to the pack and names slop. A Carbon cite in shadcn chrome **fails**. |
| **Lanes** | `internal` · `saas` · `lex` · `marketing` — different quality bars. Glow is marketing DNA and a LEX fail. |
| **DESIGN.md** | Written at Wireframe lock. Art direction before code. |
| **Salesforce hosts** | Record / console / LWR / email / mobile. Name the host or fail. ~494px component width uses `@container`. |
| **Slop lint** | Cream-serif, indigo-default, purple-glow cannot be pragma-exempted. |

Install is unchanged: clone, symlink skill + `shine-ux`, wire hooks, `node verify/doctor.mjs`.

## Loop

```
job → lane → cite + DNA pack → DESIGN.md → (Wireframe | Build)
    → voice CSS → measure (compliance) → critic (taste + likeness)
    → ≤3 critic passes → stop
```

```sh
node corpus/cite.mjs queue
node verify/measure.mjs path/to/page.html --cite carbon-datatable --shot /tmp/shot.png
node verify/critic.mjs path/to/page.html --cite carbon-datatable --lane internal
node verify/doctor.mjs
```

## What this is not

- A scraper of Dribbble or Behance
- A promise that every screen will win Awwwards (that bar is **marketing / LWR** only)
- A second design system. House tokens remain the fallback voice; kit DNA is the default paint.

License: MIT (skill). Tokens and corpus pins stay SPDX-clean; AGPL / Commons Clause kits remain query-only.
