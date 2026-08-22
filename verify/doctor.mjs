#!/usr/bin/env node
// shine-lint: off color spacing type shadow — this file holds the fixtures the gates are
// fed (a raw hex, an off-scale padding, a literal font-size and a hand-rolled shadow,
// below). A checker cannot prove a rule bites without stating the violation, so it is
// exempt by pragma rather than by hiding the literal from itself. Named rules, not a bare
// `off`: the point of the scoped form is that the file's own exemption is auditable, and
// this file is the one that has to model it.
//
// shine doctor — is the design authority actually in force?
//
// Every shine failure so far has been a wiring failure, not a taste failure: the
// skill scoped to six file extensions so it never loaded for UI inside a .py; the
// per-edit lint keyed on the same extensions; Cursor never wired that lint at all;
// the stop sweep wired on one surface only, with its own stale copy of the file
// list; and the lint blocking the token layer it depends on. None of those printed
// an error. They all looked like "no findings".
//
// So this is the routine for changing shine: make the change, then run
//   node verify/doctor.mjs
// and read the FAIL lines. It checks the wiring, proves the gates bite by feeding
// them a known violation, and checks the token layer reached every consumer.
//
// Usage: node verify/doctor.mjs [--ci] [--quiet]
//   --ci     skip machine-local checks (hook wirings, skill symlinks, vendored copies)
//   --quiet  print only failures (for a sessionStart hook)

import { readFileSync, readdirSync, existsSync, realpathSync, mkdtempSync, writeFileSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir, homedir } from "node:os";
import { NODE_PATH } from "./deps.mjs";

const SHINE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const HOME = homedir();
const args = process.argv.slice(2);
const CI = args.includes("--ci");
const QUIET = args.includes("--quiet");

const results = [];
const ok = (name, detail = "") => results.push({ pass: true, name, detail });
const fail = (name, detail) => results.push({ pass: false, name, detail });
// A third state, because "not configured" is not "verified". Counting an unrun check as
// a pass is how a suite reports 43/43 while the thing it governs is broken; NOTE keeps
// the run green without ever claiming the check happened.
const note = (name, detail) => results.push({ pass: true, note: true, name, detail });

const readJSON = (p) => JSON.parse(readFileSync(p, "utf8"));
const has = (obj, pred) => JSON.stringify(obj ?? null).match(pred);

// ---- 0. what tree is being measured? ---------------------------------------
// A doctor run on a checkout parked behind origin/main reports findings about a
// superseded tree, and every one of them renders exactly like a finding about
// the repo. Observed 2026-08-19: the sessionStart doctor announced the site
// listing off by one ("templates.md says 160, is 161") from a shared checkout
// six commits behind main with another session's uncommitted template edits —
// main itself was green. Dirty alone stays OK (running the doctor on your own
// in-flight edit is the normal loop); BEHIND is what makes findings fiction.
{
  const git = (...a) => spawnSync("git", a, { cwd: SHINE, encoding: "utf8" });
  const mainRef = git("rev-parse", "--verify", "--quiet", "origin/main");
  // A shallow graft cannot answer ancestry: actions/checkout fetches only the
  // PR merge ref at --depth=1, cutting parent links, so rev-list "sees" the
  // workspace's remembered origin/main as unreachable and reports a fresh
  // merge commit as 1 BEHIND. Observed on this repo's own runner, first run
  // of this check. Shallow means "cannot know", which is a skip, not a fail.
  const shallow = git("rev-parse", "--is-shallow-repository").stdout.trim() === "true";
  if (mainRef.status !== 0 || shallow) {
    note("checkout current", shallow ? "shallow checkout — ancestry unknowable, skipped" : "no origin/main ref — skipped");
  } else {
    const behind = Number(git("rev-list", "--count", "HEAD..origin/main").stdout.trim() || "0");
    const branch = git("branch", "--show-current").stdout.trim() || "detached";
    const porcelain = git("status", "--porcelain").stdout.trim();
    const dirty = porcelain ? porcelain.split("\n").length : 0;
    const where = `${branch}${dirty ? `, ${dirty} dirty file${dirty === 1 ? "" : "s"}` : ""}`;
    if (behind > 0) {
      fail(
        "checkout current",
        `measuring ${where}, ${behind} commit${behind === 1 ? "" : "s"} BEHIND origin/main — ` +
          "every finding below is about this tree, not the repo; sync main before trusting them",
      );
    } else {
      ok("checkout current", where);
    }
  }
}

// ---- 1. the skill can load at all -----------------------------------------
{
  const p = join(SHINE, "skill/SKILL.md");
  const text = readFileSync(p, "utf8");
  const fm = text.split(/^---$/m)[1] ?? "";
  const gate = /^\s*(paths|globs)\s*:/m.exec(fm);
  if (gate) {
    fail("skill frontmatter", `\`${gate[1]}:\` scopes the skill to matching files, so Cursor withholds it everywhere else. Remove it.`);
  } else if (!/^\s*name\s*:/m.test(fm) || !/^\s*description\s*:/m.test(fm)) {
    fail("skill frontmatter", "needs name + description");
  } else {
    ok("skill frontmatter", "name + description, unscoped");
  }
}

// ---- 2. the skill is deployed to both surfaces ----------------------------
if (!CI) {
  for (const [surface, p] of [
    ["Cursor", join(HOME, ".cursor/skills/shine")],
    ["Claude Code", join(HOME, ".claude/skills/shine")],
  ]) {
    const want = join(SHINE, "skill");
    if (!existsSync(p)) fail(`${surface} skill deployed`, `missing: ln -s ${want} ${p}`);
    else if (realpathSync(p) !== realpathSync(want))
      fail(`${surface} skill deployed`, `points at ${realpathSync(p)}, not ${want}`);
    else ok(`${surface} skill deployed`, p.replace(HOME, "~"));
  }
}

// ---- 2b. shine-ux subagent on both surfaces (thin executor over the skill) -
if (!CI) {
  const want = join(SHINE, "agents/shine-ux.md");
  if (!existsSync(want)) fail("shine-ux agent source", `missing ${want}`);
  else {
    ok("shine-ux agent source", "agents/shine-ux.md");
    for (const [surface, p] of [
      ["Cursor", join(HOME, ".cursor/agents/shine-ux.md")],
      ["Claude Code", join(HOME, ".claude/agents/shine-ux.md")],
    ]) {
      if (!existsSync(p)) fail(`${surface} shine-ux agent`, `missing: ln -s ${want} ${p}`);
      else if (realpathSync(p) !== realpathSync(want))
        fail(`${surface} shine-ux agent`, `points at ${realpathSync(p)}, not ${want}`);
      else ok(`${surface} shine-ux agent`, p.replace(HOME, "~"));
    }
  }
}

// ---- 2c. wireframe assets (gray-box mode) ---------------------------------
{
  const css = join(SHINE, "skill/assets/wireframe.css");
  const fixture = join(SHINE, "verify/fixtures/wireframe-sample.html");
  if (!existsSync(css)) fail("wireframe.css", `missing ${css}`);
  else ok("wireframe.css", "skill/assets/wireframe.css");
  if (!existsSync(fixture)) fail("wireframe fixture", `missing ${fixture}`);
  else {
    const html = readFileSync(fixture, "utf8");
    const checks = [
      [/data-shine-wireframe/, "data-shine-wireframe"],
      [/data-primary/, "data-primary"],
      [/data-job=/, "data-job"],
      [/data-cite=/, "data-cite"],
      [/color-scheme:\s*light/, "color-scheme: light"],
    ];
    const missing = checks.filter(([re]) => !re.test(html)).map(([, name]) => name);
    if (missing.length) fail("wireframe fixture", `missing: ${missing.join(", ")}`);
    else ok("wireframe fixture", "structural markers present");
  }
  // Craft exemption must actually work — a fixture that fails measure while the
  // docs claim exemption is the same lie as a gate that never bites.
  if (!CI && existsSync(fixture)) {
    const r = spawnSync(process.execPath, [join(SHINE, "verify/measure.mjs"), fixture], {
      encoding: "utf8",
      env: { ...process.env, NODE_PATH },
    });
    if (r.status === 0) ok("wireframe measure exempt", "craft hard-fails skipped; structure held");
    else {
      fail(
        "wireframe measure exempt",
        (r.stderr || r.stdout || "").trim().split("\n").filter((l) => l.includes("✗") || l.includes("FAIL")).slice(0, 4).join(" · ") ||
          `measure exited ${r.status}`,
      );
    }
  }
}

// ---- 2d. root install scripts match the README ---------------------------
{
  const pkg = JSON.parse(readFileSync(join(SHINE, "package.json"), "utf8"));
  const need = ["build", "verify", "doctor", "measure", "cite", "compare"];
  const missing = need.filter((s) => !pkg.scripts?.[s]);
  if (missing.length) fail("root npm scripts", `package.json missing: ${missing.join(", ")}`);
  else ok("root npm scripts", need.join(", "));
  const regIndex = join(SHINE, "site/r/index.html");
  if (!existsSync(regIndex)) fail("registry /r/", "site/r/index.html missing (bare /r/ 404s)");
  else {
    const html = readFileSync(regIndex, "utf8");
    const problems = [];
    if (!/data-cite=/.test(html)) problems.push("no catalog cite");
    if (/#f97316|#0c0c0e|#f4f4f5|#a1a1aa|#27272a/.test(html)) {
      problems.push("raw zinc/orange hex — the public registry page is off-token");
    }
    if (!/var\(--bg\)/.test(html)) problems.push("no shine token vars");
    if (problems.length) fail("registry /r/", problems.join("; "));
    else ok("registry /r/", "present, cited, tokenised");
  }
}

// ---- 3. four hook wirings: per-edit and turn-end, on both surfaces --------
if (!CI) {
  const wirings = [
    {
      name: "Claude Code per-edit lint",
      file: join(HOME, ".claude/settings.json"),
      key: "PostToolUse",
      pat: /design-lint\.mjs/,
    },
    {
      name: "Claude Code stop sweep",
      file: join(HOME, ".claude/settings.json"),
      key: "Stop",
      pat: /stop-sweep\.mjs/,
    },
    {
      name: "Cursor per-edit lint",
      file: join(HOME, ".cursor/hooks.json"),
      key: "afterFileEdit",
      pat: /design-lint\.mjs/,
    },
    {
      name: "Cursor stop sweep",
      file: join(HOME, ".cursor/hooks.json"),
      key: "stop",
      pat: /stop-sweep\.mjs/,
    },
    // This script, at session start, so a broken wiring is reported before the
    // agent makes design decisions rather than after someone notices bad output.
    {
      name: "Claude Code doctor at session start",
      file: join(HOME, ".claude/settings.json"),
      key: "SessionStart",
      pat: /doctor\.mjs/,
    },
    {
      name: "Cursor doctor at session start",
      file: join(HOME, ".cursor/hooks.json"),
      key: "sessionStart",
      pat: /doctor\.mjs/,
    },
  ];
  for (const w of wirings) {
    if (!existsSync(w.file)) {
      fail(w.name, `${w.file.replace(HOME, "~")} does not exist`);
      continue;
    }
    let conf;
    try {
      conf = readJSON(w.file);
    } catch (e) {
      fail(w.name, `${w.file.replace(HOME, "~")} is not valid JSON: ${e.message}`);
      continue;
    }
    const branch = conf.hooks?.[w.key];
    if (branch && has(branch, w.pat)) ok(w.name, `${w.key} in ${w.file.replace(HOME, "~")}`);
    else fail(w.name, `no ${w.pat.source} under hooks.${w.key} in ${w.file.replace(HOME, "~")}`);
  }

  // The plugin-shipped copy, for anyone installing shine as a Claude Code plugin.
  const plugin = join(SHINE, "hooks/hooks.json");
  const conf = readJSON(plugin);
  const missing = [
    ["PostToolUse", /design-lint\.mjs/],
    ["Stop", /stop-sweep\.mjs/],
  ].filter(([k, pat]) => !has(conf.hooks?.[k], pat));
  if (missing.length) fail("plugin hooks.json", `missing ${missing.map(([k]) => k).join(", ")}`);
  else ok("plugin hooks.json", "PostToolUse + Stop");
}

// ---- 4. the gates actually bite -------------------------------------------
// A gate never observed failing is decoration. Feed each one a known violation
// inside a .py, which is the shape that slipped past every earlier version.
{
  const dir = mkdtempSync(join(tmpdir(), "shine-doctor-"));
  const lint = join(SHINE, "hooks/design-lint.mjs");
  const bad = join(dir, "ui.py");
  const good = join(dir, "clean.py");
  const plain = join(dir, "plain.py");
  writeFileSync(bad, 'H = """<style>.a{color:#ff0044;padding:13px}</style>"""\n');
  writeFileSync(good, 'H = """<style>.a{color:var(--shine-color-fg)}</style>"""\n');
  writeFileSync(plain, "def f():\n    return 1  # 13px in a comment, not UI\n");

  // Shadow and tracking got tokens on 2026-08-09, and a token nothing enforces is a
  // suggestion. The negative cases matter as much: a focus ring and an inset highlight
  // are not elevation, and blocking them would send people straight to a pragma —
  // which is the failure this whole change exists to remove.
  const shadowBad = join(dir, "elev.css");
  const shadowOk = join(dir, "elev-ok.css");
  const trackBad = join(dir, "track.css");
  const scoped = join(dir, "scoped.css");
  writeFileSync(shadowBad, ".c{box-shadow:0 2px 8px var(--shine-color-border)}\n");
  writeFileSync(
    shadowOk,
    ".c{box-shadow:var(--shine-shadow-md)}\n" +
      ".r{box-shadow:0 0 0 2px var(--shine-color-ring)}\n" +
      ".i{box-shadow:inset 0 1px 0 var(--shine-color-border)}\n",
  );
  writeFileSync(trackBad, ".t{letter-spacing:0.08em}\n");
  // Prose that documents a rule quotes the value it forbids — shine's own site explains
  // why `text-[#1a1a1a]` erodes a token contract and was reported for it. Masking
  // <code>/<pre> content and HTML comments must not also mask a real violation, so this
  // fixture carries both in one file and expects exactly the real one to block.
  // A LEGAL token that produces illegible text. Until 2026-08-16 the colour rule asked
  // only whether a token was used, never whether the chosen one works — so --mute
  // (4.12:1) and --mute-2 (2.59:1) linted clean and 130 such declarations shipped across
  // a consumer site while this doctor reported every check passing. The safe-token
  // fixture matters as much: if the rule fired on the *replacement* it recommends,
  // everyone would reach for a pragma and be worse off than before.
  const dimText = join(dir, "dim.css");
  const dimOk = join(dir, "dim-ok.css");
  writeFileSync(dimText, ".cap{color:var(--mute-2)}\n");
  writeFileSync(dimOk, ".cap{color:var(--shine-color-fg-muted)}\n");

  const prose = join(dir, "prose.html");
  writeFileSync(
    prose,
    "<p>Never write <code>text-[#1a1a1a]</code> in markup.</p>\n" +
      "<!-- a comment mentioning #ff0000 -->\n" +
      '<code class="text-[#1a1a1a]">still blocks</code>\n',
  );
  writeFileSync(
    scoped,
    "/* shine-lint: off shadow — doctor fixture */\n" +
      ".c{box-shadow:0 2px 8px var(--shine-color-border)}\n" +
      ".bad{color:#ff0044}\n",
  );

  const run = (file) => spawnSync("node", [lint, file], { encoding: "utf8" });
  const cases = [
    ["blocks embedded raw hex in .py", bad, 1],
    ["passes a tokenized .py", good, 0],
    ["ignores a .py with no UI in it", plain, 0],
    ["blocks a hand-rolled box-shadow", shadowBad, 1],
    ["passes shadow token, focus ring and inset", shadowOk, 0],
    ["blocks a literal letter-spacing", trackBad, 1],
    ["blocks an AA-failing token used as text", dimText, 1],
    ["passes the safe token it recommends", dimOk, 0],
  ];
  for (const [name, file, want] of cases) {
    const r = run(file);
    if (r.status === want) ok(`per-edit lint ${name}`);
    else fail(`per-edit lint ${name}`, `exit ${r.status}, expected ${want}${r.stderr ? `: ${r.stderr.split("\n")[0]}` : ""}`);
  }

  // The scoped pragma is the whole point: a bare `shine-lint: off` is what let
  // mobile.css run with no colour or type checking for months on a stated reason of
  // widget geometry. Naming one rule must silence that rule and nothing else.
  const pr = run(prose);
  const quotedIgnored = (pr.stderr.match(/text-\[#1a1a1a\]/g) ?? []).length === 1;
  const attrBlocks = /prose\.html:3/.test(pr.stderr);
  const commentIgnored = !/#ff0000/.test(pr.stderr);
  if (pr.status === 1 && quotedIgnored && attrBlocks && commentIgnored)
    ok("per-edit lint ignores quoted values in <code> but not in an attribute");
  else
    fail(
      "per-edit lint ignores quoted values in <code> but not in an attribute",
      `exit ${pr.status}, ${JSON.stringify(pr.stderr.slice(0, 160))}`,
    );

  const sc = run(scoped);
  const silenced = !/box-shadow/.test(sc.stderr);
  const stillBites = /raw hex/.test(sc.stderr) && sc.status === 1;
  if (silenced && stillBites) ok("per-edit lint scoped pragma silences only the named rule");
  else
    fail(
      "per-edit lint scoped pragma silences only the named rule",
      `exit ${sc.status}, shadow ${silenced ? "silenced" : "STILL REPORTED"}, colour ${stillBites ? "still bites" : "ALSO SILENCED"}`,
    );

  // Stop sweep, both surfaces, over a real git repo.
  const git = (...a) => spawnSync("git", a, { cwd: dir, encoding: "utf8" });
  git("init", "-q", ".");
  git("add", "-A");
  const sweep = join(SHINE, "hooks/stop-sweep.mjs");
  const feed = (event) =>
    spawnSync("node", [sweep], { input: JSON.stringify({ ...event, cwd: dir }), encoding: "utf8" });

  const cursor = feed({ hook_event_name: "stop", conversation_id: "doctor" });
  if (cursor.status === 2 && /BLOCK/.test(cursor.stderr)) ok("stop sweep blocks (Cursor contract)");
  else fail("stop sweep blocks (Cursor contract)", `exit ${cursor.status}, stderr ${JSON.stringify(cursor.stderr.slice(0, 120))}`);

  const claude = feed({ hook_event_name: "Stop", stop_hook_active: false });
  if (claude.status === 0 && /"decision"\s*:\s*"block"/.test(claude.stdout))
    ok("stop sweep blocks (Claude Code contract)");
  else fail("stop sweep blocks (Claude Code contract)", `exit ${claude.status}, stdout ${JSON.stringify(claude.stdout.slice(0, 120))}`);
}

// ---- 4b. the composition gate bites, and does not cry wolf ----------------
// Skipped by default: this one launches Chromium, and the doctor runs at session start.
// Run `node verify/doctor.mjs --full` when changing measure.mjs.
//
// Both directions matter equally. The composition checks exist because a prior surface passed
// every per-element gate — axe clean, 6.85:1 worst contrast, spacing on scale — on a
// screen whose largest region was an empty void. But the first version of the void check
// flagged shine's own site screenshots (an <img> has no text and no children), and a gate
// with false positives is a gate someone switches off.
if (args.includes("--full")) {
  const dir = mkdtempSync(join(tmpdir(), "shine-compose-"));
  const measure = join(SHINE, "verify/measure.mjs");
  const page = (body, head = "") =>
    `<!doctype html><html><head><meta charset="utf-8"><style>` +
    `:root{color-scheme:dark}body{background:#0c0a09;color:#fafaf9;font:15px/1.5 system-ui;margin:0;padding:16px}` +
    `${head}</style></head><body>${body}</body></html>`;

  // A void: one region over 15% of the viewport with nothing in it.
  const badFile = join(dir, "void.html");
  writeFileSync(badFile, page(`<h1>Title</h1><div id="panel" style="width:900px;height:600px"></div>`));
  // Clean: same geometry, but the region carries an empty state + one filled primary.
  const goodFile = join(dir, "clean.html");
  writeFileSync(
    goodFile,
    page(
      `<h1>Title</h1><div id="panel" style="width:900px;height:600px">` +
        `<p>Nothing here yet</p><p>Captured ideas will land in this panel.</p>` +
        `<button style="background:#a8a29e;color:#0c0a09;border:0;padding:10px 16px;font:inherit">Add one</button></div>`,
    ),
  );

  const run = (f) =>
    spawnSync("node", [measure, f], {
      encoding: "utf8",
      env: { ...process.env, NODE_PATH },
    });

  // measure.mjs prints verdicts on stderr and the summary on stdout. Asserting against
  // stdout made the catch-case look broken and the clean-case pass vacuously — a check
  // reading the wrong stream cannot fail for the right reason.
  const bad = run(badFile);
  if (bad.status === 1 && /composition: div#panel is \d/.test(bad.stderr)) ok("compose gate catches a void region");
  else fail("compose gate catches a void region", `exit ${bad.status}; stderr ${JSON.stringify(bad.stderr.slice(-160))}`);

  const good = run(goodFile);
  if (!/composition:/.test(good.stderr)) ok("compose gate passes a region with an empty state");
  else fail("compose gate passes a region with an empty state", good.stderr.match(/composition:.*/)?.[0] ?? "");

  // The contrast probe samples the background under a text rect. Which rect it
  // picks is the whole game: selectNodeContents(el) spans child elements, so a
  // flex header reported 1.11:1 for legible stone-400 because its box was a
  // 1038px row of background. Loosening that must not stop it seeing real
  // low-contrast text, so both cases are pinned.
  const dimFile = join(dir, "dim.html");
  writeFileSync(dimFile, page(`<p style="color:#2a2825">Barely visible against the page</p>`));
  const dim = run(dimFile);
  if (/contrast: <p>/.test(dim.stderr)) ok("contrast gate still catches unreadable text");
  else fail("contrast gate still catches unreadable text", `exit ${dim.status}; stderr ${JSON.stringify(dim.stderr.slice(-160))}`);

  // The same unreadable text, authored in OKLCH. `getComputedStyle().color` comes back in
  // the author's colour space, and the probe used to parse it with an rgb()-only regex —
  // so every OKLCH page skipped every element through a silent `continue` and printed
  // "0 text elements measured" above a PASS. OKLCH is the colour space rule 1 is about,
  // which made the contrast gate absent on precisely the pages built to this skill.
  // Two assertions, because either alone can pass while the gate is broken: it must FAIL,
  // and it must have measured something.
  const oklchFile = join(dir, "oklch.html");
  writeFileSync(
    oklchFile,
    page(`<p style="color:oklch(0.28 0.01 235)">Barely visible, authored in OKLCH</p>`),
  );
  const okl = run(oklchFile);
  const measuredSome = !/contrast: 0 text elements measured/.test(okl.stdout);
  if (/contrast: <p>/.test(okl.stderr) && measuredSome) ok("contrast gate reads OKLCH text colour");
  else
    fail(
      "contrast gate reads OKLCH text colour",
      measuredSome
        ? `exit ${okl.status}; no contrast failure reported`
        : `measured 0 elements — the colour never resolved`,
    );

  // And the silence itself is now a failure: targets found, none measured, is not a pass.
  const blindFile = join(dir, "blind.html");
  writeFileSync(blindFile, page(`<p style="color:color(display-p3 0.9 0.9 0.9)">Wide-gamut text</p>`));
  const blind = run(blindFile);
  if (!/contrast: \d+ text elements found and 0 measured/.test(blind.stderr))
    ok("contrast gate measures a wide-gamut colour rather than skipping it");
  else fail("contrast gate measures a wide-gamut colour rather than skipping it", blind.stderr.match(/contrast: .*/)?.[0] ?? "");

  // A wide flex header whose own text is legible: the false positive this fixes.
  const flexFile = join(dir, "flex.html");
  writeFileSync(
    flexFile,
    page(
      `<h2 style="display:flex;justify-content:space-between;align-items:center;width:1000px;color:#a8a29e">` +
        `Queue<span style="color:#fb923c">drafting</span><span>238</span></h2>`,
    ),
  );
  const flex = run(flexFile);
  if (!/contrast: <h2>/.test(flex.stderr)) ok("contrast gate does not fail a wide flex header");
  else fail("contrast gate does not fail a wide flex header", flex.stderr.match(/contrast: <h2>.*/)?.[0] ?? "");

  // Truncated text: a range reports the FULL text extent, not the painted part,
  // so a 240px ellipsised cell returned a 700px box that ran across the bright
  // text beside it and sampled those glyphs as its own background.
  const clipFile = join(dir, "clipped.html");
  writeFileSync(
    clipFile,
    page(
      `<div style="display:flex;gap:12px;width:1000px">` +
        `<p class="cell" style="width:240px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;color:#a8a29e">` +
        `A deliberately long line of legible secondary text that cannot fit inside its own column and is truncated</p>` +
        `<p style="color:#fafaf9;font-weight:700">BRIGHT NEIGHBOUR TEXT</p></div>`,
    ),
  );
  const clipped = run(clipFile);
  if (!/contrast: <p>/.test(clipped.stderr)) ok("contrast gate clips a run to the painted box");
  else fail("contrast gate clips a run to the painted box", clipped.stderr.match(/contrast: <p>.*/)?.[0] ?? "");

  // Hierarchy: interactive controls with no filled primary must fail.
  const noPrimaryFile = join(dir, "no-primary.html");
  writeFileSync(
    noPrimaryFile,
    page(
      `<h1>Queue</h1><p>Three peer actions, none filled.</p>` +
        `<button style="background:transparent;color:#fafaf9;border:1px solid #444;padding:10px 16px;font:inherit">Edit</button> ` +
        `<button style="background:transparent;color:#fafaf9;border:1px solid #444;padding:10px 16px;font:inherit">Share</button> ` +
        `<button style="background:transparent;color:#fafaf9;border:1px solid #444;padding:10px 16px;font:inherit">Archive</button>`,
    ),
  );
  const noPrimary = run(noPrimaryFile);
  if (noPrimary.status === 1 && /hierarchy: .*0 filled/.test(noPrimary.stderr))
    ok("compose gate catches missing primary action");
  else
    fail(
      "compose gate catches missing primary action",
      `exit ${noPrimary.status}; stderr ${JSON.stringify(noPrimary.stderr.slice(-200))}`,
    );

  // Hierarchy: more than two filled treatments must fail.
  const multiPrimaryFile = join(dir, "multi-primary.html");
  writeFileSync(
    multiPrimaryFile,
    page(
      `<h1>Queue</h1>` +
        `<button style="background:#a8a29e;color:#0c0a09;border:0;padding:10px 16px;font:inherit">Save</button> ` +
        `<button style="background:#78716c;color:#fafaf9;border:0;padding:10px 16px;font:inherit">Publish</button> ` +
        `<button style="background:#57534e;color:#fafaf9;border:0;padding:10px 16px;font:inherit">Deploy</button>`,
    ),
  );
  const multiPrimary = run(multiPrimaryFile);
  if (multiPrimary.status === 1 && /hierarchy: .*competing filled/.test(multiPrimary.stderr))
    ok("compose gate catches competing primaries");
  else
    fail(
      "compose gate catches competing primaries",
      `exit ${multiPrimary.status}; stderr ${JSON.stringify(multiPrimary.stderr.slice(-200))}`,
    );

  // One filled primary — hierarchy clean (may still pass other gates).
  const onePrimaryFile = join(dir, "one-primary.html");
  writeFileSync(
    onePrimaryFile,
    page(
      `<h1>Queue</h1><p>One clear next action.</p>` +
        `<button style="background:#a8a29e;color:#0c0a09;border:0;padding:10px 16px;font:inherit">Save</button> ` +
        `<button style="background:transparent;color:#fafaf9;border:1px solid #444;padding:10px 16px;font:inherit">Cancel</button>`,
    ),
  );
  const onePrimary = run(onePrimaryFile);
  if (!/hierarchy:/.test(onePrimary.stderr)) ok("compose gate passes a single primary");
  else fail("compose gate passes a single primary", onePrimary.stderr.match(/hierarchy:.*/)?.[0] ?? "");

  // Type-step collision: 14px and 15px both used heavily (real failure).
  const collideFile = join(dir, "type-collide.html");
  const collideBody =
    `<h1 style="font-size:24px">Title</h1>` +
    Array.from({ length: 8 }, (_, i) => `<p style="font-size:14px">Row ${i} secondary</p>`).join("") +
    Array.from({ length: 8 }, (_, i) => `<p style="font-size:15px">Row ${i} body copy here</p>`).join("");
  writeFileSync(collideFile, page(collideBody));
  const collide = run(collideFile);
  if (collide.status === 1 && /type scale: 14px and 15px/.test(collide.stderr))
    ok("compose gate catches colliding type steps");
  else
    fail(
      "compose gate catches colliding type steps",
      `exit ${collide.status}; stderr ${JSON.stringify(collide.stderr.slice(-200))}`,
    );

  // Density: app-shell probe with chrome dominating an empty main.
  const densityBad = join(dir, "density-bad.html");
  writeFileSync(
    densityBad,
    `<!doctype html><html lang="en" data-shine-probe="app-shell"><head><meta charset="utf-8"><title>Density bad</title><style>` +
      `:root{color-scheme:dark}body{margin:0;background:#0c0a09;color:#fafaf9;font:15px/1.5 system-ui;display:flex}` +
      `aside{width:420px;height:100vh;border-right:1px solid #333;padding:16px}` +
      `main{flex:1;padding:16px}</style></head><body>` +
      `<aside><p>Nav</p><p>Item</p><p>Item</p></aside>` +
      `<main><h1>Almost empty</h1></main></body></html>`,
  );
  const densBad = run(densityBad);
  if (densBad.status === 1 && /density: app-shell content share/.test(densBad.stderr))
    ok("compose gate catches app-shell density failure");
  else
    fail(
      "compose gate catches app-shell density failure",
      `exit ${densBad.status}; stderr ${JSON.stringify(densBad.stderr.slice(-220))}`,
    );

  // Density clean: opted-in shell with a real main job.
  const densityGood = join(dir, "density-good.html");
  writeFileSync(
    densityGood,
    `<!doctype html><html lang="en" data-shine-probe="app-shell"><head><meta charset="utf-8"><title>Density good</title><style>` +
      `:root{color-scheme:dark}body{margin:0;background:#0c0a09;color:#fafaf9;font:15px/1.5 system-ui;display:flex}` +
      `aside{width:200px;height:100vh;border-right:1px solid #333;padding:16px}` +
      `main{flex:1;padding:24px}button{background:#a8a29e;color:#0c0a09;border:0;padding:10px 16px;font:inherit}` +
      `</style></head><body>` +
      `<aside><p>Nav</p></aside>` +
      `<main><h1>Inbox</h1>` +
      `<p>Twelve threads need a reply before the Monday forecast call. Each row names the account, the stall reason, and the next step.</p>` +
      `<table style="width:100%;border-collapse:collapse">` +
      Array.from({ length: 10 }, (_, i) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #333">Account ${i}</td>` +
          `<td style="padding:8px;border-bottom:1px solid #333">No activity 21d</td></tr>`,
      ).join("") +
      `</table><p><button>Open next</button></p></main></body></html>`,
  );
  const densGood = run(densityGood);
  if (!/density:/.test(densGood.stderr)) ok("compose gate passes a dense app shell");
  else fail("compose gate passes a dense app shell", densGood.stderr.match(/density:.*/)?.[0] ?? "");

  const prettyTable = join(SHINE, "verify/fixtures/pretty-empty-table.html");
  const fullTable = join(SHINE, "verify/fixtures/full-table.html");
  const carbonShadcn = join(SHINE, "verify/fixtures/carbon-as-shadcn.html");
  const marketingShell = join(SHINE, "verify/fixtures/marketing-as-appshell.html");

  const pretty = run(prettyTable);
  if (pretty.status === 1 && /contract: named table missing/.test(pretty.stderr))
    ok("contract gate fails a pretty empty table");
  else
    fail(
      "contract gate fails a pretty empty table",
      `exit ${pretty.status}; stderr ${JSON.stringify(pretty.stderr.slice(-220))}`,
    );

  const full = run(fullTable);
  if (!/contract:/.test(full.stderr)) ok("contract gate passes a complete table");
  else fail("contract gate passes a complete table", full.stderr.match(/contract:.*/)?.[0] ?? "");

  const runCite = (f, id) => spawnSync("node", [measure, f, "--cite", id], { encoding: "utf8", env: { ...process.env, NODE_PATH } });
  const fakeCarbon = runCite(carbonShadcn, "carbon-datatable");
  if (fakeCarbon.status === 1 && /likeness: carbon cite/.test(fakeCarbon.stderr))
    ok("likeness gate fails carbon-as-shadcn");
  else
    fail(
      "likeness gate fails carbon-as-shadcn",
      `exit ${fakeCarbon.status}; stderr ${JSON.stringify(fakeCarbon.stderr.slice(-220))}`,
    );

  const fakeMkt = runCite(marketingShell, "magicui-hero");
  if (fakeMkt.status === 1 && /likeness: marketing cite/.test(fakeMkt.stderr))
    ok("likeness gate fails marketing-as-appshell");
  else
    fail(
      "likeness gate fails marketing-as-appshell",
      `exit ${fakeMkt.status}; stderr ${JSON.stringify(fakeMkt.stderr.slice(-220))}`,
    );

  const houseHot = join(dir, "house-chroma-hot.html");
  writeFileSync(
    houseHot,
    page(
      `<h1>House</h1><p>Accent outside the house band.</p>` +
        `<button data-primary style="background:oklch(0.72 0.32 40);color:#0c0a09;border:0;padding:10px 16px;font:inherit">Go</button>`,
      `html{color-scheme:dark}`,
    ).replace("<html>", '<html lang="en" data-shine-voice="house" data-chroma-check>'),
  );
  const hot = run(houseHot);
  if (hot.status === 1 && /chroma: house accent/.test(hot.stderr)) ok("chroma gate fails a hot house accent");
  else
    fail(
      "chroma gate fails a hot house accent",
      `exit ${hot.status}; stderr ${JSON.stringify(hot.stderr.slice(-220))}`,
    );

  const queueEx = join(SHINE, "verify/fixtures/queue.html");
  const mktEx = join(SHINE, "verify/fixtures/marketing.html");
  const qJson = join(dir, "queue.json");
  const mJson = join(dir, "marketing.json");
  const qRun = spawnSync("node", [measure, queueEx, "--cite", "carbon-datatable", "--json", qJson], {
    encoding: "utf8",
    env: { ...process.env, NODE_PATH },
  });
  if (qRun.status === 0) ok("acceptance queue measure");
  else fail("acceptance queue measure", `exit ${qRun.status}; stderr ${JSON.stringify(qRun.stderr.slice(-280))}`);
  const mRun = spawnSync("node", [measure, mktEx, "--cite", "magicui-hero", "--json", mJson], {
    encoding: "utf8",
    env: { ...process.env, NODE_PATH },
  });
  if (mRun.status === 0) ok("acceptance marketing measure");
  else fail("acceptance marketing measure", `exit ${mRun.status}; stderr ${JSON.stringify(mRun.stderr.slice(-280))}`);

  if (qRun.status === 0 && mRun.status === 0) {
    const qj = JSON.parse(readFileSync(qJson, "utf8"));
    const mj = JSON.parse(readFileSync(mJson, "utf8"));
    const qHead = qj.compose?.maxHeadingPx ?? 0;
    const mHead = mj.compose?.maxHeadingPx ?? 0;
    const split =
      qj.compose?.tableContract &&
      !mj.compose?.tableContract &&
      mHead >= 32 &&
      mHead - qHead >= 12 &&
      /carbon/i.test(qj.compose?.dnaFamily || "") &&
      /magicui/i.test(mj.compose?.dnaFamily || "");
    if (split) ok("acceptance screens distinguishable");
    else
      fail(
        "acceptance screens distinguishable",
        `queue heading ${qHead} table=${!!qj.compose?.tableContract} family=${qj.compose?.dnaFamily}; ` +
          `marketing heading ${mHead} table=${!!mj.compose?.tableContract} family=${mj.compose?.dnaFamily}`,
      );
  }
}

// ---- 5. every token reached every emit target -----------------------------
{
  const lanes = [
    ["personal", join(SHINE, "tokens/src/personal.tokens.json")],
    ["brand", join(SHINE, "tokens/src/brand.tokens.json")],
  ];
  for (const [lane, src] of lanes) {
    const ids = [];
    const walk = (node, path = []) => {
      for (const [k, v] of Object.entries(node)) {
        if (k.startsWith("$")) continue;
        if (v && typeof v === "object" && "$value" in v) ids.push([...path, k].join("-"));
        else if (v && typeof v === "object") walk(v, [...path, k]);
      }
    };
    walk(readJSON(src));
    const targets = ["tokens.css", "artifact.css", "theme.css", "tokens.py"].filter((f) =>
      existsSync(join(SHINE, "tokens/dist", lane, f)),
    );
    const stale = [];
    for (const t of targets) {
      const text = readFileSync(join(SHINE, "tokens/dist", lane, t), "utf8");
      // theme.css bridges only the namespaces Tailwind has; tokens.css is the full set.
      // This list is the Tailwind bridge's NAMESPACE map, restated. It has to grow with
      // it: tracking and shadow were bridged on 2026-08-09, and until this line named
      // them the doctor would have passed a bridge that silently dropped both.
      const required =
        t === "theme.css"
          ? ids.filter((i) => /^(color|font|radius|space|easing|text|leading|tracking|shadow)-/.test(i))
          : ids;
      // tokens.py emits CONSTANT_CASE; the CSS targets keep the dashed id.
      const spell = (id) => (t === "tokens.py" ? id.replace(/-/g, "_").toUpperCase() : id);
      const miss = required.filter((id) => !text.includes(spell(id)));
      if (miss.length) stale.push(`${t} missing ${miss.length} (${miss.slice(0, 3).join(", ")})`);
    }
    if (stale.length) fail(`${lane} tokens emitted`, `${stale.join("; ")} — run: (cd tokens && npm run build)`);
    else ok(`${lane} tokens emitted`, `${ids.length} tokens → ${targets.length} targets`);

    // Presence catches "added a token, forgot to build". This catches the other half:
    // *changed a value* and forgot, which leaves every name in place and every consumer
    // on the old number. Dimensions and numbers only — colours are transformed on the
    // way out, so their literal form legitimately differs from the source.
    const src2 = readJSON(src);
    const drift = [];
    const walkVals = (node, path = []) => {
      for (const [k, v] of Object.entries(node)) {
        if (k.startsWith("$")) continue;
        if (v && typeof v === "object" && "$value" in v) {
          const id = [...path, k].join("-");
          const val = v.$value;
          let want = null;
          if (val && typeof val === "object" && "value" in val && "unit" in val) want = `${val.value}${val.unit}`;
          else if (typeof val === "number") want = String(val);
          if (!want) continue;
          const css = readFileSync(join(SHINE, "tokens/dist", lane, "tokens.css"), "utf8");
          const m = new RegExp(`--shine-${id}:\\s*([^;]+);`).exec(css);
          if (m && m[1].trim() !== want) drift.push(`${id} is ${m[1].trim()} in dist, ${want} in src`);
        } else if (v && typeof v === "object") walkVals(v, [...path, k]);
      }
    };
    walkVals(src2);
    if (drift.length) fail(`${lane} token values current`, `${drift.slice(0, 3).join("; ")} — run: (cd tokens && npm run build)`);
    else ok(`${lane} token values current`, "dist matches src");
  }
}

// ---- 5b. the generator still describes src --------------------------------
// The chain is gen-source.mjs -> src -> dist, but `npm run build` starts at src,
// so a value edited in the generator alone changes nothing and every check above
// stays green: dist matches src, src is fully emitted, contrast passes. The
// generator's existing guard only refuses to DROP a token, so a disagreeing
// value is silent until someone runs gen and it reverts src underneath them.
{
  const r = spawnSync("node", ["scripts/gen-source.mjs", "--check"], {
    cwd: join(SHINE, "tokens"),
    encoding: "utf8",
  });
  if (r.status === 0) ok("generator agrees with src", (r.stdout || "").trim().split("\n")[0]);
  else fail("generator agrees with src", (r.stderr || r.stdout || "").trim().split("\n").slice(0, 2).join(" — "));
}

// ---- 6. (reserved) optional consumer sync ---------------------------------
// Private apps vendor tokens via a local `consumers.local` map (see
// `consumers.example`). The public doctor does not probe private checkouts.

// ---- 6b. template catalog — inventing a page is incomplete ----------------
{
  const catalogPath = join(SHINE, "corpus/templates.json");
  const skill = readFileSync(join(SHINE, "skill/SKILL.md"), "utf8");
  const diagnose = readFileSync(join(SHINE, "skill/references/diagnose.md"), "utf8");
  const acquire = readFileSync(join(SHINE, "corpus/acquire.sh"), "utf8");
  const CORPUS = join(HOME, "design-corpus");

  if (!/corpus\/cite\.mjs/.test(skill))
    fail("SKILL.md cite command", "missing `corpus/cite.mjs` — the MATCH step lost its interface");
  else ok("SKILL.md cite command", "corpus/cite.mjs");

  if (!/compare\.mjs/.test(skill))
    fail("SKILL.md compare", "missing compare.mjs — PROVE lost its pixels");
  else ok("SKILL.md compare", "compare.mjs");

  // The old liturgy must stay dead: self-reported evidence fields and the deleted
  // critic trained attribute-stamping (see docs/audit-2026-08-21.md §3–4).
  if (/images_read|critic\.mjs/.test(skill))
    fail("SKILL.md no liturgy", "mentions images_read or critic.mjs — the self-report era is over");
  else ok("SKILL.md no liturgy", "no images_read, no critic");

  const cite = join(SHINE, "corpus/cite.mjs");
  if (!existsSync(cite)) fail("cite.mjs exists", "corpus/cite.mjs missing");
  else {
    const unknown = spawnSync(process.execPath, [cite, "definitely-not-a-template"], { encoding: "utf8" });
    if (unknown.status !== 1) fail("cite.mjs unknown id", `expected exit 1, got ${unknown.status}`);
    else ok("cite.mjs unknown id", "exit 1");
    const corpusReady = existsSync(join(HOME, "design-corpus"));
    if (corpusReady) {
      const blog = spawnSync(process.execPath, [cite, "mui-blog"], { encoding: "utf8" });
      const out = `${blog.stdout || ""}${blog.stderr || ""}`;
      if (blog.status !== 0) fail("cite.mjs mui-blog", `exit ${blog.status}: ${(blog.stderr || "").slice(0, 200)}`);
      else if (!/Template: mui-blog/.test(out) || !/design-corpus/.test(out) || !/Blog\.tsx/.test(out))
        fail("cite.mjs mui-blog", "did not print Template: mui-blog + a design-corpus Blog.tsx to open");
      else ok("cite.mjs mui-blog", "lists corpus files to open");

      const dash = spawnSync(process.execPath, [cite, "dashboard"], { encoding: "utf8" });
      const dout = `${dash.stdout || ""}${dash.stderr || ""}`;
      if (dash.status !== 0) fail("cite.mjs dashboard is a page", `exit ${dash.status}: ${dout.slice(0, 200)}`);
      else if (/vendor pixels are not/i.test(dout))
        fail("cite.mjs dashboard is a page", "sanding banner is back");
      else if (!/Template: shadcn-dashboard-01/.test(dout) || !/page\.tsx/.test(dout))
        fail("cite.mjs dashboard is a page", "expected shadcn-dashboard-01 page.tsx, not Tremor atoms");
      else if (!/extracted/.test(dout))
        fail("cite.mjs dashboard is a page", "registry JSON was not extracted to readable source");
      else ok("cite.mjs dashboard is a page", "shadcn-dashboard-01 + extracted page.tsx");

      // Synonyms: "settings page" used to be an unknown token (exact-match lexicon).
      const syn = spawnSync(process.execPath, [cite, "settings page"], { encoding: "utf8" });
      const sout = `${syn.stdout || ""}${syn.stderr || ""}`;
      if (syn.status !== 0 || !/Template: antd-pro-settings|Template: fluent-nav/.test(sout))
        fail("cite.mjs resolves plain words", `"settings page" → exit ${syn.status}: ${sout.slice(0, 160)}`);
      else ok("cite.mjs resolves plain words", (sout.match(/Template: (\S+)/) || [])[1]);

      const queue = spawnSync(process.execPath, [cite, "queue"], { encoding: "utf8" });
      const qout = `${queue.stdout || ""}${queue.stderr || ""}`;
      if (queue.status !== 0) fail("cite.mjs queue", `exit ${queue.status}: ${qout.slice(0, 200)}`);
      else if (/sidebar-07/.test(qout) && !/carbon-datatable|antd-pro-list/.test(qout))
        fail("cite.mjs queue", "returned an app-shell instead of a queue page");
      else if (!/carbon-datatable|antd-pro-list/.test(qout))
        fail("cite.mjs queue", "expected carbon-datatable or antd-pro-list");
      else ok("cite.mjs queue", (qout.match(/Template: (\S+)/) || [])[1] || "queue page");
    }
  }

  if (!/A page with no\s+template cite is incomplete/.test(diagnose))
    fail("diagnose.md catalog hole", "missing `A page with no template cite is incomplete`");
  else ok("diagnose.md catalog hole", "inventing a page is Critical");

  const pins = [
    "mantine", "chakra-ui", "heroui", "heroui-next-app", "headlessui",
    "tremor", "blueprint", "park-ui", "rsuite", "grommet", "ant-design-pro",
  ];
  const missingPins = pins.filter((p) => !new RegExp(`sparse_clone ${p}\\b|full_clone\\s+${p}\\b`).test(acquire));
  if (missingPins.length) fail("acquire.sh AdminLTE-list pins", `missing: ${missingPins.join(", ")}`);
  else ok("acquire.sh AdminLTE-list pins", pins.join(", "));

  if (!existsSync(catalogPath)) fail("templates.json", `missing ${catalogPath}`);
  else {
    const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
    const required = catalog.requiredScreenTypes ?? ["dashboard", "marketing", "auth", "checkout", "app-shell", "crud"];
    const missingScreens = required.filter((s) => !(catalog.templates ?? []).some((t) => t.screen === s));
    if (missingScreens.length) fail("catalog required screens", `no start-from for: ${missingScreens.join(", ")}`);
    else ok("catalog required screens", required.join(", "));

    const missingDefault = required.filter(
      (s) => !(catalog.templates ?? []).some((t) => t.screen === s && t.startFrom === 1),
    );
    if (missingDefault.length) fail("catalog startFrom:1", `no default row for: ${missingDefault.join(", ")}`);
    else ok("catalog startFrom:1", required.join(", "));

    const noDna = (catalog.templates ?? []).filter((t) => !t.dna?.family);
    if (noDna.length) fail("catalog DNA", `${noDna.length} rows missing dna.family (${noDna.slice(0, 3).map((t) => t.id).join(", ")})`);
    else ok("catalog DNA", `${(catalog.templates ?? []).length} rows`);

    const kitPages = ["carbon", "mantine", "magicui", "fluentui", "react-spectrum"];
    const missingKits = kitPages.filter((k) => !(catalog.templates ?? []).some((t) => t.kit === k));
    if (missingKits.length) fail("catalog kit pages", `no cite-able page for: ${missingKits.join(", ")}`);
      else ok("catalog kit pages", kitPages.join(", "));

    // Packs are real pixels or they are nothing. A pack dir must carry a full-page
    // shot.png of the ACTUAL screen (>=30KB — a stub can't fake that) — the V2
    // "DNA pack" was a generated placeholder and every downstream step processed
    // metadata about design instead of design (docs/audit-2026-08-21.md §1).
    const packsDir = join(SHINE, "corpus/packs");
    if (!existsSync(packsDir)) {
      note("harvested packs", "none yet — Phase 2 (corpus/harvest.mjs) adds real screenshots + kit tokens");
    } else {
      const packDirs = readdirSync(packsDir).filter((d) => !d.startsWith("."));
      const broken = [];
      for (const d of packDirs) {
        const shot = join(packsDir, d, "shot.png");
        if (!existsSync(shot)) broken.push(`${d}: no shot.png`);
        else {
          const bytes = statSync(shot).size;
          if (bytes < 30_000) broken.push(`${d}: shot.png ${bytes}B — too small to be a real screen`);
        }
      }
      if (!packDirs.length) note("harvested packs", "packs/ exists but is empty — Phase 2 pending");
      else if (broken.length) fail("harvested packs carry real pixels", broken.slice(0, 6).join("; "));
      else ok("harvested packs carry real pixels", `${packDirs.length} packs, all with full-page shots`);
    }

    const voiceCss = join(SHINE, "tokens/voices", "carbon.css");
    if (!existsSync(voiceCss)) fail("voice pack carbon.css", "tokens/voices/carbon.css missing — pack.mjs");
    else if (!/IBM Plex Sans/.test(readFileSync(voiceCss, "utf8")))
      fail("voice pack carbon.css", "does not remap sans to IBM Plex");
    else ok("voice pack carbon.css", "executable remap");

    if (!CI && existsSync(CORPUS)) {
      const missingPaths = (catalog.templates ?? [])
        .filter((t) => t.kind === "source")
        .map((t) => ({ id: t.id, path: join(CORPUS, t.path) }))
        .filter((t) => !existsSync(t.path));
      if (missingPaths.length)
        fail("catalog paths exist", missingPaths.slice(0, 5).map((t) => `${t.id} → ${t.path}`).join("; "));
      else ok("catalog paths exist", `${(catalog.templates ?? []).filter((t) => t.kind === "source").length} source rows`);
    } else if (!CI) {
      fail("catalog paths exist", `no ~/design-corpus — run corpus/acquire.sh`);
    }
  }
}

{
  const BANNED = /vendor pixels are not/i;
  const sample = "Paint: shine tokens. Structure cloned; vendor pixels are not.";
  if (!BANNED.test(sample)) fail("paint-sentence detector bites", "detector missed the banned sanding line");
  else ok("paint-sentence detector bites", "a revert of the cite banner would go red");
  const paintFiles = [
    "skill/SKILL.md",
    "agents/shine-ux.md",
    "corpus/cite.mjs",
    "skill/references/diagnose.md",
    "skill/references/kits.md",
    "skill/references/templates.md",
    "skill/references/voices.md",
  ];
  const hits = paintFiles.filter((f) => existsSync(join(SHINE, f)) && BANNED.test(readFileSync(join(SHINE, f), "utf8")));
  if (hits.length) fail("no sanding banner", `banned sentence returned in ${hits.join(", ")}`);
  else ok("no sanding banner", "cite/skill/agent do not print the old paint law");
}

{
  // The critic scored "likeness" by grepping source for data-* attributes: a one-button
  // page with three attributes scored 10/10 against the Carbon datatable (audit §4).
  // Its absence is an invariant, and its replacement must be unable to bless anything.
  if (existsSync(join(SHINE, "verify/critic.mjs")))
    fail("no self-scored likeness", "verify/critic.mjs is back — the regex likeness gate trains attribute-stamping");
  else ok("no self-scored likeness", "critic.mjs deleted");

  const compare = join(SHINE, "verify/compare.mjs");
  const stamp = join(SHINE, "verify/fixtures/attribute-stamp.html");
  if (!existsSync(compare)) fail("compare.mjs exists", "verify/compare.mjs missing");
  else if (!existsSync(stamp)) fail("attribute-stamp fixture", "verify/fixtures/attribute-stamp.html missing");
  else {
    const src = readFileSync(compare, "utf8");
    if (/likeness/i.test(src.replace(/\/\/[^\n]*/g, "")))
      fail("compare has no score", "compare.mjs computes a likeness value — that is the dead gate returning");
    else ok("compare has no score", "facts + composite only");
    const r = spawnSync(process.execPath, [compare, stamp, "--cite", "carbon-datatable"], { encoding: "utf8" });
    const out = `${r.stdout}${r.stderr}`;
    const hasShot = existsSync(join(SHINE, "corpus/packs/carbon-datatable/shot.png"));
    if (!hasShot) {
      // Pre-harvest: it must REFUSE, not bless.
      if (r.status === 2 && /Refusing to compare/.test(out)) ok("compare refuses without pixels", "exit 2");
      else fail("compare refuses without pixels", `exit ${r.status}: ${out.slice(0, 160)}`);
    } else {
      // Post-harvest: it reports facts and never a verdict, even for the stamp page.
      if (/PASS|FAIL|likeness/i.test(out)) fail("compare stays verdict-free", out.slice(0, 160));
      else ok("compare stays verdict-free", "facts only on the stamp fixture");
    }
  }
}

// ---- 7. every reference is reachable from the map, and vice versa ---------
// A reference file the map never names is a file the agent never reads on demand — the
// same failure as a skill that exists on disk and never loads. A map row with no file
// behind it sends the agent to read nothing and report the gap as absent guidance.
{
  const skill = readFileSync(join(SHINE, "skill/SKILL.md"), "utf8");
  const mapped = new Set([...skill.matchAll(/`references\/([\w.-]+\.md)`/g)].map((m) => m[1]));
  const onDisk = new Set(readdirSync(join(SHINE, "skill/references")).filter((f) => f.endsWith(".md")));
  const unmapped = [...onDisk].filter((f) => !mapped.has(f));
  // `*.local.md` is an optional private override — gitignored, installed by a
  // brand pack, absent on a clean clone. SKILL.md has to name it or the model
  // never learns to look for it, so the map check has to know the difference
  // between "named and missing" and "named and optional". Everything else that
  // SKILL.md names still has to exist.
  const missing = [...mapped].filter((f) => !onDisk.has(f) && !f.endsWith(".local.md"));
  if (unmapped.length || missing.length) {
    fail("reference map complete", [
      unmapped.length ? `on disk, never named in SKILL.md: ${unmapped.join(", ")}` : "",
      missing.length ? `named in SKILL.md, no such file: ${missing.join(", ")}` : "",
    ].filter(Boolean).join("; "));
  } else {
    ok("reference map complete", `${onDisk.size} references, all reachable`);
  }
}

// The homepage prints the skill tree with a line count per file and a total. It
// is a claim about this repo, so it gets checked like one: it was stale by 12
// files and 1,783 lines when this check was written, having been hand-maintained
// through a rename that also broke its column alignment. Nobody would have
// noticed, because a wrong number renders exactly like a right one.
//
// `*.local.md` is excluded on purpose — a private override must never be named
// on a public page.
{
  // Delegated to the generator so the comparison exists in exactly one place. The
  // block is derived from disk by site/scripts/skill-listing.mjs; this only asks it
  // whether the committed page still matches. Fix with --write, never by hand.
  const r = spawnSync(process.execPath, [join(SHINE, "site/scripts/skill-listing.mjs"), "--check"], {
    encoding: "utf8",
  });
  if (r.status === 0) {
    ok("site skill listing current", (r.stdout.trim().split("— ")[1] ?? "matches disk"));
  } else {
    const why = (r.stderr || r.stdout).trim().split("\n")[0].replace(/^skill-listing: (STALE — )?/, "");
    fail("site skill listing current", `${why} — fix: npm run skill-listing -- --write`);
  }
}

// The same page claims how many checks `--ci` runs. That number went stale the
// same way the file listing used to — hand-maintained through additions, wrong
// by four, rendering exactly like a right one. Ask the --ci run itself.
if (!CI && !process.env.SHINE_DOCTOR_INNER) {
  const site = readFileSync(join(SHINE, "site/index.html"), "utf8");
  const claim = site.match(/<code>--ci<\/code> is ([\d,]+) checks/);
  if (!claim) {
    fail("site --ci count current", "no '<code>--ci</code> is N checks' sentence found in site/index.html");
  } else {
    const inner = spawnSync(process.execPath, [fileURLToPath(import.meta.url), "--ci"], {
      encoding: "utf8",
      env: { ...process.env, SHINE_DOCTOR_INNER: "1" },
    });
    const out = `${inner.stdout}\n${inner.stderr}`;
    const m = out.match(/(\d+) checks pass|of (\d+) checks FAILED/);
    const actualCi = m ? Number(m[1] ?? m[2]) : NaN;
    if (!Number.isFinite(actualCi)) fail("site --ci count current", "could not read the --ci run's own count");
    else if (Number(claim[1].replace(/,/g, "")) !== actualCi)
      fail("site --ci count current", `site says ${claim[1]}, the --ci run reports ${actualCi}`);
    else ok("site --ci count current", `${actualCi} checks`);
  }
}

// The header of this file has claimed since it was written that it "checks the token
// layer reached every consumer." It did not — there was no such check, and on
// 2026-08-16 the doctor exited 0 while FIVE of seven consumers were broken: four had
// never been vendored at all because consumers.local used the pre-rename clearspeed-*
// keys and hit the unknown-key branch, and one was simply stale. A claim in a comment
// is not a check.
//
// Machine-local: consumers.local is gitignored (private paths), so this is skipped
// under --ci. "Not configured" is reported as its own state, never as a pass — a
// verdict on zero consumers is not a clean bill of health.
if (!CI) {
  const local = join(SHINE, "consumers.local");
  if (!existsSync(local)) {
    note("consumer token layers", "no consumers.local — nothing to check (this is not a pass)");
  } else {
    const r = spawnSync("bash", [join(SHINE, "scripts/sync-consumers.sh"), "--check"], {
      encoding: "utf8",
      cwd: SHINE,
    });
    const out = `${r.stdout}${r.stderr}`;
    const lines = out.split("\n").filter((l) => /^(OK|FAIL)\s/.test(l));
    const bad = lines.filter((l) => l.startsWith("FAIL"));
    if (!lines.length) {
      fail("consumer token layers", "sync-consumers --check produced no verdicts — the check itself is broken");
    } else if (bad.length) {
      const names = bad.map((l) => l.replace(/^FAIL\s+/, "").split(" —")[0]);
      fail(
        "consumer token layers",
        `${bad.length} of ${lines.length} stale or unresolved: ${names.join(", ")} — npm run sync-consumers`,
      );
    } else {
      ok("consumer token layers", `${lines.length} consumers in sync`);
    }
  }
}

// Consumer pages, under --full only. This is the check whose absence let shine report
// 43 of 43 passing while the site it governs failed AA on fourteen pages: every other
// check here is about shine itself, and none of them ever loaded a page a reader sees.
//
// Deliberately not in the default run. Consumers carry real, known debt — a type scale
// mid-migration, structural landmarks — and a permanently red doctor gets ignored, which
// costs more than the check buys. `npm run doctor:full` is the deliberate act; the
// default stays green-when-good so a FAIL still means something.
if (args.includes("--full") && !CI) {
  const r = spawnSync(process.execPath, [join(SHINE, "verify/measure-consumers.mjs"), "--quiet"], {
    encoding: "utf8",
    timeout: 600_000,
  });
  const out = `${r.stdout}${r.stderr}`;
  const summary = (out.match(/measure-consumers: ([^\n]+)/) ?? [])[1] ?? "no verdict";
  if (r.status === 2) note("consumer pages measured", summary);
  else if (r.status === 0) ok("consumer pages measured", summary);
  else fail("consumer pages measured", `${summary} — node verify/measure-consumers.mjs`);
}

// ---- report ---------------------------------------------------------------
const failures = results.filter((r) => !r.pass);
if (!QUIET) {
  for (const r of results) {
    const tag = r.note ? "NOTE" : r.pass ? "PASS" : "FAIL";
    console.log(`${tag}  ${r.name}${r.detail ? `  — ${r.detail}` : ""}`);
  }
  console.log("");
}
if (failures.length) {
  // stdout, not stderr: a sessionStart hook's stdout is what reaches the agent's
  // context, and an unenforced design authority is exactly what the agent needs
  // told before it starts making design decisions.
  if (QUIET) for (const f of failures) console.log(`shine doctor FAIL  ${f.name} — ${f.detail}`);
  else console.error(`${failures.length} of ${results.length} checks FAILED — shine is not fully in force.`);
  process.exit(1);
}
const notes = results.filter((r) => r.note);
if (!QUIET)
  console.log(
    `shine is in force: ${results.length - notes.length} checks pass` +
      (notes.length ? `, ${notes.length} not configured (see NOTE).` : "."),
  );
