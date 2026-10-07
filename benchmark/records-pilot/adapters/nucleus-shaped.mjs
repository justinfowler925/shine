/**
 * Nucleus-shaped HTTP records adapter.
 *
 * Talks to a local (or product) JSON API that mirrors Operate record list/edit:
 *   GET    {base}/api/operate/records
 *   GET    {base}/api/operate/records/:id
 *   PATCH  {base}/api/operate/records/:id
 *   POST   {base}/api/operate/records/:id/arm-fail   (harness only)
 *
 * Role is advisory for the local harness (`X-Shine-Role`). Real Nucleus uses the
 * Workspace session — Shine never invents SSO bypasses.
 */
import { assertRecordRow } from "./contract.mjs";

/**
 * @param {{ baseUrl: string, role?: "editor"|"viewer", fetchImpl?: typeof fetch }} opts
 * @returns {import("./contract.mjs").RecordsAdapter}
 */
export function createNucleusShapedStore({
  baseUrl,
  role = "editor",
  fetchImpl = globalThis.fetch.bind(globalThis),
} = {}) {
  if (!baseUrl) throw new Error("nucleus-shaped adapter requires baseUrl");
  const root = String(baseUrl).replace(/\/$/, "");
  if (!["editor", "viewer"].includes(role)) throw new Error(`unknown role ${role}`);

  async function request(path, init = {}) {
    const res = await fetchImpl(`${root}${path}`, {
      ...init,
      headers: {
        accept: "application/json",
        "x-shine-role": role,
        ...(init.body ? { "content-type": "application/json" } : {}),
        ...(init.headers || {}),
      },
    });
    const text = await res.text();
    let body = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = { error: text || res.statusText };
    }
    if (!res.ok) {
      const err = new Error(body?.error || `HTTP ${res.status}`);
      err.code = body?.code || (res.status === 403 ? "FORBIDDEN" : res.status === 503 ? "SAVE_FAILED" : "HTTP_ERROR");
      err.status = res.status;
      throw err;
    }
    return body;
  }

  return {
    adapterId: "nucleus-shaped",
    role,
    canSave() {
      return role === "editor";
    },
    forbiddenReason() {
      return role === "viewer" ? "Your role is viewer; saving is forbidden." : "";
    },
    async list() {
      const body = await request("/api/operate/records");
      if (!Array.isArray(body?.rows)) throw new Error("nucleus-shaped list: rows required");
      for (const row of body.rows) assertRecordRow(row);
      return body.rows;
    },
    async get(id) {
      const body = await request(`/api/operate/records/${encodeURIComponent(id)}`);
      assertRecordRow(body);
      return body;
    },
    async save(id, patch, opts = {}) {
      if (role === "viewer") {
        const err = new Error("Your role is viewer; saving is forbidden.");
        err.code = "FORBIDDEN";
        throw err;
      }
      const body = await request(`/api/operate/records/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({ ...patch, ...(opts.forceFail ? { fail: true } : {}) }),
      });
      assertRecordRow(body);
      return body;
    },
    async armSaveFailure() {
      // Harness endpoint — local prove only. Product Nucleus will not expose this.
      await request("/api/operate/records/_harness/arm-fail", { method: "POST", body: "{}" });
    },
  };
}
