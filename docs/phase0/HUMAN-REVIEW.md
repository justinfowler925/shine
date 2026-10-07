# Phase 1 human judgment review

**Gap S5.** Machine judgment-eval is necessary but not sufficient. Live human scoring closes Phase 1.

| | |
| --- | --- |
| Pass floor | ≥ **7/8** usable without major redesign (two reviewers) |
| Rubric | [`../../benchmark/judgment/human-review-rubric.json`](../../benchmark/judgment/human-review-rubric.json) |
| Variants | [`../../benchmark/judgment/cases.json`](../../benchmark/judgment/cases.json) |
| Fixture sheets (schema only) | [`../../benchmark/judgment/fixtures/`](../../benchmark/judgment/fixtures/) |
| Held-out briefs | Sealed in `benchmark/expert-briefs.json` until Phase 5 |

Project-store operator pack (checklist + score template): ask the Shine Project for `docs/shine-phase1-human-review.md` if you are running outside this repo.

## Preflight

```sh
npm run judgment:test
node benchmark/judgment-eval.mjs
```

## Emit blinded packets

```sh
npm run judgment:blinded
# → benchmark/judgment/blinded/packets.json  (share with reviewers)
# → benchmark/judgment/blinded/key.json      (sealed until after scoring)
```

Score **packets only**. Do not open `cases.json` → `expected`, `key.json`, or fixture reviewer sheets while scoring.

## Score sheets

Use the JSON shape in `benchmark/judgment/fixtures/reviewer-a.json` (version 1, eight `reviews`, five dimensions). During a blinded run, set `variantId` to `R1`…`R8` to match `packets.json`.

Allowed scores: `usable` | `needs-minor-revision` | `major-redesign` | `critical-fail`.  
If `accessibility` or `control` is `critical-fail`, `overall` must be `critical-fail`.

## Validate

```sh
npm run judgment:review -- --validate path/to/reviewer-a.json path/to/reviewer-b.json
```

Exit 0 only when sheets validate and `meetsHumanFloor` is true.

## Non-claims

Fixture sheets proving the validator are **not** a live Phase 1 pass. Distribution / Alexis runtime remain separate.
