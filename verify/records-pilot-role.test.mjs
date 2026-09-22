import assert from "node:assert/strict";
import {createRecordsStore} from "../benchmark/records-pilot/store.mjs";
import {createRoleStore} from "../benchmark/records-pilot/store-role.mjs";

const editor = createRoleStore({role: "editor"});
assert.equal(editor.canSave(), true);
await editor.save("r1", {notes: "ok"});
assert.equal(editor.get("r1").notes, "ok");

const viewer = createRoleStore({role: "viewer", inner: createRecordsStore()});
assert.equal(viewer.canSave(), false);
assert.match(viewer.forbiddenReason(), /viewer/);
await assert.rejects(() => viewer.save("r1", {notes: "nope"}), /forbidden/i);
assert.equal(viewer.get("r1").notes, "");

console.log("records-pilot-role.test.mjs: ok");
