/**
 * Records consumer adapter contract (Phase 2 / S6).
 *
 * Every consumer (in-memory pilot, Nucleus-shaped local API, future real Nucleus)
 * implements this surface so the pilot UI can list → edit → fail → retry without
 * knowing the transport.
 *
 * Observable states the consumer must surface (pilot-tasks.md):
 *   loading | empty | filtered-empty | populated | editing |
 *   validation-error | save-failed | saved | stale-write
 *
 * Real Nucleus wiring: point `createNucleusShapedStore({ baseUrl, credentials: "include" })`
 * at the product records route with the browser's existing Workspace session cookies.
 * Do not add auth bypasses in Shine. Drop harness `_harness/arm-fail` on product.
 *
 * @typedef {{
 *   id: string,
 *   title: string,
 *   owner: string,
 *   status: string,
 *   notes: string,
 *   revision?: number,
 * }} RecordRow
 * @typedef {{
 *   list(opts?: {q?: string}): Promise<RecordRow[]>|RecordRow[],
 *   get(id: string): Promise<RecordRow>|RecordRow,
 *   save(id: string, patch: Partial<RecordRow>, opts?: {forceFail?: boolean, expectedRevision?: number}): Promise<RecordRow>,
 *   canSave(): boolean,
 *   forbiddenReason(): string,
 *   armSaveFailure(): void|Promise<void>,
 *   adapterId: string,
 * }} RecordsAdapter
 */

export const ADAPTER_IDS = Object.freeze(["memory", "nucleus-shaped"]);

/** Error codes the UI and doctor bites assert. */
export const RECORD_ERROR_CODES = Object.freeze([
  "FORBIDDEN",
  "SAVE_FAILED",
  "VALIDATION",
  "STALE_WRITE",
  "NOT_FOUND",
  "HTTP_ERROR",
]);

/** @param {unknown} row */
export function assertRecordRow(row) {
  if (!row || typeof row !== "object") throw new Error("record row required");
  for (const key of ["id", "title", "owner", "status"]) {
    if (typeof row[key] !== "string" || !row[key].trim()) {
      throw new Error(`record.${key} required`);
    }
  }
  if (row.notes != null && typeof row.notes !== "string") throw new Error("record.notes must be string");
  if (row.revision != null && (!Number.isInteger(row.revision) || row.revision < 1)) {
    throw new Error("record.revision must be a positive integer when present");
  }
}
