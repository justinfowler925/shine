/**
 * Nucleus-shaped HTTP records adapter.
 *
 * Talks to a local (or product) JSON API that mirrors Operate record list/edit:
 *   GET    {base}/api/operate/records[?q=]
 *   GET    {base}/api/operate/records/:id
 *   PATCH  {base}/api/operate/records/:id
 *   POST   {base}/api/operate/records/_harness/arm-fail   (local prove only)
 *
 * Role is advisory for the local harness (`X-Shine-Role`). Real Nucleus uses the
 * Workspace session — Shine never invents SSO bypasses. Pass `credentials: "include"`
 * when attaching to a same-origin product origin so the browser session rides along.
 */
import { assertRecordRow } from "./contract.mjs";

/**
 * @param {{
 *   baseUrl: string,
 *   role?: "editor"|"viewer",
 *   fetchImpl?: typeof fetch,
 *   credentials?: RequestCredentials,
 * }} opts
 * @returns {import("./contract.mjs").RecordsAdapter}
 */
export function createNucleusShapedStore({
  baseUrl,
  role = "editor",
  fetchImpl = globalThis.fetch.bind(globalThis),
  credentials = "omit",
} = {}) {
  if (!baseUrl) throw new Error("nucleus-shaped adapter requires baseUrl");
  const root = String(baseUrl).replace(/\/$/, "");
  if (!["editor", "viewer"].includes(role)) throw new Error(`unknown role ${role}`);

  async function request(path, init = {}) {
    const res = await fetchImpl(`${root}${path}`, {
      credentials,
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
      err.code =
        body?.code ||
        (res.status === 403
          ? "FORBIDDEN"
          : res.status === 409
            ? "STALE_WRITE"
            : res.status === 400
              ? "VALIDATION"
              : res.status === 503
                ? "SAVE_FAILED"
                : res.status === 404
                  ? "NOT_FOUND"
                  : "HTTP_ERROR");
      err.status = res.status;
      if (body?.current) err.current = body.current;
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
    async list(opts = {}) {
      const q = opts.q != null ? String(opts.q).trim() : "";
      const path = q
        ? `/api/operate/records?q=${encodeURIComponent(q)}`
        : "/api/operate/records";
      const body = await request(path);
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
      const payload = {
        ...patch,
        ...(opts.forceFail ? { fail: true } : {}),
        ...(opts.expectedRevision != null ? { revision: opts.expectedRevision } : {}),
      };
      const body = await request(`/api/operate/records/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
        headers:
          opts.expectedRevision != null
            ? { "if-match": String(opts.expectedRevision) }
            : {},
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
