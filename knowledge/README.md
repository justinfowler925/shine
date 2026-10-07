# Knowledge system (Phase 1 scaffolding)

Small, source-backed principle records live in `principles/*.json`.
Nucleus-weighted anti-patterns live in `anti-patterns/*.json` (S2).
ClearSpeed Operate **numbered constitution** lives in
`constitutions/clearspeed-operate.json` (enterprise §3) — packet
`ddr.constitutionIds` / `ddr.constitution[]`; critic must cite on
partial/blocked (`core/constitution.mjs`).
ClearSpeed Operate **edition sibling map** lives in
`editions/clearspeed-operate/siblings.json` (enterprise §4) — Nucleus / Sled
Capture surfaces for cite + kit selection (`core/edition-siblings.mjs`).
Proven job→cite→kit repertoire, episodic prove-fail lessons, Operate cite bans,
and edition anti-cites live in `repertoire/repertoire.json` (enterprise learn —
doctor-gated version bump; write bans only after real cite-related prove fails).

DDR Action/Observation audit trails (enterprise §5) live under
`SHINE_AUDIT_DIR` / `~/.cache/shine/audit/` via `core/audit-trail.mjs` — append-only
events + prove receipt hash; supersede don’t rewrite. See `docs/ddr-audit-trail.md`.

Retrieve with:

```sh
node knowledge/retrieve.mjs "records queue edit persist draft retry"
node knowledge/retrieve.mjs --anti "queue triage competing CTA card soup"
node core/constitution.mjs
node core/edition-siblings.mjs resolve --category queue --job "Decide Pursue/Review/Dismiss on the next notice"
node core/learn.mjs match --job "Decide Pursue/Review/Dismiss on the next notice" --category queue
node core/learn.mjs bans --category queue --edition clearspeed
```

Principle kinds: `accessibility-requirement` | `strong-default` | `product-convention` | `experimental-hypothesis`.

Anti-pattern kinds: `operate-bloat` | `craft-slop` | `interaction-fail`.

Do not inject the entire corpus into every task — retrieval is bounded and task-keyed.
Promote lessons only after review; retain counterexamples.
Commit repertoire/episodes/cite bans only with `doctorBiteOk` — never preference / RLAIF labels.
Measure cites machine-detectable ids via `anti-pattern:<id>` (see `verify/composition-slop.mjs`).
