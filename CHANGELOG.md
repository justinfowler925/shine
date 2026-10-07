# Changelog

All notable changes to Shine are documented here. Public releases follow [Keep a Changelog](https://keepachangelog.com/) and [SemVer](https://semver.org/).

## Unreleased

### Added

- **Denoise-loop e2e (measure→AST repair→Critic≠Actor→prove).** `runDenoiseLoop`
  accepts `tsxPath` (Actor repair via `applyTsxRestructure`), `mintProve` (completion
  receipt stamps `reflexionVerdict` + `constitutionIds`), and `cropPairId` (FAIL→PASS
  crop required — twin full-page banned). Named denoise defect clearance
  (cta/dual/kpi/…) is the loop bar when craft gates remain. Doctor bite:
  `verify/denoise-loop-e2e-bite.mjs` / `npm run denoise:loop-e2e` on fixture queue
  `queue-cta-before.html` + `queue-dual-cta-ast.tsx` + crop `queue-cta-tsx`.

- **Wrong-cite / rebind-cite TSX AST deepen (recommend refuse path).** `apply-tsx.mjs`
  `rebind-cite` uses the TypeScript compiler AST (not regex) to rewrite wrong-category
  stamps — `data-cite="…"`, `data-cite={"…"}`, `dataCite="…"`, `dataCite={"…"}`.
  Denoise recommend emits typed `recommendation.wrongCiteAst` (TSX fixtures + FAIL→PASS
  crops; `refusePaintUntilRebound`); packets bind `packet.wrongCiteAst`. Cite-ban
  fail-close refuse path keeps the fixture and points Actor at AST rebind + crops.
  Crop pair `sources-cite-tsx`. Doctor bite: `verify/wrong-cite-ast-bite.mjs`.

- **Worklist-first composition TSX AST deepen.** `apply-tsx.mjs` `worklist-first`
  uses the TypeScript compiler AST (not regex) to move records/worklist ahead of
  KPI chrome among `main` / `data-shine-main` children and stamp `data-region="focal"` —
  `className="metrics"` / `{"metrics"}`, `data-sled-kpis`, `className="grid-wrap"` /
  `{"grid-wrap"}`, `role="grid"` / `{"grid"}`, `data-shine-records`, and
  `data-product-pattern` queue/worklist/records. Dynamic `.map` siblings stay plan-only.
  Denoise recommend emits typed `recommendation.worklistFirstAst` (TSX fixtures +
  FAIL→PASS crops); packets bind `packet.worklistFirstAst`. Crop pair
  `queue-worklist-first-tsx`. Doctor bite: `verify/worklist-first-ast-bite.mjs`.

- **Dual-focal ban TSX AST deepen (XOR peer→chip).** `apply-tsx.mjs` `collapse-peer-grids`
  uses the TypeScript compiler AST (not regex) to fold a peer worklist into a
  `data-shine-xor-views` filter chip on one shared DataGrid — `className="grid-wrap"`,
  `className={"grid-wrap"}`, `role="grid"` / `role={"grid"}`, and `data-grid-title`
  markers. Never silent-deletes without XOR chips; dynamic `.map` peers stay plan-only.
  DOM `apply-dom` remains plan-only. Denoise recommend emits typed
  `recommendation.dualFocalAst` (TSX fixtures + FAIL→PASS crops); packets bind
  `packet.dualFocalAst`. Crop pair `queue-dual-grid-tsx`. Doctor bite:
  `verify/dual-focal-ast-bite.mjs`.

- **KPI soup TSX AST deepen (maxVisible=3).** `apply-tsx.mjs` `kpi-collapse` uses the
  TypeScript compiler AST (not regex) to park excess metric JSX in
  `<details data-shine-kpi-rest>` — `className="metric"`, `className={"metric"}`, and
  `data-shine-kpi` / `data-kpi` markers. Denoise recommend emits typed
  `recommendation.kpiSoupAst` (TSX fixtures + FAIL→PASS crops); packets bind
  `packet.kpiSoupAst`. Crop pair `queue-kpi-tsx`. Doctor bite:
  `verify/kpi-soup-ast-bite.mjs`.

- **CTA pressure TSX AST deepen (maxFilled=1).** `apply-tsx.mjs` `cta-budget` uses the
  TypeScript compiler AST (not regex) to demote competing filled `Button` primaries —
  `variant="default"`, `variant={"default"}`, and missing variant. Denoise recommend emits
  typed `recommendation.ctaPressureAst` (TSX fixtures + FAIL→PASS crops); packets bind
  `packet.ctaPressureAst`. Crop pair `queue-cta-tsx`. Doctor bite:
  `verify/cta-pressure-ast-bite.mjs`.

- **Reflexion host cite-ban doctor wiring.** Critic≠Actor host
  (`runCriticActorHostRound` / `planRepairFromMeasure`) and denoise-loop pass
  `doctorBiteOk` + `observedCite` into reflexion when cite-honesty fires, so
  production host rounds can commit cite bans (not only direct `runReflexion`
  test calls). `observedCiteFromFailures` parses `page cite <id>` from measure
  lines. Doctor bite: `verify/reflexion-cite-doctor-bite.mjs`.

- **Cite-ban learn deepen (episodic + fail-close).** Wrong-cite prove fails
  persist an episodic lesson alongside `citeBans[]` / `editionAntiCites[]`.
  `enforceCiteBansOnRecommendation` demotes banned recommend primaries (or nulls
  them); design packets demote banned `selected` cites or refuse paint.
  Helpers: `citeIdMatchesBan`, `learnedCiteBansFor`, datagrid↔queue /
  clearspeed-operate↔clearspeed aliases. Doctor bite:
  `verify/cite-ban-learn-deepen-bite.mjs`.

- **D10 XOR dual-grid recommend deepen.** Denoise recommend emits typed
  `recommendation.xorSavedView` (before/after fixtures + FAIL→PASS crops) for
  queue/triage jobs; denoise packets bind `packet.xorSavedView` and DDR
  `restructureOps` includes `collapse-peer-grids`. Crop pair `queue-dual-grid`
  is self-contained via `buildAfter` → `buildXorFoldCropHtml`. Doctor bite:
  `verify/xor-saved-view-recommend-bite.mjs`.

- **ClearSpeed edition `brandAccent` fail-closed.** Shared
  `core/clearspeed-brand-accent.mjs` (`#ED5925`) wires sync-tokens kit
  `brandAccent`, install manifest write, and `verify/edition.mjs` /
  doctor bites so edition accent drift from Signal Orange fails closed.
  Doctor: `verify/sync-tokens.test.mjs`.

- **Records/worklist operate pilot table-quality.** `kind: "worklist"` in
  `verify/table-quality.mjs` (search, rowAction, loading, empty, filteredEmpty)
  with executable fixture `verify/fixtures/records-worklist/shine-tables.json`.
  Denoise recommend emits `recommendation.tableQuality.fixture` for records /
  worklist jobs; denoise packets bind it into `tableQuality.example`. Pilot
  companion selectors: `benchmark/records-pilot/shine-tables.json`. Doctor bite:
  `verify/records-pilot-table-quality-bite.mjs`.

- **Denoise + enterprise live DoD tracker.** `docs/shine-denoise-enterprise-dod.md`
  records tip `f674a66` (#167) merge/deploy/CI/ClearSpeed host posture for PRs
  #149–#167 (honest PARTIAL until tip Actions green + hosts tip-synced; listing
  re-stale after #165–#167).

- **Measure fail-closed on Operate anti-pattern cites.** When Operate slop
  defects fire (`dual-focal`, `kpi-soup`, `cta-pressure`, `cite-honesty`),
  `verify/measure.mjs` requires each failure line to cite the matching
  `anti-pattern:<id>` from `knowledge/anti-patterns`. Missing or mismatched
  cites append `anti-pattern-cite:` failures. Helpers:
  `enforceOperateAntiPatternCites`, `operateDefectPrefixToAntiPatternId`,
  `extractAntiPatternCites` in `knowledge/retrieve.mjs`. Doctor bite:
  `verify/measure-anti-pattern-cite.test.mjs`.

- **Operate slop anti-patterns expand.** `knowledge/anti-patterns/` quartet
  (dual-focal-grids, kpi-soup, competing-filled-ctas, wrong-cite-category) gains
  aliases, examples, fixtures/crops, restructureOps, skillAbCaseIds, and
  `operate-slop` tags. Measure formatters for dual-focal / kpi-soup / cta-pressure
  cite `anti-pattern:<id>`; wrong-cite gets `formatWrongCiteFailures` +
  `cite-honesty` prefix. Helpers: `loadOperateSlopAntiPatterns`,
  `resolveAntiPattern`, `withAntiPatternCite` in `knowledge/retrieve.mjs`.
  Doctor bite: `verify/anti-patterns-operate.test.mjs` (loads
  `knowledge/anti-patterns/*.json`).

- **Skill A/B denoise deepen — more pinned pairs + crops↔reflexionVerdict.**
  Pinned cases grow to 6 (adds Usul focal crop + stacked Sled CTA+KPI bloat).
  Per-case `shine-skill-ab-receipt/v1` stamps Atlas `reflexionVerdict`
  (with=`done`, without=`error`) and binds crop paths (`cropTiedToVerdict`).
  Crop builders: `usul-focal-*` · `queue-sled-bloat-*` in
  `verify/restructure/defect-crops.mjs`. Floor requires `receiptsOk`.
  Doctor bites: `verify/skill-ab-eval.test.mjs` · `verify/defect-crops.test.mjs`.
  Docs: `docs/skill-ab-eval.md` · `docs/denoise-golden-prove.md` ·
  `skill/references/denoise.md` (+ cowork mirror).

- **Atlas reflexion verdict on prove + denoise-loop stop.** Green
  `verify/prove.mjs` completion receipts and `denoise-loop` stop receipts stamp
  `reflexionVerdict` ∈ `done|partial|blocked|error` (cleared → `done`). Mint and
  Operate stop-sweep **fail-closed** if missing. Helpers:
  `resolveStopReflexionVerdict`, `assertAtlasReflexionVerdict`,
  `isAtlasReflexionVerdict` in `core/reflexion.mjs`. Doctor bites:
  `verify/reflexion.test.mjs` · `verify/operate-prove-mandatory.test.mjs` ·
  `verify/denoise-loop.test.mjs`. Docs: `docs/operate-constitution.md` ·
  `skill/references/denoise.md` (+ site/cowork mirrors).

- **Wireframe-brief structure lock in denoise-loop.** Once primary job/regions
  are LOCKED (wireframe brief or auto-lock from `shine-restructure.json`),
  REPAINT that changes structure is refuse-closed without a RESTRUCTURE packet
  (`phase=RESTRUCTURE` + valid `shine-restructure/v1`). Helpers:
  `assertRepaintPreservesStructure`, `gateDenoiseStructureChange`,
  `createStructureLockFromPlan`. Receipt `structureLock`. Doctor bite:
  `verify/wireframe-brief.test.mjs` (+ denoise-loop receipt). Docs:
  `skill/references/wireframe.md` · `denoise.md` (+ site/cowork mirrors).

- **Critic≠Actor measure→repair→critic in denoise-loop.** Host helpers
  `planRepairFromMeasure`, `completeAfterRepair`, `runPostRepairCriticRound`,
  `assertNoWorkerSelfReview` track the repair worker and fail-closed if that
  worker self-reviews as Critic (or Host-finalizes). Denoise-loop wires the
  cycle; receipt records `cycle: measure→repair→critic` +
  `workerSelfReviewBanned`. Doctor bite: `verify/critic-actor-host.test.mjs`.
  Docs: `skill/references/denoise.md` (+ site/cowork mirrors).

- **Denoise-loop audit auto-append (measure/critic/reflexion).** When
  `SHINE_AUDIT_DIR` is set, `verify/denoise-loop.mjs` appends
  `action:measure` + `observation:measure-result` each measure round and
  `action:critic` + `action:reflexion` + `observation:critic-verdict` after
  Critic≠Actor host rounds — extending the trail beyond DDR accept/refuse+prove.
  Helpers: `recordMeasureTurn`, `recordCriticReflexionTurn`,
  `autoAppendDenoiseLoop`. Doctor bite: `verify/audit-trail.test.mjs`.
  Docs: `docs/ddr-audit-trail.md`.

- **Repertoire → sibling learn (edition prefer).** When cite/kit resolves via
  the ClearSpeed Operate edition sibling map, `commitSiblingLearnFromResolve`
  persists `siblingPrefs[]` + an episodic `edition-sibling` lesson (doctor-gated).
  `resolveEditionSibling({ learnedPrefs })` / recommend / saas packets boost the
  proven sibling on the next packet. CLI `npm run learn -- sibling-prefs|commit-sibling`.
  Doctor: `verify/learn.test.mjs` · `verify/edition-siblings.test.mjs`.
  Docs: `docs/repertoire-learn.md` · `docs/edition-siblings.md`.

- **DDR audit trail auto-append (decision path).** Packet `accept` /
  `refuse` via `core/ddr.mjs` and green `verify/prove.mjs --ddr` auto-append
  Action/Observation events through `recordDdrDecision` /
  `recordProveCompletion` (not only manual `npm run audit`). New DDR status
  `refused`; `refuse-ddr` action type. Doctor bite covers accept/refuse+prove
  auto-append. Docs: `docs/ddr-audit-trail.md`.

- **ClearSpeed Operate edition sibling map (enterprise §4).**
  `knowledge/editions/clearspeed-operate/siblings.json` maps Operate jobs to
  Nucleus / Sled Capture sibling surfaces for cite + kit selection
  (product sibling first → kit → cite). `core/edition-siblings.mjs` resolves
  siblings; recommend + saas packets attach `productSibling` / `editionSibling`.
  Edition verify `verifyEditionSiblingMap` + doctor bite
  `verify/edition-siblings.test.mjs`. Docs: `docs/edition-siblings.md`.

- **Operate prove constitution receipts + edition catalog bite.**
  `verify/prove.mjs` stamps `constitutionIds` / `constitutionEdition` onto
  completion receipts (saas defaults to the full ClearSpeed Operate catalog).
  Operate stop-sweep gaps when a completion omits the ids. Edition verify
  `verifyOperateDdrConstitution` fails closed if a DDR omits any catalog id.
  Doctor: `verify/constitution.test.mjs` · `verify/operate-prove-mandatory.test.mjs`.

- **ClearSpeed Operate numbered constitution (enterprise §3).**
  `knowledge/constitutions/clearspeed-operate.json` + `core/constitution.mjs`
  bind numbered edition principles onto every SaaS/denoise DDR
  (`ddr.constitutionIds`, `ddr.constitution[]`, `ddr.constitutionEdition`).
  Critic prompts show the numbered list; `partial`/`blocked` turns fail-closed
  unless they cite ≥1 principle id or number. Wired through reflexion,
  critic-actor-host, and denoise-loop. Doctor bite
  `verify/constitution.test.mjs`. Docs: `docs/operate-constitution.md`.

- **DDR audit trail (enterprise §5).** `core/audit-trail.mjs` stores an
  append-only Action/Observation event log keyed by immutable `ddrId`, links
  prove completion receipts by content hash (`proveReceiptHash`), and supersedes
  via forward links — never rewriting history. `supersedeDdr` now returns
  `{ superseded, next }`. CLI `npm run audit`; doctor bite
  `verify/audit-trail.test.mjs`.

- **Cite-ban / edition anti-cite learn hooks.** Extends `core/learn.mjs` +
  `knowledge/repertoire/repertoire.json` with `citeBans[]` (Operate demotions)
  and `editionAntiCites[]`. `commitCiteBansFromProveFail` / `inferCiteBansFromProveFail`
  write only after real cite-related prove fails tied to `ddrId`, doctor-gated,
  no preference/RLAIF. Reflexion attaches/commits when `doctorBiteOk` + observed
  cite are passed; recommend surfaces learned `anti-cite:` strings. Doctor bite
  `verify/learn.test.mjs`.

- **Repertoire + episodic learn stub.** `core/learn.mjs` + seeded
  `knowledge/repertoire/repertoire.json` store proven job→cite→kit + working
  `restructureHints`, and linguistic episodes tied to `ddrId` + prove fail
  category. `commitLearning` bumps store `version` only when `doctorBiteOk`
  (doctor-gated). Refuses preference / RLAIF labels and lessons without a
  machine fail. `npm run learn`; doctor bite `verify/learn.test.mjs`.

- **Wireframe brief lock.** Machine lock for new surfaces at
  `shine-wireframe/<slug>.brief.md` (`core/wireframe-brief.mjs`): Status
  DRAFT→LOCKED→UNLOCKED; structure fields immutable while LOCKED until the user
  says `unlock structure`; Build/paint fail-closed via `assertBuildMayPaint` /
  `assertNewSurfaceBrief`. Packet `mode=new` binds `ddr.wireframeBrief` and
  `--require-wireframe-lock`. Doctor bite: `verify/wireframe-brief.test.mjs`.

- **Critic ≠ Actor host orchestrator.** `core/critic-actor-host.mjs` closes thin
  wiring after #137: shared `runCriticActorHostRound`, `assertActorMayImplement`,
  `hostFinalizeAfterClearance` (Host finalizes when measure clears after a
  Critic→Actor `partial` — `hostAccept` no longer stays null), `assertHostFinalized`.
  Denoise loop uses the host module (no inline accept/plan). Doctor bite:
  `verify/critic-actor-host.test.mjs`.

- **Operate corpus deepen (S3+).** +2 catalog (`shadcn-catalog-skills`,
  `shadcn-catalog-tools`), +2 chat (`shadcn-chat-support`, `shadcn-chat-inbox`),
  +2 dense cockpits (`shadcn-cockpit-adoption`, `shadcn-cockpit-compliance`).
  Cite floors: catalog ≥5, chat ≥5, dense dashboard ≥7, dense cockpit jobs ≥4.
  Soft `analytics`/`metrics` prefer composed dashboard; chart demotion −70;
  explicit `chart`/`charts`/`dataviz` keep chart atoms.

- **Skill A/B eval (Salesforce DI-style).** `verify/skill-ab-eval.mjs` + pinned
  `verify/fixtures/skill-ab/cases.json` score denoise guidance **with vs without**
  on Sled-class fixtures (CTA, KPI, focal, cite, dual-grid). Machine oracles only —
  no preference / RLAIF labels. `npm run skill:ab`; doctor bite
  `verify/skill-ab-eval.test.mjs`. `applySetFocal` falls back to card/main for Usul soup.

- **Critic ≠ Actor turns (S1).** `core/reflexion.mjs` separates diagnose/critic from
  Actor implement: distinct principals, Atlas verdicts `done|partial|blocked|error`,
  self-accept ban (critic and actor cannot accept the review — host only),
  `runCriticTurn` / `planActorPass` / `acceptVerdict`. Denoise loop + `denoise.md`
  wire the turn split. Doctor bite: `verify/reflexion.test.mjs`.

- **Machine-readable anti-patterns JSON (S2).** Nucleus-weighted Operate bloat tells
  in `knowledge/anti-patterns/*.json` (card soup, KPI soup, competing CTAs, dual-focal,
  marketing DNA, filler empty, wrong cite, …). `knowledge/retrieve.mjs` loads/retrieves;
  composition-slop failures cite `anti-pattern:<id>`; recommend prefers library bans.
  Doctor bite via `verify/knowledge.test.mjs`.

- **Dual-grid XOR recipe (D10).** Agent-assisted close for `collapse-peer-grids`:
  peer title → filter chip + shared DataGrid state (`verify/restructure/xor-saved-view.mjs`).
  AST/DOM runners stay plan-only (no silent delete). Fixtures
  `queue-dual-grid-{before,after}.html` + fold crop receipt; `denoise:eval` bar is
  detect→XOR after PASS. Kit in `kits.md` § Dual-grid XOR; `npm run restructure:xor`.

- **Operate corpus depth (S3).** +2 catalog (`shadcn-catalog-integrations`,
  `shadcn-catalog-templates`), +2 chat (`shadcn-chat`, `shadcn-chat-sidecar`),
  +2 dense cockpits (`shadcn-cockpit-ops`, `shadcn-cockpit-revenue`). Cite floors:
  catalog ≥3, chat ≥3, dense dashboard ≥5, dense cockpit jobs ≥2. Operate page
  intent now covers catalog/chat + integrations/assistant synonyms.

- **SLED Capture real-surface prove (S4).** When Nucleus checkout/SSO is absent,
  `verify/fixtures/sled-capture-prove/` (from Project sled dump) fail→pass measure
  with distinct CTA/KPI crops plus operable search→pursue usability. Nucleus golden
  also gains operable `shine-usability.json` (search→install). Doctor bites:
  `verify/sled-capture-prove.test.mjs`, strengthened `verify/nucleus-golden.test.mjs`.

- **Records pilot → Nucleus-shaped consumer (S6).** Adapter contract + HTTP client
  (`benchmark/records-pilot/adapters/`), local `/api/operate/records` harness, and
  browser E2E list/edit/fail/retry without inventing SSO bypasses.
  `docs/records-pilot-nucleus-adapter.md`.

- **Records pilot E2E deepen (S6).** Full pilot-task state matrix over the
  Nucleus-shaped adapter: loading, empty (`--seed empty`), filtered-empty,
  validation (400), stale-write (409 + reload/retry), list refresh after PATCH,
  fresh GET persistence proof. Doctor bite
  `verify/records-pilot-nucleus-bite.mjs` fail-closes FORBIDDEN / SAVE_FAILED /
  VALIDATION / STALE_WRITE and asserts doctor wiring.

- **Denoise skill mode + DDR (N0).** `--mode denoise` loads `skill/references/denoise.md`,
  refuses without `--category`, and emits a Design Decision Record (`ddrId`,
  `constitutionIds`, `status` proposed→accepted). Actor implement is fail-closed until
  `--accept` / `core/ddr.mjs accept`. Prove completion receipts may link `ddrId`.
  Doctor bite: `verify/denoise-packet.test.mjs`.

- **Reflexion stub + easy denoise kit (N2–N4).** Atlas-shaped critic
  (`core/reflexion.mjs`: done|partial|blocked|error, one call, bound retry, lessons
  require `ddrId`). `verify/preflight-slop.mjs` ports vibe-check `ai-slop-*` signals.
  Opt-in Snapline + Impeccable adapters under `verify/adapters/` (cite never overridden).
  Operate filler deny-list expanded (N4). Sled fixtures promoted to `verify/fixtures/denoise/`.

- **Dual-focal + KPI soup + restructure DOM (N6–N7).** Measure hard-fails peer
  worklists (`dual-focal`) and ≥4 equal metrics on queue cites (`kpi-soup`).
  `shine-restructure/v1` + `apply-dom.mjs` (cta-budget, kpi-collapse, set-focal,
  rebind-cite; collapse-peer-grids plan-only). `npm run denoise:eval` scorecard.

- **TSX AST + worklist kit + denoise loop (N8–N11).** `apply-tsx.mjs` safe ops
  (dual-grid plan-only). Worklist-first recipe in `kits.md`. Cite v2
  `restructureHints[]` emit concrete ops. `npm run denoise:loop` golden FAIL→PASS
  path (`docs/denoise-golden-prove.md`).

- **Denoise residuals wiring.** `diagnosis.mjs emit-restructure` writes
  `shine-restructure.json` from dualFocal/kpiSoup/citeHonesty/competingCta checks;
  `assertDenoisePaintAllowed` refuse-paint; preflight-slop failures fold into
  `measure.mjs`; kits Queue cite → `shadcn-queue`.

### Changed

- **Operate prove is mandatory.** Stop-sweep fails closed when SaaS Operate page cites
  (`dashboard` / `settings` / `form` / `queue` / `record` / `app-shell` / …) change without a
  fresh `verify/prove.mjs` completion receipt. A `compare.mjs` receipt alone no longer clears
  the gate. Marketing and wireframe surfaces stay out of this requirement. Green prove always
  mints `~/.cache/shine/last-completion.json`. See `skill/references/verification.md`.

### Fixed

- **Doctor fixup after expert harvest.** Materialize P2 blueprint packs (tokens.css +
  provenance manifests), enlarge page shots above the 30KB floor, and bump
  `coverage.test.mjs` reference total to 224.

### Added

- **Nucleus golden-path prove (P6).** `verify/fixtures/nucleus-golden/` fail→pass measure
  with log receipts and distinct CTA/card defect crops (not twin full-page shots).
  Doctor bite via `verify/nucleus-golden.test.mjs`; write-up in `docs/nucleus-golden-prove.md`.

- **Pattern recommender / cite v2 (P5).** `corpus/recommend.mjs` emits primary cite,
  antiPatterns, restructureHints, kitRecipe, and confidence; design-packet writes
  `recommendation` into the packet; cite CLI prints the summary. Doctor runs
  `verify/recommend.test.mjs` (8+ Nucleus-like Operate jobs).

- **Settings/forms corpus + form contracts (P2).** +3 settings and +2 form/record
  authored page blueprints with shots; cite golden floors raised; kits recipes point at
  them; `verify/form-heuristics.mjs` fails closed when `aria-invalid` lacks a message.

- **Composition slop detectors (P3).** Measure hard-fails Operate saas cites for
  equal-weight Card soup without a focal, marketing DNA glow/gradient/display clusters,
  and known filler empty-state phrases (`verify/composition-slop.mjs`). Doctor runs
  `verify/composition-slop.test.mjs`.

- **Nucleus golden fixture + Clearspeed attach profile (P4a).** Fixture
  `verify/fixtures/nucleus-golden/{before,after}.html` seeds Company Tools–shaped
  bloat and an expert pass; `skill/references/clearspeed/profile-instructions.md`
  and `docs/nucleus-attach.md` document the repeatable attach path; `consumers.example`
  notes a Nucleus token row. Doctor runs `verify/nucleus-golden.test.mjs`.

- **Primary-job CTA pressure (P1).** Operate page cites hard-fail in `measure` when more
  than one distinct filled treatment appears in `main` (`verify/cta-pressure.mjs`).
  `competingCtaCheck.ok: false` must bind a `flow:` on a critical/major defect or prove
  reports `competingCtaProof: failed`. Doctor runs `verify/cta-pressure.test.mjs`.

- **Copy / adoption proof for `lane=saas`.** Diagnosis requires
  `copyHeadlineCheck` / `copyBeliefCheck` / `copyInstructionalCheck` (Operate +
  marketing/catalog) and `adoptionRitualCheck` / `adoptionPrivateWinCheck` /
  `adoptionAbsenceCheck` (Operate). `prove` binds them via `copyAdoption` and
  assertion ids on critical/major adoption defects; measure hard-fails missing
  title+H1 and stub empty-state copy when the copy heuristic gate applies
  (`verify/copy-adoption.mjs`). Presence only — belief/ritual honesty stays agent.
  Doctor runs `verify/copy-adoption.test.mjs`.

- A `catalog` packet category and a `shadcn-catalog` blueprint with a validated capture. A
  card catalog — a handful of rich records found by search and a few filters, one card per
  record with its own actions and disclosure — is not a data grid, and the first real audit
  pass showed the packet forcing a table comparison onto five cards. The audit brief now
  classifies as `catalog` and selects the catalog reference. 216 rows.

- Three composed-page Tailwind kits (MIT) enter the catalog as page-scope references:
  TailAdmin (dashboard, tables, forms, sign-in, profile, calendar), Windmill (dashboard,
  tables, forms, charts, login, create account) and Flowbite admin (dashboard, users,
  products, settings, sign-in, pricing). 215 rows across 14 families; every application
  surface — dashboard, queue, auth, settings, form, record — now offers three families in
  its page shortlist where it offered one. The kits join the shadcn and Tailwind build
  recipes as portable structure, carry their page's component imports as pack sources,
  and are harvested from their live demos. The packet reserves a shortlist slot for the
  house kit's page so the shadcn composition is always offered to a shadcn host.
- `shadcn-record`, `shadcn-checkout` and `shadcn-marketing` have authored `reference.html`
  renders and validated captures. 211 of 215 references are `passed`; the four that are
  not are query-only screenshots with no source, which source-mode retrieval never offers.
- Source excerpts strip Hugo/Astro front matter so an HTML page reads as markup.
- A real audit pass ran against Nucleus's Company Tools page with this release
  (`docs/audits/2026-09-16-nucleus-company-tools.md`): the packet selected a TailAdmin
  page reference with the shadcn queue still offered, measure and two usability flows
  passed on the live fixture, and the diagnosis recorded three evidenced minor findings
  without editing the product.

### Fixed

- `measure.mjs` no longer samples text inside a closed `<details>` for contrast. Collapsed
  content is painted over, so three legible list items reported 1.10:1 and failed a real
  page. Regression test: `verify/measure-closed-details.test.mjs`, run by the doctor.

- Every catalog row with a public render now has a validated capture: 190 of 197 references
  are `passed` (the seven remaining are query-only screenshots and three region-map
  blueprints with no renderable source). Before this, 8 rows were `passed`, 114 carried
  legacy captures with no HTTP or content evidence, and 74 had no screenshot, so `prove.mjs`
  could issue completion for exactly eight references. `harvest.mjs` maps Untitled UI, Magic
  UI and cult-ui rows from their `preview` pages the way it already mapped shadcn blocks,
  paces requests and retries transport failures, and every shadcn target names the block's
  rendered control instead of `body` (which `captureHealth` rejects, and which is why the
  legacy captures never refreshed). Moved Lightning and Spectrum pages point at their current
  URLs. Magic UI rows carry the component source beside the example so a pack is never a
  ten-line demo.
- The design packet names an unvalidated reference as a `reference:` gap up front, with the
  harvest command and any validated alternatives, instead of letting completion fail at the
  end of a build.
- `verify/catalog.test.mjs` exercises the owned kit lane end to end against temp
  directories: a manifest indexes into the private file, the public catalog is byte-identical,
  bad rows are reported, the private file is ignored and never tracked. `SHINE_OWNED_DIR` and
  `SHINE_CATALOG_OUT` are the generator's test seams. The doctor runs it, and the lint scope
  test, on every lane.
- `design-lint` compares against the commit a session started from, not HEAD: a mid-turn
  commit no longer turns that turn's off-token values into "pre-existing" ones. The baseline
  is keyed by session and repository under the temp dir; `SHINE_LINT_BASE` overrides it, a
  baseline that stops being an ancestor falls back to HEAD, and the stop sweep passes the
  session through. The Cursor hook contract (top-level `file_path`, exit 2) is now tested.
- The library build's Tailwind import is `source(none)`: it scans only the declared
  `@source` paths, so harvested pack sources can no longer grow the published stylesheet.
  `site/library/app.css` shrinks from 183 KB to 125 KB with the same 49 browser checks.

- The catalog grows from 130 to 197 rows and from 10 to 11 visual families. Untitled UI now
  contributes 16 cite-able rows derived from the shipped examples catalog (header navigation,
  featured cards, bar/pie/radar charts, gauges, progress circles, tabs, pagination, date
  picker, file upload, loading indicators, carousel) instead of 3. Magic UI contributes 44
  marketing region examples across six new marketing screens (features, proof, metrics,
  mockup, developer, integrations) and cult-ui 11 hero, proof, metrics, onboarding and
  carousel components — both install through the shadcn registry, so a shadcn or Tailwind
  host can build them. Every unclassified upstream example is reported by the generator, not
  silently indexed.
- `corpus/catalog.mjs` is the single catalog reader. Licensed kits (Tailwind Plus, Untitled
  UI PRO) index from `~/design-corpus/owned/<kit>/manifest.json` into a gitignored
  `corpus/templates.owned.json` that every reader merges and nothing publishes. See
  `corpus/owned/README.md`.
- `design-packet.mjs --mode audit`: diagnosis, measure and report with `editing.allowed:
  false` and no completion receipt. A review no longer has to run as `existing`, which
  required fixing what it named.
- `shine-diagnosis.json` accepts `verdict: no-change` with `verdictEvidence` and full bucket
  coverage in `checked`. The defect floor drops from 3 to 1 and the mandatory critical/major
  finding is gone: the quota produced invented defects and inflated severities.

### Changed

- `design-lint` blocks only on lines the change touched (`git diff -U0 HEAD`). Legacy
  off-token values in the same file arrive as one soft note instead of a block, so fixing a
  label no longer forces a repaint of the stylesheet. Untracked files, repos without a
  commit and paths outside a repo still lint whole; `--all-lines` or `SHINE_LINT_SCOPE=file`
  restores whole-file blocking. The doctor runs its fixture check with `--all-lines`.
- `magicui` and `cult-ui` join the shadcn and Tailwind build recipes after the two house
  kits; `magicui`'s direction profile is `shadcn-tanstack`, not `native`.
- `shadcn-settings` `captureExpect` and note are encoded in the generator; they had been
  hand-edited into the committed catalog and dropped on the first regenerate elsewhere.
- `integrations/mcp-ssh-bridge.py`: a reconnecting stdio bridge for MCP servers reached over ssh.
  It respawns the link after laptop sleep or a Tailscale rebind, replays the `initialize` handshake
  and idempotent list requests, and returns a retryable JSON-RPC error for tool calls that were in
  flight. Fixes the Hollywood MCP dropping to `Server disconnected` after every overnight sleep.
  Real profiles live in ignored `integrations/*.local.json`; an example profile is committed.

## [4.0.2] — 2026-09-01

### Fixed

- The same installed-symlink main-module check now covers diagnosis, lint, benchmark, and Figma
  entry points. The portfolio dogfood run exposed diagnosis immediately after packet execution was
  fixed, so the audit expanded to every executable instead of patching one command at a time.

## [4.0.1] — 2026-09-01

### Fixed

- Installed CLI entry points now resolve their invoked symlink before checking whether they are
  the main module. Running the packet, renderer, integration resolver, usability verifier, or
  compare verifier through the immutable `current` release path now executes instead of exiting
  silently. The downstream portfolio dogfood test found this immediately after V4 launched.

## [4.0.0] — 2026-09-01

Shine V4 adds an enforceable art-direction layer without replacing shadcn. Reference shortlists
cap each visual family at one candidate per scope, composed pages outrank atoms, and every design
spec declares its composition archetype, image strategy, signature moment, and anti-repetition
constraint. Cross-media work now routes to native web, editable-deck, code-first-deck, PDF, or
email production.

### Added

- `references/cross-media.md`, the complete self-contained `shine-skill.md`, and a Claude plugin.
- A measured V3/V4 dogfood pair and a rebuilt public product story with executable conversion.
- A public, non-technical skill path at `/skill`: read the canonical file, copy
  it with one action, download `SKILL.md`, or use it as persistent instructions
  in an AI without native skill support. The public Markdown is generated from
  `skill/SKILL.md`, and the doctor fails if the two drift.
- A LinkedIn-ready V3 article documenting the failed likeness critic, fictional
  visual proof, dead symlinked hooks, weekly-board evidence gap, runtime pruning,
  and the move from visual confidence to executable usability.

### Changed

- The design spec schema is V4 and retrieval explicitly caps same-family repetition.
- The public page now leads with the director and the before/after proof instead of a long essay.
- Usability text assertions now wait for asynchronous interaction results instead
  of reading immediately after a click; the public skill proof also runs under
  the production CSP so a blocked self-fetch cannot pass locally.
- Added explicit public credit and links for [shadcn](https://github.com/shadcn),
  creator of [shadcn/ui](https://github.com/shadcn-ui/ui), to the README, V3
  release notes, and website footer.

## [3.0.0] — 2026-09-01

Shine V3 replaces self-attested visual similarity with executable proof: real
template source and screenshots, browser-tested usability contracts, measured
comparison, and editor hooks whose failure paths are themselves verified.

### Removed

- **MUI, Ant Design Pro and IBM Carbon are deleted from the corpus** (see
  [docs/no-foreign-runtimes.md](docs/no-foreign-runtimes.md)). 17 catalog rows,
  15 harvested packs, 4 corpus clones and pins, 3 voice sheets
  (`material.css`, `ant.css`, `carbon.css`), 7 fixture runtime dependencies, and
  every reference that pointed at them. Not retired — gone. Both consumers are
  shadcn/Tailwind repos, so a page on a foreign runtime could only ever teach
  costume. Catalog: 144 rows → 128; kits: 16 → 12.
- `verify/fixtures/integrations` no longer installs `@mui/*`, `@carbon/react`,
  `antd` or Emotion. It builds the two recipes Shine supports — shadcn/TanStack
  and a new `native` semantic-table view — and its lockfile carries 74 packages
  with zero foreign entries.

### Added

- `shadcn-weekly-board` is now a complete authored blueprint pack: copyable
  shadcn source, executable owner/outcome workflow, kit tokens, provenance
  manifest, and a captured reference. Its required `compare.mjs` proof now exits
  zero for a conforming artifact instead of refusing the intentionally absent
  screenshot.
- `corpus/blueprints/shadcn-blog.md` — the blog screen's only row was MUI's;
  deleting MUI would have deleted the screen. Doctor fails if it goes missing.
- `templates.md` marks every retired row **retired** and lists the reasons under
  the table. A retired row used to be indistinguishable from a live one in the
  reference the agent actually reads.
- `verify/art-direction.test.mjs` asserts by name that the 5 deleted kits and 17
  deleted ids never reappear in the catalog.
- `--shine-text-base` / `--shine-text-sm` in `untitled.css` — the one voice sheet
  missing them, so Untitled-painted pages fell back to browser defaults.

### Fixed

- Updated the Cursor SDK and pinned its transitive HTTP client to the patched
  `undici` 6.28.0 release, clearing all three root npm audit findings.
- Compare recognizes compact peer-control navigation such as a weekly owner
  roster, while retaining a width floor that prevents incidental links from
  satisfying a page navigation contract. The proof matrix now carries positive
  `shadcn-weekly-board` and `shadcn-dashboard-01` cases, and the dashboard fixture
  binds its cite and summary at the document contract boundary.
- **Every editor hook was dying at runtime.** `skill/run-hook.sh` resolved its
  root with a logical `cd ..`, and every surface invokes it through a symlink, so
  it walked the *link's* parent: `~/.agents/skills/verify/doctor.mjs`,
  MODULE_NOT_FOUND, on all three surfaces. The doctor read the hook config and
  called the wiring green. It now runs the real command through the real link.
- **Four voice sheets shipped an action colour that failed AA against its own
  label**, found by generalising the contrast test from one sheet to all ten:
  `mantine` 3.56:1 → 5.02:1 (blue[8]), `slds` 2.19:1 dark → 4.67:1
  (`accent-container-1` is the Brand-button fill; `accent-2` is the ink hook),
  `spectrum` 2.19:1 dark → 5.39:1 (indigo-900 in both modes), `tremor` 3.68:1 →
  5.17:1 (blue-600). The test now runs every sheet in every mode it declares and
  asserts a shared core role set.
- `measure.mjs` likeness rules keyed off `family === "carbon"`; they now key off
  the cited row's jobs, so any records/table cite is held to them.
- `integrations-bite.mjs` still scaffolded `mui`/`carbon`/`ant` after those
  recipes were retired on 2026-08-29 — a `doctor:full` check that had been red
  and unreported since.
- Required-screen coverage is computed by job, not by the `screen` field, and the
  shot check now reports which screens are structure-only (region map, no
  harvested pixels): marketing, checkout, wizard.

### Added

- Framework-aware MUI, Carbon, Ant, shadcn/TanStack, native, and LEX integration recipes with installed-kit preservation, API provenance, and executable scaffolding.
- Deterministic template dependency closures with pinned upstream provenance, per-file hashes, structural signatures, and query-only source restrictions; MUI and Ant CRUD packs now carry their real grid pages.
- Executable DataGrid contract: native tables and ARIA grids are discovered automatically, interactive sort/filter/page controls must change rendered state, and every default capability has a seeded fail/pass proof.
- House and kit voices all carry `--shine-color-*` (shine, magicui, spectrum, fluent, mantine, slds, plus heroui and tremor). Doctor fails any colorless sheet, not just the favoured four.
- Harvested shots for `spectrum-ai-chat`, `antd-pro-chatbot`, and the LEX blueprints (SLDS vendor pages). `corpus/blueprints/lex-*.md` is the region map.
- `cite.mjs "lightning record"` resolves to `lex-record`. Doctor asserts it.
- Every required screen type now has a pack shot. Doctor asserts that too.

### Changed

- Magic UI / Tremor / HeroUI harvest URLs are component/docs routes, not marketing homepages.
- Fluent pack source is `NavDrawer.tsx`, not type barrels.
- Public copy no longer says “41 real templates.” `--ci` is 69.

### Added

- Packs carry readable `source/` and kit `tokens.css` next to the harvested shot; `cite.mjs` lists those, not a dump of `~/design-corpus`
- `compare.mjs` exits 1 when measured facts prove the page is not a relative of the cite (attribute-stamp vs carbon-datatable is the seed)
- Compare receipts bind to exact artifact content and template pixels, and are minted only after a passing verdict.
- Stop-sweep cite gate: a UI page written this turn needs `data-cite` (or `<!-- cite: id -->`)
- `skill/run-hook.sh` so Cursor/Claude hooks follow the loaded skill symlink
- Prove receipt: `compare.mjs` writes `last-prove.json`; stop-sweep blocks a cited page with no matching compare this turn
- Zinc-on-carbon fixture: table + `data-cite="carbon-datatable"` + zinc voice — compare exits 1
- Doctor fails if `~/Projects/shine-live` exists (skills load shine-deploy only)
- Phase 4 e2e: live Brutus session before/after under `verify/fixtures/e2e/brutus-session/` (`shadcn-dashboard-01`)

### Changed

- Skill is a loader: parent `Task`s `shine-ux` and does not freelance the loop
- Cite/measure/compare resolve from the loaded skill realpath, not a hardcoded checkout
- Public `--ci` count tracks the `--ci` run (now 76)
- Doctor fails a hardcoded `Projects/shine*` tool path, a skill over 80 lines, deploy drift off `main`, and sessionStart `|| true`
- README install uses `$SHINE` (detached `origin/main` worktree) and a fail-closed doctor
- Stop-sweep no longer fail-opens on a lint crash, a git error, or a missing hook payload

### V3 foundation — 2026-08-21

Shine V3 is the unfuck. An audit (docs/audit-2026-08-21.md) measured V2's retrieval layer
as fiction: the DNA packs were generated placeholder stubs, the critic scored "likeness"
by grepping page source for data-* attributes (a one-button page scored 10/10 against the
Carbon datatable), the voice sheets carried zero colors while the lint banned raw color
values — so kit paint was unexpressible — and the executor hardcoded a stale pre-V2
checkout. V3 deletes the theater and makes retrieval real.

#### Removed

- `verify/critic.mjs` — the regex likeness gate trained attribute-stamping; kept as a
  regression: `verify/fixtures/attribute-stamp.html` must never be blessed by anything
- `corpus/packs/*` stub specimens, `corpus/pack.mjs`, `corpus/dna-families.json`
- `skill/references/inspiration.md` (the mandatory row-authoring detour) and the cite
  liturgy — `images_read`, "naming an id you did not open is inventing", pack-PNG
  instructions for PNGs that never existed
- The 141-row catalog flood: 71 chart demos, wildcard sidebars/logins, and the
  self-citing `lex-*`/`shine-*` rows that pointed at shine's own generated stubs

#### Added

- `corpus/cite.mjs` v2 — plain-words matching ("settings page" resolves), ≤3 results,
  registry JSON auto-extracted to readable `.tsx` under `corpus/extracted/`, pack shots
  and kit token sheets surfaced as they land
- `verify/compare.mjs` — side-by-side composite of your page and the template's
  harvested shot, plus measured facts (fonts, heading sizes, radii, palette). No score,
  no verdict; refuses to run without real pixels
- Doctor: packs must carry real full-page shots (≥30KB) or report honestly as
  unharvested; compare honesty checks; cite synonym checks; no-liturgy invariants

#### Changed

- SKILL.md rewritten around **look → name → match → restructure → repaint → prove**;
  the rendered page is read before it is diagnosed
- Kit paint is legal: values live in custom-property definitions (voice sheets, pack
  `tokens.css`, or the page's token block); usage sites say `var(--…)`
- `verify/measure.mjs` likeness checks key off the `--cite` flag + catalog family,
  never off page attributes; the data-cite attestation failure is gone
- Catalog regenerated: 41 curated rows, every one a real composed screen, component
  set, or an honest `blueprint` row (LEX)
- Slop lists and "2026 defaults" downgraded from bans to lane-relative guidance — the
  template's real pixels are the anti-slop mechanism

### Phase 2 (same day)

- `corpus/harvest.mjs`: 26 packs harvested — full-page screenshots of the REAL screens
  (shadcn /view routes, MUI live templates, Ant Pro preview, Carbon storybook, Magic UI,
  Mantine, Fluent, Tremor, HeroUI), each with `meta.json` provenance. Skips are named,
  never silent (LEX blueprints and Spectrum ai-chat have no public renderable target).
- Voice sheets carry real paint: carbon/shadcn-zinc/material/ant hold the kits' actual
  colors, verified against pinned sources and cited per value; mantine/fluent carry
  verified primaries; slds maps onto org-measured styling hooks.
- Doctor: packs must hold ≥30KB real shots (seeded-violation proven), voice sheets must
  carry ≥5 color tokens for the four full kits (seeded-violation proven), compare's live
  run stays verdict-free even on the attribute-stamp fixture.

## [2.0.0] — 2026-08-21

Shine V2 is a **visual director**, not a completeness-only auditor. V1 could retrieve a catalog id and still paint every screen as the same zinc dashboard. V2 ships DNA packs the agent must open, executable voice CSS, a critic that fails a Carbon cite in Geist chrome, and Salesforce host lanes.

### Added

- Visual DNA packs under `corpus/packs/<id>/` (`dna.json`, `regions.json`, `remap.json`, `notes.md`, `specimen.html`) generated by `corpus/pack.mjs`
- `verify/critic.mjs` — likeness to the pack, named 2026 slop classes; Carbon-as-zinc **fails**
- `tokens/voices/<family>.css` — kit-faithful remaps that actually change `--shine-*`
- `skill/references/direction.md` — lanes, `DESIGN.md`, uniqueness pass
- `skill/references/layout.md` and `interaction.md`
- Lightning catalog rows: `lex-record`, `lex-record-narrow`, console, queue, LWR, email, mobile
- Design-lint family **slop** (cream `#F4F1EA`, indigo defaults, purple glow) that cannot be pragma-exempted
- Measure: walk `shadowRoot`, refuse 0/0; empty `--slds-*` hooks are findings

### Changed

- `/shine` and `shine-ux` require opening pack specimens and reporting `images_read`
- Wireframe lock writes `DESIGN.md` with lane + cite + signature
- `cite.mjs` prints pack paths and voice CSS
- Doctor fails if `startFrom: 1` rows lack packs
- Salesforce reference names the **host**, not only the palette

### Honest limits

- Completeness still beats a Behance poster. Measure stays the compliance gate; critic is the taste/likeness gate.
- SigLIP embeddings are optional (`SHINE_SIGLIP`); the default critic is structural DNA + slop, not a hosted VLM.
- Marketing pipelines stay off Lightning record pages.

[3.0.0]: https://github.com/justinfowler925/shine/releases/tag/v3.0.0
[2.0.0]: https://github.com/justinfowler925/shine/releases/tag/v2.0.0
