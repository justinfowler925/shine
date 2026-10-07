# Knowledge system (Phase 1 scaffolding)

Small, source-backed principle records live in `principles/*.json`.
Nucleus-weighted anti-patterns live in `anti-patterns/*.json` (S2).
Proven job→cite→kit repertoire + episodic prove-fail lessons live in
`repertoire/repertoire.json` (enterprise learn stub — doctor-gated version bump).

Retrieve with:

```sh
node knowledge/retrieve.mjs "records queue edit persist draft retry"
node knowledge/retrieve.mjs --anti "queue triage competing CTA card soup"
node core/learn.mjs match --job "Decide Pursue/Review/Dismiss on the next notice" --category queue
```

Principle kinds: `accessibility-requirement` | `strong-default` | `product-convention` | `experimental-hypothesis`.

Anti-pattern kinds: `operate-bloat` | `craft-slop` | `interaction-fail`.

Do not inject the entire corpus into every task — retrieval is bounded and task-keyed.
Promote lessons only after review; retain counterexamples.
Commit repertoire/episodes only with `doctorBiteOk` — never preference / RLAIF labels.
Measure cites machine-detectable ids via `anti-pattern:<id>` (see `verify/composition-slop.mjs`).
