/**
 * Records consumer adapter contract (Phase 2 / S6).
 *
 * Every consumer (in-memory pilot, Nucleus-shaped local API, future real Nucleus)
 * implements this surface so the pilot UI can list → edit → fail → retry without
 * knowing the transport.
 *
 * Real Nucleus wiring: point `createNucleusShapedStore({ baseUrl })` at the product
 * records route with the browser's existing Workspace session cookies. Do not add
 * auth bypasses in Shine.
 *
 * @typedef {{ id: string, title: string, owner: string, status: string, notes: string }} RecordRow
 * @typedef {{
 *   list(): Promise<RecordRow[]>|RecordRow[],
 *   get(id: string): Promise<RecordRow>|RecordRow,
 *   save(id: string, patch: Partial<RecordRow>, opts?: {forceFail?: boolean}): Promise<RecordRow>,
 *   canSave(): boolean,
 *   forbiddenReason(): string,
 *   armSaveFailure(): void|Promise<void>,
 *   adapterId: string,
 * }} RecordsAdapter
 */

export const ADAPTER_IDS = Object.freeze(["memory", "nucleus-shaped"]);

/** @param {unknown} row */
export function assertRecordRow(row) {
  if (!row || typeof row !== "object") throw new Error("record row required");
  for (const key of ["id", "title", "owner", "status"]) {
    if (typeof row[key] !== "string" || !row[key].trim()) {
      throw new Error(`record.${key} required`);
    }
  }
  if (row.notes != null && typeof row.notes !== "string") throw new Error("record.notes must be string");
}
