# Knowledge system (Phase 1 scaffolding)

Small, source-backed principle records live in `principles/*.json`.
Retrieve with:

```sh
node knowledge/retrieve.mjs "records queue edit persist draft retry"
```

Kinds: `accessibility-requirement` | `strong-default` | `product-convention` | `experimental-hypothesis`.

Do not inject the entire corpus into every task — retrieval is bounded and task-keyed.
Promote lessons only after review; retain counterexamples.
