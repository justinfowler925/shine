/**
 * Second consumer adapter: role-gated wrapper over the in-memory store.
 * Viewer cannot persist; editor can. Forbidden save is explained, not silent.
 */
import {createRecordsStore} from "./store.mjs";

export function createRoleStore({role = "editor", inner = createRecordsStore()} = {}) {
  if (!["editor", "viewer"].includes(role)) throw new Error(`unknown role ${role}`);

  return {
    role,
    list() {
      return inner.list();
    },
    get(id) {
      return inner.get(id);
    },
    canSave() {
      return role === "editor";
    },
    forbiddenReason() {
      return role === "viewer" ? "Your role is viewer; saving is forbidden." : "";
    },
    async save(id, patch, opts = {}) {
      if (role === "viewer") {
        const err = new Error("Your role is viewer; saving is forbidden.");
        err.code = "FORBIDDEN";
        throw err;
      }
      return inner.save(id, patch, opts);
    },
    armSaveFailure() {
      if (typeof inner.armSaveFailure === "function") inner.armSaveFailure();
    },
  };
}
