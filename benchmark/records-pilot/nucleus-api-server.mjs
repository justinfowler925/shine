#!/usr/bin/env node
/**
 * Local Nucleus-shaped Operate records API for the records pilot (S6).
 * Fictional demo data only — not production Nucleus and not an SSO bypass.
 *
 * Usage:
 *   node benchmark/records-pilot/nucleus-api-server.mjs [--port 0] [--seed empty|default]
 * Prints { baseUrl, port, seed } JSON on stdout when listening.
 *
 * Routes:
 *   GET    /api/operate/records[?q=][&delayMs=]
 *   GET    /api/operate/records/:id
 *   PATCH  /api/operate/records/:id   # fail, revision/If-Match, validation
 *   POST   /api/operate/records/_harness/arm-fail
 */
import { createServer } from "node:http";
import { createRecordsStore } from "./store.mjs";

const args = process.argv.slice(2);
const portFlag = args.indexOf("--port");
const port = portFlag >= 0 ? Number(args[portFlag + 1]) : 0;
const seedFlag = args.indexOf("--seed");
const seedName = seedFlag >= 0 ? String(args[seedFlag + 1] || "default") : "default";

const store = createRecordsStore(seedName === "empty" ? [] : undefined);

function roleOf(req) {
  const header = String(req.headers["x-shine-role"] || "editor").toLowerCase();
  return header === "viewer" ? "viewer" : "editor";
}

function send(res, status, value) {
  const body = JSON.stringify(value);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "content-type, x-shine-role, if-match",
    "access-control-allow-methods": "GET, PATCH, POST, OPTIONS",
  });
  res.end(body);
}

async function readJson(req) {
  let text = "";
  for await (const chunk of req) {
    text += chunk;
    if (text.length > 8192) throw Object.assign(new Error("Body too large"), { status: 413 });
  }
  if (!text) return {};
  return JSON.parse(text);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", "http://127.0.0.1");
  if (req.method === "OPTIONS") return send(res, 204, {});

  try {
    const delayMs = Number(url.searchParams.get("delayMs") || 0);
    if (delayMs > 0 && delayMs <= 2000) await sleep(delayMs);

    if (url.pathname === "/api/operate/records" && req.method === "GET") {
      const q = String(url.searchParams.get("q") || "").trim().toLowerCase();
      let rows = store.list();
      if (q) {
        rows = rows.filter((row) =>
          `${row.title} ${row.owner} ${row.status}`.toLowerCase().includes(q),
        );
      }
      return send(res, 200, {
        source: "nucleus-shaped-local",
        seed: seedName,
        rows,
      });
    }

    if (url.pathname === "/api/operate/records/_harness/arm-fail" && req.method === "POST") {
      store.armSaveFailure();
      return send(res, 200, { armed: true });
    }

    const match = url.pathname.match(/^\/api\/operate\/records\/([^/]+)$/);
    if (match) {
      const id = decodeURIComponent(match[1]);
      if (req.method === "GET") {
        try {
          return send(res, 200, store.get(id));
        } catch {
          return send(res, 404, { error: `record ${id} not found`, code: "NOT_FOUND" });
        }
      }
      if (req.method === "PATCH") {
        if (roleOf(req) === "viewer") {
          return send(res, 403, {
            error: "Your role is viewer; saving is forbidden.",
            code: "FORBIDDEN",
          });
        }
        const patch = await readJson(req);
        const ifMatch = req.headers["if-match"];
        const expectedRevision =
          ifMatch != null && String(ifMatch).trim() !== ""
            ? Number(ifMatch)
            : patch.revision != null
              ? Number(patch.revision)
              : undefined;
        try {
          const { fail, revision: _rev, ...fields } = patch;
          const saved = await store.save(id, fields, {
            forceFail: Boolean(fail),
            expectedRevision: Number.isFinite(expectedRevision) ? expectedRevision : undefined,
          });
          return send(res, 200, saved);
        } catch (error) {
          if (error.code === "SAVE_FAILED" || /save failed/i.test(error.message)) {
            return send(res, 503, { error: "save failed", code: "SAVE_FAILED" });
          }
          if (error.code === "VALIDATION") {
            return send(res, 400, { error: error.message, code: "VALIDATION" });
          }
          if (error.code === "STALE_WRITE") {
            return send(res, 409, {
              error: error.message,
              code: "STALE_WRITE",
              current: error.current,
            });
          }
          return send(res, 404, { error: error.message, code: "NOT_FOUND" });
        }
      }
    }

    return send(res, 404, { error: "not found" });
  } catch (error) {
    return send(res, error.status || 400, { error: error.message || "bad request" });
  }
});

await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));
const addr = server.address();
const baseUrl = `http://127.0.0.1:${addr.port}`;
console.log(
  JSON.stringify({
    baseUrl,
    port: addr.port,
    adapter: "nucleus-shaped-local",
    seed: seedName,
  }),
);

export { server, baseUrl };
