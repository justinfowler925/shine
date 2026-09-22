/**
 * Isolated records pilot fixture — Phase 2 starting point.
 * Synthetic in-memory adapter; replace with consumer data layer in product integrations.
 */
export function createRecordsStore(seed = [
  {id: "r1", title: "Acme renewal", owner: "Alex", status: "open", notes: ""},
  {id: "r2", title: "Beta expansion", owner: "Sam", status: "open", notes: ""},
  {id: "r3", title: "Gamma risk", owner: "Alex", status: "blocked", notes: "waiting on legal"},
]) {
  let rows = structuredClone(seed);
  let failNextSave = false;

  return {
    list() {
      return structuredClone(rows);
    },
    get(id) {
      const row = rows.find((item) => item.id === id);
      if (!row) throw new Error(`record ${id} not found`);
      return structuredClone(row);
    },
    /** @param {string} id @param {object} patch @param {{forceFail?: boolean}} [opts] */
    async save(id, patch, opts = {}) {
      if (failNextSave || opts.forceFail) {
        failNextSave = false;
        const err = new Error("save failed");
        err.code = "SAVE_FAILED";
        throw err;
      }
      const index = rows.findIndex((item) => item.id === id);
      if (index < 0) throw new Error(`record ${id} not found`);
      rows[index] = {...rows[index], ...patch, id};
      return structuredClone(rows[index]);
    },
    armSaveFailure() {
      failNextSave = true;
    },
  };
}
