# Records pilot → Nucleus-shaped consumer (S6)

**Goal:** Persist list / edit / fail / retry through a real adapter boundary toward Nucleus — not only the in-memory pilot store. Deepened E2E covers the Phase 0 pilot-task state matrix without inventing SSO bypasses.

## What shipped

| Piece | Path |
|---|---|
| Adapter contract | `benchmark/records-pilot/adapters/contract.mjs` |
| Nucleus-shaped HTTP client | `benchmark/records-pilot/adapters/nucleus-shaped.mjs` |
| Local Operate records API | `benchmark/records-pilot/nucleus-api-server.mjs` |
| Pilot UI wiring | `benchmark/records-pilot/index.html?adapter=nucleus-shaped&api=…` |
| Unit + browser + doctor bite | `verify/records-pilot-nucleus-{adapter.test,browser,bite}.mjs` |

## Observable states (pilot-tasks)

| State | How proved |
|---|---|
| loading | UI `Loading records…` while list resolves (`?delayMs=`) |
| empty | Harness `--seed empty` → “No records yet.” |
| filtered-empty | Filter → clear recovery over HTTP `?q=` |
| populated | Three fictional rows via GET |
| editing | Open row → detail form |
| validation-error | Empty title → 400 `VALIDATION` + field error |
| save-failed | Harness arm-fail → 503 `SAVE_FAILED`, draft retained |
| saved | Retry PATCH; list title refresh; fresh GET confirms |
| stale-write | Revision / `If-Match` mismatch → 409; reload + retry |

## API shape (local harness)

```
GET   /api/operate/records[?q=][&delayMs=]
GET   /api/operate/records/:id
PATCH /api/operate/records/:id
      # body: fields + optional fail:true + revision
      # header If-Match: <revision>
POST  /api/operate/records/_harness/arm-fail   # local prove only
```

Role header for the harness: `X-Shine-Role: editor|viewer`.  
**Real Nucleus** uses the existing Workspace session cookie — Shine does not invent SSO bypasses. Swap `baseUrl` to the product origin and pass `credentials: "include"` when checkout + auth are available; drop the harness arm-fail route.

## Replay

```sh
npm run records-pilot:test
node verify/records-pilot-nucleus-adapter.test.mjs
node verify/records-pilot-nucleus-browser.mjs
node verify/records-pilot-nucleus-bite.mjs
```

Doctor (`verify/doctor.mjs`) invokes adapter + browser + bite under the expert/records block.

## Non-claims

- No authenticated production Nucleus crawl or write.
- Harness `arm-fail` is local-only and must not ship in product routes.
- Product route path may differ; adapter is Nucleus-**shaped**, not a cloned Nucleus handler.
