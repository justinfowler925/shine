#!/usr/bin/env node
/**
 * Local Nucleus-shaped Operate records API for the records pilot (S6).
 * Fictional demo data only — not production Nucleus and not an SSO bypass.
 *
 * Usage:
 *   node benchmark/records-pilot/nucleus-api-server.mjs [--port 0]
 * Prints { baseUrl, port } JSON on stdout when listening.
 */
import { createServer } from "node:http";
import { createRecordsStore } from "./store.mjs";

const args = process.argv.slice(2);
const portFlag = args.indexOf("--port");
const port = portFlag >= 0 ? Number(args[portFlag + 1]) : 0;

const store = createRecordsStore();

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
    "access-control-allow-headers": "content-type, x-shine-role",
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

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", "http://127.0.0.1");
  if (req.method === "OPTIONS") return send(res, 204, {});

  try {
    if (url.pathname === "/api/operate/records" && req.method === "GET") {
      return send(res, 200, { source: "nucleus-shaped-local", rows: store.list() });
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
        try {
          const saved = await store.save(id, patch, { forceFail: Boolean(patch.fail) });
          return send(res, 200, saved);
        } catch (error) {
          if (error.code === "SAVE_FAILED" || /save failed/i.test(error.message)) {
            return send(res, 503, { error: "save failed", code: "SAVE_FAILED" });
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
console.log(JSON.stringify({ baseUrl, port: addr.port, adapter: "nucleus-shaped-local" }));

export { server, baseUrl };
