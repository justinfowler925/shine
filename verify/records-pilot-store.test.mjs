import assert from "node:assert/strict";
import {createRecordsStore} from "../benchmark/records-pilot/store.mjs";

const store = createRecordsStore();
assert.equal(store.list().length, 3);
const row = store.get("r1");
assert.equal(row.title, "Acme renewal");
assert.equal(row.revision, 1);

store.armSaveFailure();
await assert.rejects(() => store.save("r1", {notes: "draft"}), /save failed/);
assert.equal(store.get("r1").notes, "");

const saved = await store.save("r1", {notes: "draft kept after retry"});
assert.equal(saved.notes, "draft kept after retry");
assert.equal(saved.revision, 2);
assert.equal(store.get("r1").notes, "draft kept after retry");

await assert.rejects(
  () => store.save("r1", {notes: "stale"}, {expectedRevision: 1}),
  (err) => err.code === "STALE_WRITE",
);
await assert.rejects(
  () => store.save("r1", {title: ""}, {expectedRevision: 2}),
  (err) => err.code === "VALIDATION",
);

console.log("records-pilot-store.test.mjs: ok");
