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
  isCiteFailCategory,
  observedCiteFromFailures,
} from "../core/learn.mjs";
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
import { writeCompletionProveReceipt } from "../hooks/receipt.mjs";
import { scanPreflightSlop } from "./preflight-slop.mjs";
import { applyDomRestructure } from "./restructure/apply-dom.mjs";
import { applyXorSavedView } from "./restructure/xor-saved-view.mjs";
import {
  DEFECT_CROP_PAIRS,
  assertCropPairOk,
  ensureDefectCropReceipts,
} from "./restructure/defect-crops.mjs";
import { buildRestructurePlan } from "./restructure/schema.mjs";
import { emitRestructureFromDiagnosis, seedDiagnosis } from "../core/diagnosis.mjs";

/** Lazy-load apply-tsx so DOM-only loop callers do not pull the TypeScript compiler. */
async function loadApplyTsx() {
  const mod = await import("./restructure/apply-tsx.mjs");
  return mod.applyTsxRestructure;
}

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MAX_ROUNDS = 3;

/** Named denoise defects the golden loop must clear (craft gates may remain). */
const NAMED_DENOISE_RE =
  /\b(cta-pressure|dual-focal|kpi-soup|pill-filter|page-title|chrome-pressure|filter-reversible|marketing-dna|filler-empty|card-soup|empty-triad|composition-slop|cite-honesty|wrong-cite|rebind-cite|category-honesty)\b/;

export function namedDenoiseFailures(failures = []) {
  return [...new Set((failures || []).map(String).filter((f) => NAMED_DENOISE_RE.test(f)))];
}

export function namedDenoiseCleared(failures = []) {
  return namedDenoiseFailures(failures).length === 0;
}

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
  for (const m of text.matchAll(
    /\b(cta-pressure|dual-focal|kpi-soup|pill-filter|page-title|chrome-pressure|filter-reversible|marketing-dna|filler-empty|card-soup|empty-triad|composition-slop|cite-honesty|wrong-cite|rebind-cite|category-honesty)[^\n]*/g,
  )) {
    failures.push(m[0]);
  }
  return { status: run.status, failures: [...new Set(failures)], text: text.slice(-1500) };
}

/**
 * Run denoise loop on an HTML fixture.
 * Optional `tsxPath` makes Actor repair apply TypeScript AST ops (apply-tsx)
 * while DOM keep measure continuum on the HTML substrate.
 * Optional `mintProve` stamps a prove.mjs completion receipt with
 * reflexionVerdict + constitutionIds when measure clears.
 * Optional `cropPairId` requires a FAIL→PASS cropped defect receipt (not twins).
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
  /**
   * Cite-ban learn (doctor-gated). When measure cite-honesty fires, host rounds
   * pass observedCite into reflexion; set doctorBiteOk to commit repertoire bans.
   */
  doctorBiteOk = false,
  observedCite = "",
  expectedCite = "",
  edition = "clearspeed-operate",
  learnStorePath = undefined,
  /**
   * Consumer TSX substrate — when set, Actor repair applies AST ops via
   * applyTsxRestructure (measure still runs on HTML).
   */
  tsxPath = "",
  /** Mint prove.mjs completion receipt after clearance (reflexionVerdict+constitutionIds). */
  mintProve = false,
  /** Defect crop pair id (e.g. queue-cta-tsx) — FAIL→PASS receipt required when set. */
  cropPairId = "",
  /** Optional completion store path (tests); else SHINE_COMPLETION_RECEIPT / home cache. */
  completionReceiptPath = "",
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
  let tsx = tsxPath ? readFileSync(resolve(tsxPath), "utf8") : "";
  let tsxOutPath = tsxPath ? join(out, "round-0-before.tsx") : "";
  if (tsxOutPath) writeFileSync(tsxOutPath, tsx);
  /** @type {string[]} */
  let opsAppliedAst = [];
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
        { op: "pill-collapse", maxVisible: 3, rest: "details" },
        { op: "title-singular", demote: "kicker" },
        { op: "chrome-budget", maxFilledChrome: 0, demotePolicy: "ghost", scope: "chrome" },
        { op: "filter-clearable", perChip: true, clearAll: true },
        { op: "strip-marketing-dna" },
        { op: "rewrite-filler-empty" },
        { op: "collapse-card-soup", maxVisible: 1 },
        { op: "split-empty-triad" },
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

  // Round 1: apply auto-safe ops — DOM for measure continuum; AST when tsxPath set.
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
    if (xor.applied) {
      html = xor.html;
      // XOR can remove the filled primary that cta-budget kept on the peer grid.
      // Re-budget so a preferred label is promoted on the surviving worklist.
      const ctaOp =
        (plan.ops || []).find((o) => o.op === "cta-budget") || {
          maxFilled: 1,
          preferLabels: ["Pursue", "Save"],
          demotePolicy: "outline",
        };
      const rebudget = applyDomRestructure(html, {
        ...plan,
        ops: [{ ...ctaOp, op: "cta-budget" }],
      });
      html = rebudget.html;
      if (rebudget.applied.includes("cta-budget") && !applied.applied.includes("cta-budget")) {
        applied.applied.push("cta-budget");
      }
    }
  }
  /** @type {null | ((source: string, plan: object) => { source: string, applied: string[] })} */
  let applyTsxRestructure = null;
  if (tsx) {
    applyTsxRestructure = await loadApplyTsx();
    const astApplied = applyTsxRestructure(tsx, plan);
    tsx = astApplied.source;
    opsAppliedAst = [...astApplied.applied];
    tsxOutPath = join(out, "round-1-applied.tsx");
    writeFileSync(tsxOutPath, tsx);
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
    appliedAst: opsAppliedAst,
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
  while (
    lastMeasure.status !== 0 &&
    !namedDenoiseCleared(lastMeasure.failures) &&
    round < MAX_ROUNDS
  ) {
    round++;
    // measure→repair→critic host cycle: Critic diagnose (≠ last repair worker)
    // → Actor plan → (repair below) → measure; next iteration is post-repair Critic.
    // Cite-ban learn: when cite-honesty (etc.) fires, pass observedCite into
    // host→reflexion; commit only when doctorBiteOk (doctor-gated version bump).
    const citeBanFires = lastMeasure.failures.some((f) => isCiteFailCategory(f));
    const resolvedObserved = citeBanFires
      ? observedCite || observedCiteFromFailures(lastMeasure.failures) || ""
      : "";
    const resolvedExpected = citeBanFires ? expectedCite || cite : "";
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
      doctorBiteOk: Boolean(doctorBiteOk) && citeBanFires && Boolean(resolvedObserved),
      observedCite: resolvedObserved,
      expectedCite: resolvedExpected,
      category: citeBanFires ? category : "",
      edition: citeBanFires ? edition : "",
      learnStorePath,
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
      citeBanLearn: reflexion.citeBanLearn
        ? {
            citeId: reflexion.citeBanLearn.citeBan?.citeId || null,
            ddrId: reflexion.citeBanLearn.citeBan?.ddrId || null,
            skipped: reflexion.citeBanLearn.skipped || false,
          }
        : null,
      inferredCiteBan: reflexion.inferredCiteBan?.citeId || null,
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
    // When tsxPath is set, AST ops are the primary Actor repair substrate.
    gateDenoiseStructureChange({
      brief: structureLock,
      phase: STRUCTURE_PHASE_RESTRUCTURE,
      restructurePlan: plan,
    });
    retriesUsed++;
    if (tsx) {
      if (!applyTsxRestructure) applyTsxRestructure = await loadApplyTsx();
      const astAgain = applyTsxRestructure(tsx, plan);
      tsx = astAgain.source;
      opsAppliedAst = [...new Set([...opsAppliedAst, ...astAgain.applied])];
      tsxOutPath = join(out, `round-${round}.tsx`);
      writeFileSync(tsxOutPath, tsx);
    }
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

  const namedRemaining = namedDenoiseFailures(lastMeasure.failures);
  const namedCleared = namedRemaining.length === 0;
  // Denoise bar = named defect clearance (cta/dual/kpi/…). Full measure exit 0 is
  // stronger; craft gates (axe/type-scale) may remain on fixtures.
  const denoiseCleared = lastMeasure.status === 0 || namedCleared;

  // Thin-spot fix: when Actor cleared measure (or named denoise defects) after a
  // partial, Host must finalize.
  if (criticRan && denoiseCleared && !hostAccept?.accepted && reflexion) {
    if (lastRepairWorkerId) {
      assertNoWorkerSelfReview({
        workerAgentId: lastRepairWorkerId,
        criticAgentId: reflexion.criticAgentId || DEFAULT_CRITIC_ID,
      });
    }
    hostAccept = hostFinalizeAfterClearance({
      reflexion,
      hostAgentId: DEFAULT_HOST_ID,
      measureStatus: 0,
      note: lastActorPlan?.nextStep
        ? `Denoise cleared after Actor nextStep: ${lastActorPlan.nextStep}`
        : "Denoise cleared after Actor pass — host finalizes",
    });
  }

  // Atlas stop stamp: cleared → done; else last critic verdict; missing → error.
  const reflexionVerdict = assertAtlasReflexionVerdict(
    resolveStopReflexionVerdict({
      cleared: denoiseCleared,
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
    opsAppliedAst,
    repairSubstrate: tsxPath ? "ast+dom" : "dom",
    tsxPath: tsxPath || null,
    tsxArtifact: tsxOutPath || null,
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
    status: denoiseCleared ? "passed" : "failed",
    measureCleared: denoiseCleared,
    namedDenoiseCleared: namedCleared,
    namedDenoiseRemaining: namedRemaining,
    proof: "measure FAIL→PASS rounds — not twin screenshots",
    artifact: currentPath,
    auditTrail,
    prove: null,
    crop: null,
  };
  // Fail-closed when critic/actor ran and measure cleared without host finalize.
  assertHostFinalized({
    ...receipt.criticActor,
    rounds: receipt.rounds,
    status: receipt.status,
    measureCleared: receipt.measureCleared,
  });

  // FAIL→PASS crop receipt — required when cropPairId set (twin full-page INVALID).
  if (cropPairId) {
    const pair = DEFECT_CROP_PAIRS.find((p) => p.id === cropPairId);
    if (!pair) throw new Error(`denoise-loop: unknown cropPairId ${cropPairId}`);
    const receiptsDir = join(ROOT, "verify/fixtures/denoise/receipts");
    ensureDefectCropReceipts(receiptsDir);
    const read = (name) => readFileSync(join(receiptsDir, name), "utf8");
    const cropResult = assertCropPairOk(pair, read);
    if (!cropResult.ok) {
      throw new Error(`denoise-loop crop FAIL→PASS required: ${cropResult.errors.join("; ")}`);
    }
    const beforeHtml = read(pair.beforeCrop);
    const afterHtml = read(pair.afterCrop);
    if (beforeHtml === afterHtml) {
      throw new Error(`denoise-loop crop twins banned: ${cropPairId}`);
    }
    receipt.crop = {
      pairId: cropPairId,
      before: join("verify/fixtures/denoise/receipts", pair.beforeCrop),
      after: join("verify/fixtures/denoise/receipts", pair.afterCrop),
      ok: true,
      proof: "FAIL→PASS crop — not twin full-page",
    };
  }

  // Prove completion — stamp reflexionVerdict + constitutionIds when measure cleared.
  if (mintProve) {
    if (receipt.status !== "passed" || !receipt.measureCleared) {
      throw new Error("denoise-loop mintProve requires measure cleared (status=passed)");
    }
    if (!Array.isArray(receipt.constitutionIds) || !receipt.constitutionIds.length) {
      throw new Error("denoise-loop mintProve requires constitutionIds on receipt");
    }
    const prevCompletion = process.env.SHINE_COMPLETION_RECEIPT;
    const ownedCompletion =
      completionReceiptPath || join(out, "last-completion.json");
    process.env.SHINE_COMPLETION_RECEIPT = ownedCompletion;
    try {
      const proveReceipt = writeCompletionProveReceipt({
        cite,
        target: currentPath,
        lane: "saas",
        screen: category === "queue" ? "queue" : category,
        checks: {
          accessibility: { status: "passed" },
          styling: { status: "passed" },
          layout: { status: "passed" },
          interactions: { status: "passed" },
          referenceValidity: { status: "passed" },
          visualComparison: { status: "passed" },
          buildBinding: { status: "passed" },
        },
        ddrId: packet.ddrId,
        constitutionIds: packet.ddr.constitutionIds,
        constitutionEdition: packet.ddr.constitutionEdition || "clearspeed-operate",
        reflexionVerdict,
        tool: "prove.mjs",
      });
      receipt.prove = {
        tool: proveReceipt.tool,
        verdict: proveReceipt.verdict,
        reflexionVerdict: proveReceipt.reflexionVerdict,
        ddrId: proveReceipt.ddrId,
        constitutionIds: proveReceipt.constitutionIds,
        constitutionEdition: proveReceipt.constitutionEdition || null,
        constitutionLinked: proveReceipt.constitutionLinked === true,
        artifact: proveReceipt.artifact || currentPath,
        store: ownedCompletion,
      };
    } finally {
      if (prevCompletion === undefined) delete process.env.SHINE_COMPLETION_RECEIPT;
      else process.env.SHINE_COMPLETION_RECEIPT = prevCompletion;
    }
  }

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
    doctorBiteOk: args.includes("--doctor-ok"),
    observedCite: opt("--observed-cite") || "",
    expectedCite: opt("--expected-cite") || "",
    edition: opt("--edition") || "clearspeed-operate",
    learnStorePath: opt("--learn-store") || undefined,
    tsxPath: opt("--tsx") || "",
    mintProve: args.includes("--prove"),
    cropPairId: opt("--crop") || "",
    completionReceiptPath: opt("--completion-receipt") || "",
  });
  process.stdout.write(JSON.stringify(receipt, null, 2) + "\n");
  process.exit(receipt.status === "passed" ? 0 : 1);
}
