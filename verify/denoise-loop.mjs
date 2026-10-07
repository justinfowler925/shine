#!/usr/bin/env node
/**
 * N11 — Full denoise loop (packet → static → diagnose plan → apply → measure → reflexion).
 * Golden path on verify/fixtures/denoise/* with FAIL→PASS measure receipts.
 * Max 3 measure rounds; twin full-page screenshots are not used as proof.
 */

import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createDesignPacket } from "../core/design-packet.mjs";
import {
  DEFAULT_ACTOR_ID,
  DEFAULT_CRITIC_ID,
  DEFAULT_HOST_ID,
  assertHostFinalized,
  assertNoWorkerSelfReview,
  completeAfterRepair,
  hostFinalizeAfterClearance,
  planRepairFromMeasure,
} from "../core/critic-actor-host.mjs";
import {
  assertAtlasReflexionVerdict,
  resolveStopReflexionVerdict,
} from "../core/reflexion.mjs";
import { autoAppendDenoiseLoop } from "../core/audit-trail.mjs";
import {
  STRUCTURE_PHASE_RESTRUCTURE,
  createStructureLockFromPlan,
  gateDenoiseStructureChange,
  readBrief,
  structureLockReceipt,
  wireframeBriefRef,
} from "../core/wireframe-brief.mjs";
import { scanPreflightSlop } from "./preflight-slop.mjs";
import { applyDomRestructure } from "./restructure/apply-dom.mjs";
import { applyXorSavedView } from "./restructure/xor-saved-view.mjs";
import { buildRestructurePlan } from "./restructure/schema.mjs";
import { emitRestructureFromDiagnosis, seedDiagnosis } from "../core/diagnosis.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MAX_ROUNDS = 3;

function measure(file, cite) {
  const run = spawnSync(
    process.execPath,
    [join(ROOT, "verify/measure.mjs"), file, "--cite", cite, "--lane", "saas", "--json", file + ".measure.json"],
    {
      encoding: "utf8",
      cwd: ROOT,
      env: { ...process.env, NODE_PATH: join(ROOT, "node_modules") },
      timeout: 120_000,
    },
  );
  const text = `${run.stderr || ""}\n${run.stdout || ""}`;
  const failures = [];
  if (existsSync(file + ".measure.json")) {
    try {
      const j = JSON.parse(readFileSync(file + ".measure.json", "utf8"));
      for (const f of j.failures || []) failures.push(String(f));
    } catch {
      /* fall through */
    }
  }
  for (const m of text.matchAll(/\b(cta-pressure|dual-focal|kpi-soup|composition-slop)[^\n]*/g)) {
    failures.push(m[0]);
  }
  return { status: run.status, failures: [...new Set(failures)], text: text.slice(-1500) };
}

/**
 * Run denoise loop on an HTML fixture.
 * @returns {object} receipt
 */
export async function runDenoiseLoop({
  htmlPath,
  job = "Decide Pursue/Review/Dismiss on the next notice",
  category = "queue",
  cite = "shadcn-queue",
  outDir = "",
  /** Pin audit root (tests); else SHINE_AUDIT_DIR opt-in. */
  auditDir = null,
  /** Optional LOCKED shine-wireframe/<slug>.brief.md — structure gate. */
  wireframeBrief = "",
} = {}) {
  const out = outDir || join(ROOT, "verify/fixtures/denoise/.loop");
  mkdirSync(out, { recursive: true });

  const packet = createDesignPacket({
    job,
    lane: "saas",
    mode: "denoise",
    category,
    project: ROOT,
    accept: true,
    wireframeBrief: wireframeBrief || undefined,
  });
  const auditOpts = auditDir ? { auditDir } : {};
  /** @type {{ events: number, error: string|null }|null} */
  let auditTrail = null;
  const appendAudit = (event) => {
    // Opt-in: SHINE_AUDIT_DIR (or explicit auditDir). Fail-closed when enabled.
    try {
      const trail = autoAppendDenoiseLoop(packet.ddrId, event, auditOpts);
      if (trail) {
        auditTrail = { events: trail.events.length, error: null };
      }
    } catch (error) {
      auditTrail = { events: auditTrail?.events || 0, error: error.message };
      throw error;
    }
  };

  let html = readFileSync(resolve(htmlPath), "utf8");
  const rounds = [];
  let currentPath = join(out, "round-0-before.html");
  writeFileSync(currentPath, html);

  const pre = scanPreflightSlop(html, { gate: true, screen: category });
  // N7: diagnosis seeds restructure checks → emit shine-restructure.json
  const diagnosis = seedDiagnosis({
    job,
    category: category === "queue" ? "datagrid" : category,
    lane: "saas",
  });
  diagnosis.primaryTask = job;
  diagnosis.primaryTaskCheck = { ok: false, note: "Denoise loop starting from seeded bloat fixture" };
  diagnosis.emptyErrorTriadCheck = { ok: true, note: "Triad assumed covered for loop seed" };
  diagnosis.competingCtaCheck = {
    ok: !pre.signals.some((s) => s.id === "ai-slop-cta-mania"),
    note: "From preflight-slop cta-mania signal",
  };
  diagnosis.dualFocalCheck = { ok: false, note: "Assume peer grids until measure clears dual-focal" };
  diagnosis.kpiSoupCheck = {
    ok: !pre.signals.some((s) => s.id === "ai-slop-kpi-strip"),
    note: "From preflight-slop kpi-strip signal",
  };
  diagnosis.citeHonestyCheck = { ok: true, note: `Cite ${cite}` };
  diagnosis.restructureRequired = true;
  writeFileSync(join(out, "shine-diagnosis.json"), JSON.stringify(diagnosis, null, 2) + "\n");
  const plan =
    emitRestructureFromDiagnosis(diagnosis, {
      citePrimary: cite || packet.selected?.id || "shadcn-queue",
      antiCites: packet.recommendation?.antiPatterns?.slice(0, 4) || [],
    }) ||
    buildRestructurePlan({
      job,
      category: category === "queue" ? "queue" : category,
      citePrimary: cite || packet.selected?.id || "shadcn-queue",
      ops: [
        { op: "cta-budget", maxFilled: 1, preferLabels: ["Pursue", "Save"], demotePolicy: "outline" },
        { op: "kpi-collapse", maxVisible: 3, rest: "details" },
        { op: "set-focal", attr: "data-region", value: "focal" },
        { op: "collapse-peer-grids", mode: "xor-saved-view", keepTitleIncludes: ["Queue"], foldTitleIncludes: ["David"] },
      ],
    });
  writeFileSync(join(out, "shine-restructure.json"), JSON.stringify(plan, null, 2) + "\n");

  // Structure lock: prefer LOCKED wireframe brief; else lock primary job/regions from plan.
  let briefRef = null;
  let structureLock = null;
  if (wireframeBrief) {
    const brief = readBrief(wireframeBrief);
    briefRef = wireframeBriefRef(wireframeBrief, brief);
    if (brief.status === "LOCKED") structureLock = brief;
  }
  if (!structureLock) {
    structureLock = createStructureLockFromPlan(plan, { job, cite });
  }
  // RESTRUCTURE apply is allowed only with the shine-restructure/v1 packet.
  gateDenoiseStructureChange({
    brief: structureLock,
    phase: STRUCTURE_PHASE_RESTRUCTURE,
    restructurePlan: plan,
  });

  // Round 1: apply DOM auto-safe ops
  const applied = applyDomRestructure(html, plan);
  html = applied.html;
  // D10 agent humanGate: XOR recipe (peer title → filter chip + shared DataGrid).
  // Never silent in apply-tsx / apply-dom auto paths — explicit agent step only.
  if (applied.plans.length && /grid-wrap/.test(html)) {
    const xorOp =
      (plan.ops || []).find((o) => o.op === "collapse-peer-grids") || {
        mode: "xor-saved-view",
        keepTitleIncludes: ["Queue"],
        foldTitleIncludes: ["David"],
      };
    const xor = applyXorSavedView(html, xorOp);
    if (xor.applied) html = xor.html;
  }
  currentPath = join(out, "round-1-applied.html");
  writeFileSync(currentPath, html);

  let lastMeasure = measure(currentPath, cite);
  appendAudit({
    type: "measure",
    round: 1,
    status: lastMeasure.status,
    failures: lastMeasure.failures,
    source: "denoise-loop.mjs",
  });
  rounds.push({
    round: 1,
    applied: applied.applied,
    humanGatePlans: applied.plans.length,
    measureStatus: lastMeasure.status,
    failures: lastMeasure.failures,
  });

  let reflexion = null;
  let hostAccept = null;
  let lastActorPlan = null;
  /** Worker who last repaired — next Critic must be distinct (fail-closed). */
  let lastRepairWorkerId = null;
  let criticRan = false;
  let round = 1;
  let retriesUsed = 0;
  while (lastMeasure.status !== 0 && round < MAX_ROUNDS) {
    round++;
    // measure→repair→critic host cycle: Critic diagnose (≠ last repair worker)
    // → Actor plan → (repair below) → measure; next iteration is post-repair Critic.
    const hostRound = await planRepairFromMeasure({
      goal: job,
      failures: lastMeasure.failures,
      tried: applied.applied,
      ddrId: packet.ddrId,
      constitutionIds: packet.ddr.constitutionIds,
      constitutionPrinciples: packet.ddr.constitution,
      criticAgentId: DEFAULT_CRITIC_ID,
      actorAgentId: DEFAULT_ACTOR_ID,
      hostAgentId: DEFAULT_HOST_ID,
      retriesUsed,
      requireConstitutionCitation: true,
      lastRepairWorkerId,
    });
    criticRan = true;
    reflexion = hostRound.reflexion;
    if (lastRepairWorkerId) {
      assertNoWorkerSelfReview({
        workerAgentId: lastRepairWorkerId,
        criticAgentId: reflexion.criticAgentId,
      });
    }
    if (hostRound.hostAccept) hostAccept = hostRound.hostAccept;
    lastActorPlan = hostRound.actorPlan;
    appendAudit({
      type: "critic-reflexion",
      verdict: reflexion.verdict,
      nextStep: reflexion.nextStep,
      disposition: hostRound.disposition,
      phase: lastRepairWorkerId ? "post-repair-critic" : hostRound.phase,
      criticAgentId: reflexion.criticAgentId,
      actorAgentId: reflexion.actorAgentId,
      lastRepairWorkerId,
      source: "denoise-loop.mjs",
    });

    if (hostRound.disposition !== "actor-proceed") {
      rounds.push({
        round,
        turn: "critic",
        phase: lastRepairWorkerId ? "post-repair-critic" : hostRound.phase,
        disposition: hostRound.disposition,
        reflexion: {
          verdict: reflexion.verdict,
          nextStep: reflexion.nextStep,
          criticAgentId: reflexion.criticAgentId,
          actorAgentId: reflexion.actorAgentId,
          selfAcceptBanned: true,
        },
        actor: hostRound.actorPlan,
        hostAccept,
        lastRepairWorkerId,
        measureStatus: lastMeasure.status,
        failures: lastMeasure.failures,
      });
      break;
    }

    // Actor repair turn — one imperative nextStep; never accepts its own review.
    // Structural repair stays phase=RESTRUCTURE + packet (REPAINT cannot mutate IA).
    gateDenoiseStructureChange({
      brief: structureLock,
      phase: STRUCTURE_PHASE_RESTRUCTURE,
      restructurePlan: plan,
    });
    retriesUsed++;
    const again = applyDomRestructure(html, plan);
    html = again.html;
    currentPath = join(out, `round-${round}.html`);
    writeFileSync(currentPath, html);
    lastMeasure = measure(currentPath, cite);
    appendAudit({
      type: "measure",
      round,
      status: lastMeasure.status,
      failures: lastMeasure.failures,
      source: "denoise-loop.mjs",
    });

    const completed = completeAfterRepair({
      actorPlan: hostRound.actorPlan,
      reflexion,
      measureStatus: lastMeasure.status,
      hostAgentId: DEFAULT_HOST_ID,
      note: hostRound.actorPlan?.nextStep
        ? `Measure cleared after Actor repair: ${hostRound.actorPlan.nextStep}`
        : "Measure cleared after Actor repair — host finalizes",
    });
    lastRepairWorkerId = completed.workerAgentId;
    if (completed.hostAccept?.accepted) hostAccept = completed.hostAccept;

    rounds.push({
      round,
      turn: "actor",
      phase: completed.phase,
      disposition: hostRound.disposition,
      reflexion: {
        verdict: reflexion.verdict,
        nextStep: reflexion.nextStep,
        criticAgentId: reflexion.criticAgentId,
        actorAgentId: reflexion.actorAgentId,
        selfAcceptBanned: true,
      },
      actor: hostRound.actorPlan,
      repairWorkerId: lastRepairWorkerId,
      hostAccept: completed.hostAccept,
      measureStatus: lastMeasure.status,
      failures: lastMeasure.failures,
    });
  }

  // Thin-spot fix: when Actor cleared measure after a partial, Host must finalize.
  if (criticRan && lastMeasure.status === 0 && !hostAccept?.accepted && reflexion) {
    if (lastRepairWorkerId) {
      assertNoWorkerSelfReview({
        workerAgentId: lastRepairWorkerId,
        criticAgentId: reflexion.criticAgentId || DEFAULT_CRITIC_ID,
      });
    }
    hostAccept = hostFinalizeAfterClearance({
      reflexion,
      hostAgentId: DEFAULT_HOST_ID,
      measureStatus: lastMeasure.status,
      note: lastActorPlan?.nextStep
        ? `Measure cleared after Actor nextStep: ${lastActorPlan.nextStep}`
        : "Measure cleared after Actor pass — host finalizes",
    });
  }

  // Atlas stop stamp: cleared → done; else last critic verdict; missing → error.
  const reflexionVerdict = assertAtlasReflexionVerdict(
    resolveStopReflexionVerdict({
      cleared: lastMeasure.status === 0,
      reflexion,
      hostAccepted: Boolean(hostAccept?.accepted),
    }),
  );

  const receipt = {
    version: 1,
    job,
    category,
    cite,
    ddrId: packet.ddrId,
    constitutionIds: packet.ddr.constitutionIds,
    constitutionEdition: packet.ddr.constitutionEdition || null,
    constitution: packet.ddr.constitution || [],
    restructureHints: packet.recommendation?.restructureHints || [],
    preflight: pre.signals.map((s) => s.id),
    opsApplied: applied.applied,
    humanGateRequired: applied.humanGate,
    structureLock: structureLockReceipt(structureLock, {
      source: briefRef ? "wireframe-brief" : "denoise-loop",
      wireframeBrief: briefRef,
    }),
    criticActor: {
      criticAgentId: DEFAULT_CRITIC_ID,
      actorAgentId: DEFAULT_ACTOR_ID,
      hostAgentId: DEFAULT_HOST_ID,
      selfAcceptBanned: true,
      workerSelfReviewBanned: true,
      lastRepairWorkerId,
      cycle: "measure→repair→critic",
      hostOrchestrator: "core/critic-actor-host.mjs",
      hostAccept,
    },
    rounds,
    // Atlas reflexion stop stamp (done|partial|blocked|error) — doctor fail-closed if missing.
    reflexionVerdict,
    status: lastMeasure.status === 0 ? "passed" : "failed",
    measureCleared: lastMeasure.status === 0,
    proof: "measure FAIL→PASS rounds — not twin screenshots",
    artifact: currentPath,
    auditTrail,
  };
  // Fail-closed when critic/actor ran and measure cleared without host finalize.
  assertHostFinalized({
    ...receipt.criticActor,
    rounds: receipt.rounds,
    status: receipt.status,
    measureCleared: receipt.measureCleared,
  });
  writeFileSync(join(out, "denoise-loop-receipt.json"), JSON.stringify(receipt, null, 2) + "\n");
  return receipt;
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const opt = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : "");
  const html =
    opt("--html") ||
    join(ROOT, "verify/fixtures/denoise/queue-cta-before.html");
  const receipt = await runDenoiseLoop({
    htmlPath: html,
    job: opt("--job") || "Decide Pursue/Review/Dismiss on the next notice",
    category: opt("--category") || "queue",
    cite: opt("--cite") || "shadcn-queue",
    outDir: opt("--out") || "",
    wireframeBrief: opt("--wireframe-brief") || "",
  });
  process.stdout.write(JSON.stringify(receipt, null, 2) + "\n");
  process.exit(receipt.status === "passed" ? 0 : 1);
}
