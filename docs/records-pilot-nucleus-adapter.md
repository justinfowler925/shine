# Records pilot → Nucleus-shaped consumer (S6)

**Goal:** Persist list / edit / fail / retry through a real adapter boundary toward Nucleus — not only the in-memory pilot store.

## What shipped

| Piece | Path |
|---|---|
| Adapter contract | `benchmark/records-pilot/adapters/contract.mjs` |
| Nucleus-shaped HTTP client | `benchmark/records-pilot/adapters/nucleus-shaped.mjs` |
| Local Operate records API | `benchmark/records-pilot/nucleus-api-server.mjs` |
| Pilot UI wiring | `benchmark/records-pilot/index.html?adapter=nucleus-shaped&api=…` |
| Unit + browser proof | `verify/records-pilot-nucleus-adapter.test.mjs`, `verify/records-pilot-nucleus-browser.mjs` |

## API shape (local harness)

```
GET   /api/operate/records
GET   /api/operate/records/:id
PATCH /api/operate/records/:id          # body may include fail:true once
POST  /api/operate/records/_harness/arm-fail   # local prove only
```

Role header for the harness: `X-Shine-Role: editor|viewer`.  
**Real Nucleus** uses the existing Workspace session cookie — Shine does not invent SSO bypasses. Swap `baseUrl` to the product origin when checkout + auth are available; drop the harness arm-fail route.

## Replay

```sh
npm run records-pilot:test
node verify/records-pilot-nucleus-adapter.test.mjs
node verify/records-pilot-nucleus-browser.mjs
```

## Non-claims

- No authenticated production Nucleus crawl or write.
- Harness `arm-fail` is local-only and must not ship in product routes.
