# Phase 0 — selected pilot tasks

Frozen for Phase 0 exit. Do not swap these after baseline capture begins.

## Conventional — `records-inspect-edit-persist`

**Job:** Operate a record list, inspect one row, edit fields, and persist through the consumer’s data layer.

**Required states:** loading, empty, filtered-empty, populated, editing, validation-error, save-failed, saved, stale-write.

**Acceptance (observable):**

1. Two consumers (one product + one isolated fixture) complete list → detail → edit → persist with real adapter callbacks (no mock-only success).
2. Failed save keeps the draft and exposes retry; successful retry updates the list.
3. Role restriction hides a forbidden field or action without a second control system.
4. Upstream block upgrade can be reviewed without overwriting local edits (`upgrade.mjs` track + three-way path).
5. Browser usability contract exercises the happy path and at least one recovery path.

## Alexis multimodal — `alexis-chart-why-this`

**Job:** Shared chart task with voice/avatar context, selection, interruption, and typed handoff.

**Preserve unless Justin changes direction:** approved face, voice, and prominent Help presentation (see Alexis knowledge plan in Fowler Brain).

**Acceptance sketch (Phase 3 gate; Phase 0 only selects the task):**

1. Shared identifiers for task, artifact, selection, version, turn, action.
2. UI selection becomes bounded model context; model actions call typed validated commands.
3. Interrupt cancels stale narration/queued visual actions; user edits remain authoritative.
4. Media loss retains the task and exposes text/direct controls.

**Out of Phase 0:** paid vendor trials, avatar rebuild, speech transport inside Shine.
