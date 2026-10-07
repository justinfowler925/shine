/**
 * Isolated records pilot fixture — Phase 2 starting point / memory adapter.
 * Nucleus-shaped HTTP consumer: `adapters/nucleus-shaped.mjs` + local harness server.
 *
 * Rows carry a monotonic `revision` so consumers can prove stale-write recovery
 * (409 STALE_WRITE) the same way a real Operate PATCH would.
 */
export function createRecordsStore(seed = [
  {id: "r1", title: "Acme renewal", owner: "Alex", status: "open", notes: "", revision: 1},
  {id: "r2", title: "Beta expansion", owner: "Sam", status: "open", notes: "", revision: 1},
  {id: "r3", title: "Gamma risk", owner: "Alex", status: "blocked", notes: "waiting on legal", revision: 1},
]) {
  let rows = structuredClone(seed).map((row) => ({
    notes: "",
    revision: 1,
    ...row,
  }));
  let failNextSave = false;

  return {
    list() {
      return structuredClone(rows);
    },
    get(id) {
      const row = rows.find((item) => item.id === id);
      if (!row) throw Object.assign(new Error(`record ${id} not found`), {code: "NOT_FOUND"});
      return structuredClone(row);
    },
    /** @param {string} id @param {object} patch @param {{forceFail?: boolean, expectedRevision?: number}} [opts] */
    async save(id, patch, opts = {}) {
      if (failNextSave || opts.forceFail) {
        failNextSave = false;
        const err = new Error("save failed");
        err.code = "SAVE_FAILED";
        throw err;
      }
      const index = rows.findIndex((item) => item.id === id);
      if (index < 0) {
        throw Object.assign(new Error(`record ${id} not found`), {code: "NOT_FOUND"});
      }
      const current = rows[index];
      if (
        opts.expectedRevision != null &&
        Number(opts.expectedRevision) !== Number(current.revision)
      ) {
        const err = new Error("stale write — reload and retry");
        err.code = "STALE_WRITE";
        err.current = structuredClone(current);
        throw err;
      }
      const nextTitle = patch.title != null ? String(patch.title).trim() : current.title;
      const nextOwner = patch.owner != null ? String(patch.owner).trim() : current.owner;
      if (!nextTitle || !nextOwner) {
        const err = new Error("title and owner are required");
        err.code = "VALIDATION";
        throw err;
      }
      rows[index] = {
        ...current,
        ...patch,
        id,
        title: nextTitle,
        owner: nextOwner,
        notes: patch.notes != null ? String(patch.notes) : current.notes,
        revision: Number(current.revision) + 1,
      };
      return structuredClone(rows[index]);
    },
    armSaveFailure() {
      failNextSave = true;
    },
  };
}
