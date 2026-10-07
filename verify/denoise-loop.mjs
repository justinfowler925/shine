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
  assertActorMayImplement,
  assertHostFinalized,
  hostFinalizeAfterClearance,
  runCriticActorHostRound,
} from "../core/critic-actor-host.mjs";
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
  });

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
  let criticRan = false;
  let round = 1;
  let retriesUsed = 0;
  while (lastMeasure.status !== 0 && round < MAX_ROUNDS) {
    round++;
    // Host-orchestrated Critic≠Actor round (not inline accept/plan).
    const hostRound = await runCriticActorHostRound({
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
    });
    criticRan = true;
    reflexion = hostRound.reflexion;
    if (hostRound.hostAccept) hostAccept = hostRound.hostAccept;
    lastActorPlan = hostRound.actorPlan;

    if (hostRound.disposition !== "actor-proceed") {
      rounds.push({
        round,
        turn: "critic",
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
        measureStatus: lastMeasure.status,
        failures: lastMeasure.failures,
      });
      break;
    }

    // Actor implement turn — one imperative next step; never accepts its own review.
    assertActorMayImplement(hostRound.actorPlan);
    retriesUsed++;
    const again = applyDomRestructure(html, plan);
    html = again.html;
    currentPath = join(out, `round-${round}.html`);
    writeFileSync(currentPath, html);
    lastMeasure = measure(currentPath, cite);
    rounds.push({
      round,
      turn: "actor",
      disposition: hostRound.disposition,
      reflexion: {
        verdict: reflexion.verdict,
        nextStep: reflexion.nextStep,
        criticAgentId: reflexion.criticAgentId,
        actorAgentId: reflexion.actorAgentId,
        selfAcceptBanned: true,
      },
      actor: hostRound.actorPlan,
      measureStatus: lastMeasure.status,
      failures: lastMeasure.failures,
    });
  }

  // Thin-spot fix: when Actor cleared measure after a partial, Host must finalize.
  if (criticRan && lastMeasure.status === 0 && !hostAccept?.accepted && reflexion) {
    hostAccept = hostFinalizeAfterClearance({
      reflexion,
      hostAgentId: DEFAULT_HOST_ID,
      measureStatus: lastMeasure.status,
      note: lastActorPlan?.nextStep
        ? `Measure cleared after Actor nextStep: ${lastActorPlan.nextStep}`
        : "Measure cleared after Actor pass — host finalizes",
    });
  }

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
    criticActor: {
      criticAgentId: DEFAULT_CRITIC_ID,
      actorAgentId: DEFAULT_ACTOR_ID,
      hostAgentId: DEFAULT_HOST_ID,
      selfAcceptBanned: true,
      hostOrchestrator: "core/critic-actor-host.mjs",
      hostAccept,
    },
    rounds,
    status: lastMeasure.status === 0 ? "passed" : "failed",
    measureCleared: lastMeasure.status === 0,
    proof: "measure FAIL→PASS rounds — not twin screenshots",
    artifact: currentPath,
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
  });
  process.stdout.write(JSON.stringify(receipt, null, 2) + "\n");
  process.exit(receipt.status === "passed" ? 0 : 1);
}
