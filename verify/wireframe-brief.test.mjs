#!/usr/bin/env node
/**
 * Wireframe brief lock bites — structure locked until "unlock structure".
 * Denoise: refuse REPAINT that changes structure without RESTRUCTURE packet.
 */
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  STRUCTURE_PHASE_REPAINT,
  STRUCTURE_PHASE_RESTRUCTURE,
  UNLOCK_PHRASE,
  applyStructurePatch,
  assertBuildMayPaint,
  assertNewSurfaceBrief,
  assertRepaintPreservesStructure,
  assertStructureLocked,
  briefPathForSlug,
  createStructureLockFromPlan,
  formatBriefMarkdown,
  gateDenoiseStructureChange,
  lockBrief,
  readBrief,
  structureLockReceipt,
  structureSnapshot,
  unlockStructure,
  wireframeBriefRef,
  writeBrief,
} from "../core/wireframe-brief.mjs";
import { createDesignPacket } from "../core/design-packet.mjs";
import { buildRestructurePlan } from "./restructure/schema.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dir = mkdtempSync(join(tmpdir(), "shine-wf-brief-"));

try {
  const path = briefPathForSlug("triage-queue", { project: dir });
  assert.match(path, /shine-wireframe\/triage-queue\.brief\.md$/);

  const draft = writeBrief(path, {
    title: "Triage queue",
    status: "DRAFT",
    lane: "saas",
    pattern: "patterns.md Insight stream / queue",
    template: "templates.md shadcn-queue via cite.mjs queue",
    primaryAction: "Pursue",
    regions: [
      "nav — navigate Operate — templates.md shadcn-sidebar-07",
      "focal — decide Pursue/Review/Dismiss — templates.md shadcn-queue",
    ],
    kitRecipe: "kits.md Queue + corpus/packs/shadcn-queue",
    html: "shine-wireframe/triage-queue.html",
  });
  assert.equal(draft.status, "DRAFT");
  assert.throws(() => assertBuildMayPaint(draft), /Status is DRAFT|refuse Build/);

  const locked = lockBrief(path);
  assert.equal(locked.status, "LOCKED");
  assertBuildMayPaint(locked);
  assert.throws(() => assertStructureLocked(locked), /LOCKED|unlock structure/);
  assert.throws(
    () => applyStructurePatch(path, { "Primary action": "Dismiss" }),
    /LOCKED|refuse/,
  );

  assert.throws(
    () => unlockStructure(path, { phrase: "please unlock" }),
    /refuse unlock/,
  );
  const unlocked = unlockStructure(path, { phrase: UNLOCK_PHRASE });
  assert.equal(unlocked.status, "UNLOCKED");
  applyStructurePatch(path, { "Primary action": "Dismiss all" });
  assert.match(readBrief(path).fields["Primary action"], /Dismiss all/);

  // Re-lock required before paint
  assert.throws(() => assertBuildMayPaint(readBrief(path)), /UNLOCKED|Re-lock/);
  lockBrief(path);
  assertBuildMayPaint(readBrief(path));

  const ref = wireframeBriefRef(path);
  assert.equal(ref.structureLocked, true);
  assert.equal(ref.slug, "triage-queue");

  // Packet mode=new binds brief; requireWireframeLock fail-closed without path
  assert.throws(
    () =>
      createDesignPacket({
        job: "Decide Pursue on the next notice",
        lane: "saas",
        mode: "new",
        category: "queue",
        project: ROOT,
        requireWireframeLock: true,
      }),
    /wireframeBrief|shine-wireframe/,
  );

  const packet = createDesignPacket({
    job: "Decide Pursue on the next notice",
    lane: "saas",
    mode: "new",
    category: "queue",
    project: ROOT,
    wireframeBrief: path,
    requireWireframeLock: true,
  });
  assert.equal(packet.mode, "new");
  assert.ok(packet.wireframe?.required);
  assert.equal(packet.ddr.wireframeBrief.status, "LOCKED");
  assert.equal(packet.ddr.wireframeBrief.structureLocked, true);
  assertNewSurfaceBrief(packet);

  // Discovery may bind a DRAFT brief without --require-wireframe-lock.
  const draftOnly = writeBrief(join(dir, "shine-wireframe", "draft-only.brief.md"), {
    title: "Draft only",
    status: "DRAFT",
    lane: "saas",
    pattern: "patterns.md App shell",
    template: "templates.md shadcn-sidebar-07",
    primaryAction: "Save",
    regions: ["focal — edit record — templates.md shadcn-settings"],
    kitRecipe: "kits.md Settings",
    html: "shine-wireframe/draft-only.html",
  });
  assert.equal(draftOnly.status, "DRAFT");
  const discovery = createDesignPacket({
    job: "Configure a matching recipe",
    lane: "saas",
    mode: "new",
    category: "settings",
    project: ROOT,
    wireframeBrief: draftOnly.path,
  });
  assert.equal(discovery.ddr.wireframeBrief.status, "DRAFT");
  assert.equal(discovery.ddr.wireframeBrief.structureLocked, false);

  // Incomplete brief refuses lock
  const incompletePath = join(dir, "shine-wireframe", "hole.brief.md");
  writeFileSync(
    incompletePath,
    formatBriefMarkdown({ title: "Hole", status: "DRAFT", primaryAction: "" }),
  );
  assert.throws(() => lockBrief(incompletePath), /incomplete|unset/i);

  // CLI smoke
  const check = spawnSync(
    process.execPath,
    [join(ROOT, "core/wireframe-brief.mjs"), "check", path, "--paint"],
    { encoding: "utf8" },
  );
  assert.equal(check.status, 0, check.stderr);
  assert.match(check.stdout, /"structureLocked": true/);

  const wireframeMd = join(ROOT, "skill/references/wireframe.md");
  assert.ok(existsSync(wireframeMd));
  const body = readFileSync(wireframeMd, "utf8");
  assert.match(body, /wireframe-brief\.mjs/);
  assert.match(body, /unlock structure/);
  assert.match(body, /RESTRUCTURE|REPAINT/);

  // Denoise structure lock: REPAINT cannot mutate primary/regions without packet.
  const plan = buildRestructurePlan({
    job: "Decide Pursue/Review/Dismiss on the next notice",
    category: "queue",
    citePrimary: "shadcn-queue",
    ops: [{ op: "cta-budget", maxFilled: 1, preferLabels: ["Pursue"], demotePolicy: "outline" }],
  });
  const loopLock = createStructureLockFromPlan(plan, {
    job: "Decide Pursue/Review/Dismiss on the next notice",
    cite: "shadcn-queue",
  });
  assert.equal(loopLock.status, "LOCKED");
  const snap = structureSnapshot(loopLock);
  assert.match(snap.primaryAction, /Pursue|Decide/i);
  assert.ok(snap.regions.length >= 1);

  // Craft-only REPAINT (same structure) — allowed.
  assertRepaintPreservesStructure({
    brief: loopLock,
    phase: STRUCTURE_PHASE_REPAINT,
    proposed: snap,
  });

  // REPAINT that changes primary — refuse without RESTRUCTURE packet.
  assert.throws(
    () =>
      assertRepaintPreservesStructure({
        brief: loopLock,
        phase: STRUCTURE_PHASE_REPAINT,
        proposed: { ...snap, primaryAction: "Invent a new dashboard job" },
      }),
    /refuse REPAINT|RESTRUCTURE packet/,
  );
  assert.throws(
    () =>
      gateDenoiseStructureChange({
        brief: readBrief(path),
        phase: STRUCTURE_PHASE_REPAINT,
        proposed: { "Primary action": "Totally different", Regions: "- other — invent" },
      }),
    /refuse REPAINT|RESTRUCTURE packet/,
  );

  // Same change as RESTRUCTURE + valid packet — allowed.
  gateDenoiseStructureChange({
    brief: loopLock,
    phase: STRUCTURE_PHASE_RESTRUCTURE,
    proposed: { ...snap, primaryAction: "Decide Pursue on the next notice" },
    restructurePlan: plan,
  });

  // RESTRUCTURE without packet — refuse.
  assert.throws(
    () =>
      gateDenoiseStructureChange({
        brief: loopLock,
        phase: STRUCTURE_PHASE_RESTRUCTURE,
        proposed: { ...snap, regions: ["focal — invented"] },
        restructurePlan: null,
      }),
    /refuse REPAINT|RESTRUCTURE packet/,
  );

  const receiptFrag = structureLockReceipt(loopLock, { source: "denoise-loop" });
  assert.equal(receiptFrag.locked, true);
  assert.equal(receiptFrag.repaintStructureRefuse, true);
  assert.equal(receiptFrag.source, "denoise-loop");

  console.log(
    "wireframe-brief PASS: lock · unlock phrase · structure refuse · packet mode=new · paint gate · denoise REPAINT/RESTRUCTURE gate",
  );
} finally {
  rmSync(dir, { recursive: true, force: true });
}
