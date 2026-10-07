#!/usr/bin/env node
/**
 * Wireframe brief lock — enterprise-agent plan §3 `wireframeBrief`.
 *
 * New surfaces write `shine-wireframe/<slug>.brief.md`. While Status is LOCKED,
 * structure (regions, primary, template/kit, pattern) is immutable until the
 * user says `unlock structure`. Build may paint only against a LOCKED brief.
 *
 * Denoise-loop: once primary job/regions are locked, REPAINT that would change
 * structure is refuse-closed unless applied as phase=RESTRUCTURE with a valid
 * shine-restructure/v1 packet.
 *
 * Procedure docs: skill/references/wireframe.md · skill/references/denoise.md
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validateRestructurePlan } from "../verify/restructure/schema.mjs";

export const BRIEF_STATUSES = Object.freeze(["DRAFT", "LOCKED", "UNLOCKED"]);
export const UNLOCK_PHRASE = "unlock structure";
export const STRUCTURE_FIELDS = Object.freeze([
  "Pattern",
  "Template",
  "Primary action",
  "Regions",
  "Kit recipe",
  "States",
]);
/** Denoise phases that may mutate locked structure — only with a RESTRUCTURE packet. */
export const STRUCTURE_PHASE_RESTRUCTURE = "RESTRUCTURE";
export const STRUCTURE_PHASE_REPAINT = "REPAINT";

const REQUIRED_KEYS = Object.freeze([
  "Status",
  "Lane",
  "Pattern",
  "Template",
  "Primary action",
  "Regions",
  "HTML",
  "Unlock",
]);

/** Resolve shine-wireframe/<slug>.brief.md under a project root. */
export function briefPathForSlug(slug, { project = process.cwd() } = {}) {
  const clean = String(slug || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (!clean) throw new Error("wireframe brief slug required");
  return join(resolve(project), "shine-wireframe", `${clean}.brief.md`);
}

export function normalizeBriefStatus(raw) {
  const s = String(raw || "")
    .trim()
    .toUpperCase();
  if (BRIEF_STATUSES.includes(s)) return s;
  throw new Error(`wireframe brief Status must be ${BRIEF_STATUSES.join("|")}; got ${raw}`);
}

/**
 * Parse a locked-brief markdown into a structured object.
 * Tolerates `# Wireframe brief: …` title + `Key: value` / multi-line Regions.
 */
export function parseBriefMarkdown(text = "") {
  const lines = String(text).split(/\r?\n/);
  const fields = {};
  let title = "";
  let currentKey = null;
  let buffer = [];

  const flush = () => {
    if (!currentKey) return;
    const value = buffer.join("\n").trim();
    fields[currentKey] = value;
    currentKey = null;
    buffer = [];
  };

  for (const line of lines) {
    const titleMatch = /^#\s+Wireframe brief:\s*(.+)\s*$/i.exec(line);
    if (titleMatch) {
      flush();
      title = titleMatch[1].trim();
      continue;
    }
    const kv = /^([A-Za-z][A-Za-z0-9 /_-]*):\s*(.*)$/.exec(line);
    if (kv && !line.startsWith(" ") && !line.startsWith("-") && !line.startsWith("*")) {
      const key = kv[1].trim();
      // Continuation of Regions / multi-line: lines starting with `-` stay in buffer.
      if (
        currentKey === "Regions" &&
        (line.trim().startsWith("-") || line.trim().startsWith("*"))
      ) {
        buffer.push(line.trim());
        continue;
      }
      flush();
      currentKey = key;
      buffer = [kv[2]];
      continue;
    }
    if (currentKey && (line.trim().startsWith("-") || line.trim().startsWith("*") || line.trim() === "")) {
      if (line.trim()) buffer.push(line.trim());
      continue;
    }
    if (currentKey && line.trim()) {
      buffer.push(line.trim());
    }
  }
  flush();

  const status = fields.Status ? normalizeBriefStatus(fields.Status) : "DRAFT";
  return {
    title: title || fields.Name || "",
    status,
    fields,
    raw: String(text),
  };
}

export function formatBriefMarkdown({
  title = "untitled",
  status = "DRAFT",
  lane = "saas",
  pattern = "",
  template = "",
  opened = "",
  primaryAction = "",
  regions = [],
  states = "empty / loading / error / filtered-empty",
  kitRecipe = "",
  techniques = "",
  adoption = "n/a",
  html = "",
  designMd = "",
  unlock = `only if user says "${UNLOCK_PHRASE}"`,
} = {}) {
  const st = normalizeBriefStatus(status);
  const regionLines = (Array.isArray(regions) ? regions : [regions])
    .filter(Boolean)
    .map((r) => (String(r).startsWith("-") ? String(r) : `- ${r}`));
  if (!regionLines.length) regionLines.push("- (unset)");
  const slugGuess =
    html ||
    (title
      ? `shine-wireframe/${String(title).toLowerCase().replace(/[^a-z0-9]+/g, "-")}.html`
      : "shine-wireframe/<slug>.html");
  return [
    `# Wireframe brief: ${title}`,
    `Status: ${st}`,
    `Lane: ${lane}`,
    `Pattern: ${pattern || "(unset)"}`,
    `Template: ${template || "(unset)"}`,
    `Opened: ${opened || "(unset)"}`,
    `Primary action: ${primaryAction || "(unset)"}`,
    "Regions:",
    ...regionLines,
    `States: ${states}`,
    `Kit recipe: ${kitRecipe || "(unset)"}`,
    `Techniques: ${techniques || "(unset)"}`,
    `Adoption: ${adoption}`,
    `HTML: ${slugGuess}`,
    `DESIGN.md: ${designMd || slugGuess.replace(/\.html$/, ".DESIGN.md")}`,
    `Unlock: ${unlock}`,
    "",
  ].join("\n");
}

export function readBrief(path) {
  const resolved = resolve(path);
  if (!existsSync(resolved)) {
    throw new Error(`wireframe brief missing: ${resolved}`);
  }
  const parsed = parseBriefMarkdown(readFileSync(resolved, "utf8"));
  return { ...parsed, path: resolved };
}

export function writeBrief(path, markdownOrOpts) {
  const resolved = resolve(path);
  mkdirSync(dirname(resolved), { recursive: true });
  const body =
    typeof markdownOrOpts === "string"
      ? markdownOrOpts
      : formatBriefMarkdown(markdownOrOpts);
  // Ensure Status line is present and normalized.
  const parsed = parseBriefMarkdown(body);
  const out = body.includes("Status:")
    ? body.replace(/^Status:\s*.+$/m, `Status: ${parsed.status}`)
    : `Status: ${parsed.status}\n${body}`;
  writeFileSync(resolved, out.endsWith("\n") ? out : out + "\n");
  return readBrief(resolved);
}

/** Validate required keys exist (fail-closed before lock). */
export function assertBriefComplete(brief) {
  const fields = brief?.fields || {};
  const missing = REQUIRED_KEYS.filter((k) => {
    if (k === "Regions") {
      const v = fields.Regions || "";
      return !String(v).trim() || /^\(unset\)$/i.test(String(v).replace(/^-\s*/, ""));
    }
    if (k === "Status") return !brief?.status;
    const v = fields[k];
    return !v || /^\(unset\)$/i.test(String(v).trim());
  });
  if (missing.length) {
    throw new Error(
      `wireframe brief incomplete — missing/unset: ${missing.join(", ")}. ` +
        `Fill before lock (skill/references/wireframe.md).`,
    );
  }
  return true;
}

/**
 * Lock structure. Brief must be complete. Status → LOCKED.
 */
export function lockBrief(path, { force = false } = {}) {
  const brief = readBrief(path);
  if (brief.status === "LOCKED" && !force) return brief;
  assertBriefComplete(brief);
  const next = brief.raw.replace(/^Status:\s*.+$/m, "Status: LOCKED");
  writeFileSync(resolve(path), next.endsWith("\n") ? next : next + "\n");
  return readBrief(path);
}

/**
 * Unlock structure — only when the user uttered the unlock phrase (or --confirm).
 */
export function unlockStructure(path, { phrase = "", confirm = false } = {}) {
  const uttered = String(phrase || "")
    .trim()
    .toLowerCase();
  const ok =
    confirm === true ||
    uttered === UNLOCK_PHRASE ||
    uttered.includes(UNLOCK_PHRASE);
  if (!ok) {
    throw new Error(
      `refuse unlock — user must say "${UNLOCK_PHRASE}" (or pass confirm=true / --confirm)`,
    );
  }
  const brief = readBrief(path);
  const next = brief.raw.replace(/^Status:\s*.+$/m, "Status: UNLOCKED");
  writeFileSync(resolve(path), next.endsWith("\n") ? next : next + "\n");
  return readBrief(path);
}

/** Structure is immutable while LOCKED. */
export function assertStructureLocked(brief, { action = "change structure" } = {}) {
  const status = brief?.status || brief?.fields?.Status;
  const normalized =
    typeof status === "string" && BRIEF_STATUSES.includes(status.toUpperCase?.() || status)
      ? String(status).toUpperCase()
      : normalizeBriefStatus(status || "DRAFT");
  if (normalized === "LOCKED") {
    throw new Error(
      `wireframe brief is LOCKED — refuse ${action}. ` +
        `User must say "${UNLOCK_PHRASE}" then: node core/wireframe-brief.mjs unlock <path>`,
    );
  }
  return true;
}

/**
 * Build/paint may proceed only against a LOCKED brief (new surfaces).
 * DRAFT → return to Wireframe. UNLOCKED → re-lock after structure edits.
 */
export function assertBuildMayPaint(brief, { action = "Build paint" } = {}) {
  if (!brief) throw new Error(`wireframe brief required for ${action}`);
  const status = brief.status || normalizeBriefStatus(brief.fields?.Status || "DRAFT");
  if (status !== "LOCKED") {
    throw new Error(
      `wireframe brief Status is ${status} — refuse ${action}. ` +
        (status === "DRAFT"
          ? "Complete discovery and lock the brief first."
          : `Re-lock after structure edits (Status must be LOCKED).`),
    );
  }
  assertBriefComplete(brief);
  return true;
}

/**
 * Apply a structure-field patch — fail-closed when LOCKED.
 * @param {string} path
 * @param {Record<string,string>} patch keys matching brief field names
 */
export function applyStructurePatch(path, patch = {}) {
  const brief = readBrief(path);
  assertStructureLocked(brief, { action: "patch structure fields" });
  let raw = brief.raw;
  for (const [key, value] of Object.entries(patch)) {
    if (key === "Status") continue;
    const re = new RegExp(`^${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}:\\s*.*$`, "m");
    if (re.test(raw)) {
      raw = raw.replace(re, `${key}: ${value}`);
    } else if (key === "Regions") {
      raw = raw.replace(/^Regions:\s*$/m, `Regions:\n${value}`);
    } else {
      raw = raw.trimEnd() + `\n${key}: ${value}\n`;
    }
  }
  writeFileSync(resolve(path), raw.endsWith("\n") ? raw : raw + "\n");
  return readBrief(path);
}

/**
 * Snapshot of locked structure fields (primary job + regions + cite skeleton).
 * Used by denoise-loop to refuse REPAINT that mutates IA after lock.
 */
export function structureSnapshot(briefOrLock = {}) {
  const fields = briefOrLock?.fields || {};
  const primary =
    fields["Primary action"] ||
    briefOrLock.primaryAction ||
    briefOrLock.job ||
    "";
  const regionsRaw =
    fields.Regions !== undefined && fields.Regions !== null
      ? fields.Regions
      : briefOrLock.regions || "";
  const regions = Array.isArray(regionsRaw)
    ? regionsRaw.map((r) => String(r).replace(/^[-*]\s*/, "").trim()).filter(Boolean)
    : String(regionsRaw)
        .split(/\r?\n/)
        .map((l) => l.replace(/^[-*]\s*/, "").trim())
        .filter(Boolean);
  return {
    primaryAction: String(primary).trim(),
    regions,
    pattern: String(fields.Pattern || briefOrLock.pattern || "").trim(),
    template: String(fields.Template || briefOrLock.template || "").trim(),
    kitRecipe: String(fields["Kit recipe"] || briefOrLock.kitRecipe || "").trim(),
  };
}

function normalizeStructureSnapshot(snap) {
  const s =
    snap?.fields || snap?.status
      ? structureSnapshot(snap)
      : snap?.primaryAction !== undefined || Array.isArray(snap?.regions)
        ? {
            primaryAction: snap.primaryAction || "",
            regions: snap.regions || [],
            pattern: snap.pattern || "",
            template: snap.template || "",
            kitRecipe: snap.kitRecipe || "",
          }
        : structureSnapshot(snap || {});
  return {
    primaryAction: String(s.primaryAction || "").trim().toLowerCase(),
    regions: (s.regions || []).map((r) => String(r).trim().toLowerCase()).sort(),
    pattern: String(s.pattern || "").trim().toLowerCase(),
    template: String(s.template || "").trim().toLowerCase(),
    kitRecipe: String(s.kitRecipe || "").trim().toLowerCase(),
  };
}

export function structureSnapshotsEqual(a, b) {
  return JSON.stringify(normalizeStructureSnapshot(a)) === JSON.stringify(normalizeStructureSnapshot(b));
}

/**
 * In-memory structure lock from a shine-restructure/v1 plan (denoise-loop).
 * Same gate surface as a LOCKED wireframe brief — primary job + regions.
 */
export function createStructureLockFromPlan(plan, { job = "", cite = "" } = {}) {
  const primary = String(plan?.job || job || "").trim();
  const regions = [];
  const focal = plan?.regions?.focal;
  if (focal) {
    regions.push(
      `focal — ${focal.role || "work"} — ${plan?.cite?.primary || cite || ""}`.trim(),
    );
  }
  for (const d of plan?.regions?.demote || []) {
    regions.push(`demote — ${d}`);
  }
  if (!regions.length) regions.push("focal — primary job");
  return {
    status: "LOCKED",
    structureLocked: true,
    source: "denoise-loop",
    fields: {
      Status: "LOCKED",
      "Primary action": primary || "(unset)",
      Regions: regions.map((r) => (String(r).startsWith("-") ? r : `- ${r}`)).join("\n"),
      Pattern: String(plan?.category || "").trim(),
      Template: String(plan?.cite?.primary || cite || "").trim(),
      "Kit recipe": String(plan?.cite?.productPattern || "").trim(),
      States: "empty / loading / error / filtered-empty",
    },
  };
}

function isLockedBrief(brief) {
  if (!brief) return false;
  if (brief.structureLocked === true) return true;
  const status = brief.status || brief.fields?.Status;
  try {
    return normalizeBriefStatus(status || "DRAFT") === "LOCKED";
  } catch {
    return false;
  }
}

function hasValidRestructurePacket(plan) {
  if (!plan || typeof plan !== "object") return false;
  return validateRestructurePlan(plan).ok === true;
}

/**
 * Once primary job/regions are LOCKED, refuse REPAINT that changes structure
 * unless the change is applied as phase=RESTRUCTURE with a valid
 * shine-restructure/v1 packet.
 *
 * @param {object} opts
 * @param {object} opts.brief LOCKED brief or createStructureLockFromPlan result
 * @param {"REPAINT"|"RESTRUCTURE"} [opts.phase="REPAINT"]
 * @param {object|null} [opts.proposed] structure snapshot or patch-like object
 * @param {object|null} [opts.restructurePlan] shine-restructure/v1
 */
export function assertRepaintPreservesStructure({
  brief,
  phase = STRUCTURE_PHASE_REPAINT,
  proposed = null,
  restructurePlan = null,
} = {}) {
  if (!isLockedBrief(brief)) return true;

  const locked = structureSnapshot(brief);
  let next = locked;
  if (proposed != null) {
    if (proposed.primaryAction !== undefined || Array.isArray(proposed.regions) || proposed.fields) {
      next = structureSnapshot(
        proposed.fields
          ? proposed
          : {
              fields: {
                "Primary action": proposed.primaryAction ?? locked.primaryAction,
                Regions: Array.isArray(proposed.regions)
                  ? proposed.regions.map((r) => `- ${r}`).join("\n")
                  : proposed.regions || locked.regions.join("\n"),
                Pattern: proposed.pattern ?? locked.pattern,
                Template: proposed.template ?? locked.template,
                "Kit recipe": proposed.kitRecipe ?? locked.kitRecipe,
              },
            },
      );
    } else if (typeof proposed === "object") {
      // Patch keyed by brief field names
      const fields = { ...brief.fields };
      for (const [k, v] of Object.entries(proposed)) {
        if (STRUCTURE_FIELDS.includes(k) || k === "Primary action" || k === "Regions") {
          fields[k] = v;
        }
      }
      next = structureSnapshot({ fields, status: "LOCKED" });
    }
  }

  const structureChanges = !structureSnapshotsEqual(locked, next);
  if (!structureChanges) return true;

  const phaseNorm = String(phase || STRUCTURE_PHASE_REPAINT).trim().toUpperCase();
  const planOk = hasValidRestructurePacket(restructurePlan);
  if (phaseNorm === STRUCTURE_PHASE_RESTRUCTURE && planOk) return true;

  throw new Error(
    `wireframe brief is LOCKED — refuse REPAINT that changes structure (primary/regions) without RESTRUCTURE packet. ` +
      `Emit shine-restructure/v1 and apply as phase=${STRUCTURE_PHASE_RESTRUCTURE}, or user says "${UNLOCK_PHRASE}".`,
  );
}

/**
 * Denoise-loop gate: lock primary job/regions, then allow RESTRUCTURE apply
 * or craft-only REPAINT. Structural REPAINT without packet → throw.
 */
export function gateDenoiseStructureChange({
  brief,
  phase = STRUCTURE_PHASE_REPAINT,
  proposed = null,
  restructurePlan = null,
} = {}) {
  return assertRepaintPreservesStructure({ brief, phase, proposed, restructurePlan });
}

/** Receipt fragment for denoise-loop / doctor. */
export function structureLockReceipt(brief, { source = null, wireframeBrief = null } = {}) {
  if (!isLockedBrief(brief)) {
    return {
      locked: false,
      repaintStructureRefuse: false,
      source: source || brief?.source || null,
      wireframeBrief: wireframeBrief || null,
    };
  }
  const snap = structureSnapshot(brief);
  return {
    locked: true,
    primaryAction: snap.primaryAction,
    regions: snap.regions,
    pattern: snap.pattern,
    template: snap.template,
    repaintStructureRefuse: true,
    source: source || brief?.source || (wireframeBrief ? "wireframe-brief" : "denoise-loop"),
    wireframeBrief: wireframeBrief || null,
  };
}

/**
 * Packet / DDR helper: bind brief path + lock status onto ddr.wireframeBrief.
 */
export function wireframeBriefRef(path, brief = null) {
  const resolved = path ? resolve(path) : null;
  const b = brief || (resolved && existsSync(resolved) ? readBrief(resolved) : null);
  if (!resolved) return null;
  return {
    path: resolved,
    status: b?.status || null,
    slug: resolved.match(/shine-wireframe\/([^/]+)\.brief\.md$/)?.[1] || null,
    structureLocked: b?.status === "LOCKED",
    unlockPhrase: UNLOCK_PHRASE,
  };
}

/**
 * Fail-closed for mode=new: require LOCKED brief before Actor implement/paint.
 */
export function assertNewSurfaceBrief(packetOrOpts = {}) {
  const mode = packetOrOpts.mode || packetOrOpts.ddr?.mode;
  if (mode !== "new") return true;
  const ref = packetOrOpts.ddr?.wireframeBrief || packetOrOpts.wireframeBrief;
  const path = typeof ref === "string" ? ref : ref?.path;
  if (!path) {
    throw new Error(
      `mode=new requires ddr.wireframeBrief → shine-wireframe/<slug>.brief.md ` +
        `(pass --wireframe-brief or --slug). Structure locks until "${UNLOCK_PHRASE}".`,
    );
  }
  const brief = readBrief(path);
  assertBuildMayPaint(brief, { action: "Actor implement on new surface" });
  return brief;
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const cmd = args[0];
  const opt = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : "");
  try {
    if (cmd === "lock") {
      const path = resolve(args[1] || briefPathForSlug(opt("--slug") || "surface"));
      const brief = lockBrief(path, { force: args.includes("--force") });
      process.stdout.write(JSON.stringify({ ok: true, path: brief.path, status: brief.status }, null, 2) + "\n");
    } else if (cmd === "unlock") {
      const path = resolve(args[1] || "");
      if (!path || path === resolve("")) throw new Error("usage: unlock <path> --phrase 'unlock structure'");
      const brief = unlockStructure(path, {
        phrase: opt("--phrase") || args.slice(2).join(" "),
        confirm: args.includes("--confirm"),
      });
      process.stdout.write(JSON.stringify({ ok: true, path: brief.path, status: brief.status }, null, 2) + "\n");
    } else if (cmd === "check") {
      const path = resolve(args[1] || "");
      const brief = readBrief(path);
      assertBriefComplete(brief);
      const paint = args.includes("--paint");
      if (paint) assertBuildMayPaint(brief);
      process.stdout.write(
        JSON.stringify(
          {
            ok: true,
            path: brief.path,
            status: brief.status,
            structureLocked: brief.status === "LOCKED",
            paintAllowed: brief.status === "LOCKED",
          },
          null,
          2,
        ) + "\n",
      );
    } else if (cmd === "write") {
      const slug = opt("--slug") || "surface";
      const path = resolve(opt("--out") || briefPathForSlug(slug, { project: opt("--project") || process.cwd() }));
      const brief = writeBrief(path, {
        title: opt("--title") || slug,
        status: opt("--status") || "DRAFT",
        lane: opt("--lane") || "saas",
        pattern: opt("--pattern") || "patterns.md Insight stream / queue",
        template: opt("--template") || "templates.md shadcn-queue",
        primaryAction: opt("--primary") || "Primary",
        regions: (opt("--regions") || "nav — job — cite; focal — job — cite").split(";").map((s) => s.trim()),
        kitRecipe: opt("--kit") || "kits.md Queue",
        html: `shine-wireframe/${slug}.html`,
      });
      process.stdout.write(JSON.stringify({ ok: true, path: brief.path, status: brief.status }, null, 2) + "\n");
    } else {
      throw new Error(
        "usage: wireframe-brief.mjs lock <path>|write|unlock <path> --phrase 'unlock structure'|check <path> [--paint]",
      );
    }
  } catch (error) {
    console.error(`shine wireframe-brief: ${error.message}`);
    process.exit(1);
  }
}
