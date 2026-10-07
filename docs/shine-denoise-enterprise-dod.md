# Denoise + enterprise — Definition of Done (live)

**Audience:** Justin  
**Verified:** 2026-10-07T21:01Z  
**Verdict: PARTIAL** — tip `91b09eb` (#175) is **merged + skill-deployed** (live `release.json` matches). Tip Actions (`doctor-*` / `benchmark-smoke`) are **queued**, not green. Local tip `skill-listing --check` is **STALE** after #173–#175 skill-doc drift (`denoise.md` 189→190, `kits.md` 214→233, total 5780→5800) — needs a listing refresh (same pattern as #164/#169). ClearSpeed hosts trail tip (laptop `@f674a66`, Studio S8 last **15/15** `@6f28cff`). Nucleus attests `6d14dc2` (far behind tip). Hosted `ubuntu-latest` still billing-locked; CI is Free self-hosted Mac.

**Tip under test / `main` HEAD:** `91b09ebc15b0600cf790a86702e11cd887ad9ffc` (#175 dual-focal ban TSX AST collapse-peer-grids).  
**Denoise product tip:** `91b09ebc15b0600cf790a86702e11cd887ad9ffc` (#175).  
**Last `shine-benchmark` SUCCESS on `main`:** `a6b045a…` (#164) — https://github.com/justinfowler925/shine/actions/runs/37675830335  
**Last tip `shine` doctor FAILURE on `main`:** `9401e15…` (#165) listing stale — https://github.com/justinfowler925/shine/actions/runs/37678308266  
**Do not treat `b8d7db7` / `25571dc` / `fa3178c` / `46c349f` / `0d62e6f` / `7ef8af5` / `f674a66` / `8805c1d` / `9401e15` / `a6b045a` as tip** — superseded by #175.

Plans (Project store): `shine-denoise-build-plan.md` · `shine-enterprise-agent-plan.md`  
Related in-repo DoD: [`distribution-dod.md`](./distribution-dod.md) (15/15 destinations) · [`phase0/DOD.md`](./phase0/DOD.md)

---

## Honest DoD matrix

| Track | Merged | CI green | Local tests | Deployed | Prove / hosts | Gaps |
|---|---|---|---|---|---|---|
| Shine #149–#175 denoise + deepen @ tip | **YES** | **NO** (tip runs queued) | PR-local AST bites (#173–#175); listing **STALE** | **YES** (live `release.json` = tip) | Laptop ClearSpeed `@f674a66` (trails); Studio S8 `@6f28cff` | Tip Actions + listing refresh + host tip sync + S8 + Nucleus |
| Shine N0–N11 + DDR + Reflexion + #132–#148 base | **YES** | last full green tip `368acb0` / listing-refresh benchmark `a6b045a` | historical YES | historical YES | — | superseded tip |
| Nucleus Company Tools attestation | n/a | n/a | n/a | **trails** (`sourceRevision` `6d14dc2`) | refresh after Studio/Nucleus bump | far behind tip |
| Distribution 15/15 | last receipt `@6f28cff` | — | — | Studio verify pending tip | — | not re-proven @ tip |

**Bottom line:** #149–#175 is **merged + Vercel-deployed** at `91b09eb`. It is **not** CI-green on tip yet; skill-listing is **stale**; ClearSpeed / S8 / Nucleus attestation are **not** tip-synced.

---

## 1. Shine Actions — posture @ tip

### Runner

| Runner | Labels | Status | Busy |
|---|---|---|---|
| `justin-macbook-shine` | `self-hosted`, `macOS`, `ARM64`, `shine` | **online** | **yes** |

Large queue of `shine` + `shine-benchmark` runs from #149+ merges. Tip push runs:

| Workflow | Tip SHA | Status | URL |
|---|---|---|---|
| `shine` (`doctor-default` / `doctor-full`) | `91b09eb` | **queued** | https://github.com/justinfowler925/shine/actions/runs/37686162242 |
| `shine-benchmark` | `91b09eb` | **queued** | https://github.com/justinfowler925/shine/actions/runs/37686162203 |

Mid-queue signal (not tip): #173 PR `doctor-full` **PASS** (~9m) while `doctor-default` / `benchmark-smoke` still pending — https://github.com/justinfowler925/shine/actions/runs/37684446867

### Tip content gate

On clean tip checkout (2026-10-07T21:01Z):

```text
skill-listing: STALE — denoise.md says 189, is 190; kits.md says 214, is 233; total says 5780, is 5800
  fix: node site/scripts/skill-listing.mjs --write
```

#169 cleared post-#165–#167 drift; #170–#172 did not re-stale. #173–#175 skill-doc edits re-staled listing. Content gate will fail tip doctor until a listing refresh lands.

### Hosted `ubuntu-latest`

Still billing-locked on Free (`justinfowler925`). Optional; not required for DoD. Self-hosted Mac remains the Free path (#132 pattern).

---

## 2. Shine PRs #149–#175 — merge SHAs + check posture

All **MERGED**. Merge commit = tip ancestry chain.

| PR | Scope | Merge SHA | PR-time doctor / benchmark (honest) |
|---|---|---|---|
| [#149](https://github.com/justinfowler925/shine/pull/149) | Denoise-eval / skill-ab FAIL→PASS crop pairs | `85ff702…` | **doctor-default/full + benchmark-smoke SUCCESS** |
| [#150](https://github.com/justinfowler925/shine/pull/150) | constitutionIds in DDR + critic | `0173fc5…` | doctor **FAILURE** (skill-listing stale) |
| [#151](https://github.com/justinfowler925/shine/pull/151) | constitutionIds on prove + edition catalog bite | `aa5065c…` | doctor-full **FAILURE** / incomplete |
| [#152](https://github.com/justinfowler925/shine/pull/152) | Edition sibling map (cite+kit) | `21b93fb…` | doctor **FAILURE** |
| [#153](https://github.com/justinfowler925/shine/pull/153) | DDR audit trail auto-append | `6cc7535…` | doctor incomplete / queued |
| [#154](https://github.com/justinfowler925/shine/pull/154) | Repertoire sibling learn | `c955bef…` | doctor **FAILURE** |
| [#155](https://github.com/justinfowler925/shine/pull/155) | Denoise-loop audit auto-append | `4086a37…` | doctor incomplete / fail |
| [#156](https://github.com/justinfowler925/shine/pull/156) | measure→repair→critic host in denoise-loop | `65c6051…` | doctor-full **FAILURE** |
| [#157](https://github.com/justinfowler925/shine/pull/157) | Wireframe-brief structure lock | `490135c…` | pending / incomplete |
| [#158](https://github.com/justinfowler925/shine/pull/158) | Atlas `reflexionVerdict` on prove + loop stop | `38f5619…` | pending / incomplete |
| [#159](https://github.com/justinfowler925/shine/pull/159) | Skill A/B denoise deepen | `3cb2ab7…` | doctor-full **FAILURE** / pending |
| [#160](https://github.com/justinfowler925/shine/pull/160) | Operate slop anti-patterns JSON + doctor bite | `77ee84b…` | pending (queued) / cancelled on tip move |
| [#161](https://github.com/justinfowler925/shine/pull/161) | Measure fail-closed on Operate anti-pattern cites | `b043a41…` | pending / cancelled on tip move; Vercel SUCCESS |
| [#162](https://github.com/justinfowler925/shine/pull/162) | Enterprise DoD tracker doc | `e8eaea1…` | cancelled on tip move |
| [#163](https://github.com/justinfowler925/shine/pull/163) | DoD tip-pointer @ `e8eaea1` | `c078a24…` | cancelled on tip move |
| [#164](https://github.com/justinfowler925/shine/pull/164) | Skill-listing refresh | `a6b045a…` | **PR doctor-default/full SUCCESS**; tip benchmark-smoke **SUCCESS**; tip doctor cancelled (superseded) |
| [#165](https://github.com/justinfowler925/shine/pull/165) | Records/worklist table-quality + denoise recommend | `9401e15…` | tip doctor **FAILURE** (listing stale); PR checks pending/admin-merged |
| [#166](https://github.com/justinfowler925/shine/pull/166) | Sync-tokens fail-closed edition `brandAccent` `#ED5925` | `8805c1d…` | PR benchmark-smoke **SUCCESS**; doctor pending/queued |
| [#167](https://github.com/justinfowler925/shine/pull/167) | D10 XOR dual-grid via denoise recommend fixture | `f674a66…` | pending (queued); Vercel SUCCESS |
| [#168](https://github.com/justinfowler925/shine/pull/168) | DoD tip-pointer @ `f674a66` | `05ab7ef…` | cancelled / superseded on tip move |
| [#169](https://github.com/justinfowler925/shine/pull/169) | Skill-listing refresh (post-#165–#167) | `7ef8af5…` | admin-merged; tip Actions queued |
| [#170](https://github.com/justinfowler925/shine/pull/170) | Cite-ban learn deepen (episodic ban fail-closes recommend/packet) | `0d62e6f…` | admin-merged; tip Actions queued |
| [#171](https://github.com/justinfowler925/shine/pull/171) | Host `doctorBiteOk` + `observedCite` for cite-ban learn | `46c349f…` | admin-merged; tip Actions cancelled on tip move; Vercel SUCCESS |
| [#172](https://github.com/justinfowler925/shine/pull/172) | DoD tip-pointer @ `46c349f` | `fa3178c…` | cancelled / superseded on tip move |
| [#173](https://github.com/justinfowler925/shine/pull/173) | CTA pressure TSX AST `cta-budget` (maxFilled=1) | `25571dc…` | PR `doctor-full` **PASS**; `doctor-default` / `benchmark-smoke` pending; Vercel SUCCESS |
| [#174](https://github.com/justinfowler925/shine/pull/174) | KPI soup TSX AST `kpi-collapse` (maxVisible=3) | `b8d7db7…` | admin-merged; doctor/benchmark pending/queued; Vercel SUCCESS |
| [#175](https://github.com/justinfowler925/shine/pull/175) | Dual-focal ban TSX AST `collapse-peer-grids` (XOR) | `91b09eb…` **tip** | admin-merged; tip Actions queued; Vercel SUCCESS |

Admin-merged through queue is the live pattern for recent denoise deepen PRs; do not read empty/pending rollups as green.

---

## 3. Shine `main` tip — surface present

**HEAD:** `91b09ebc15b0600cf790a86702e11cd887ad9ffc` (#175)

Includes #149–#175: denoise deepen (fixtures, constitutionIds, sibling map/learn, DDR + denoise-loop audit append, Critic≠Actor host, wireframe-brief lock, `reflexionVerdict`, skill A/B deepen, Operate slop anti-patterns, measure anti-pattern cite fail-closed), enterprise DoD docs (#162/#163/#168/#172), skill-listing refresh (#164/#169), records/worklist table-quality (#165), ClearSpeed `brandAccent` fail-closed (#166), D10 XOR dual-grid recommend deepen (#167), cite-ban learn deepen (#170), host doctorBiteOk + observedCite wire (#171), CTA pressure AST (#173), KPI soup AST (#174), dual-focal ban AST XOR (#175) on top of earlier N0–N11 / DDR / Reflexion / CI-unblock stack.

---

## 4. Shine deploy — live matches tip

Live [`https://shine-blond.vercel.app/release.json`](https://shine-blond.vercel.app/release.json) @ verify time:

```json
{
  "sourceRepository": "justinfowler925/shine",
  "sourceRevision": "91b09ebc15b0600cf790a86702e11cd887ad9ffc",
  "skillSha256": "f62455043524a65f0f1fc92a7a95302aefe4324639e94ea7f65ff342299abcbe"
}
```

| Signal | Value |
|---|---|
| `main` tip | `91b09eb…` |
| Live `sourceRevision` | `91b09eb…` (**match**) |

---

## 5. ClearSpeed hosts

| Host | Tip installed | Package / proof | Status |
|---|---|---|---|
| **JFMacM5** (`JFowler3`) | `f674a66…` (#167) | `shine-clearspeed-f674a66-774d84b147ed` · `brandAccent #ED5925` · `verifySkillDeployment` PASS `kind: edition` | **trails tip** `91b09eb` — bump pending |
| **Mac Studio** (`jf-studio` / `jfstudio`) | last S8 **15/15** `@6f28cff` (#148); peer bumps mid-flight | Studio proofs through older tips; tip bump **pending** | **trails tip** |
| Nucleus `/api/company-tools/shine/release` | attests `6d14dc2…` | https://nucleus-clearspeed.vercel.app/api/company-tools/shine/release | **trails tip** (far behind) |

Hosted distribution DoD ([`distribution-dod.md`](./distribution-dod.md)) is **not** re-closed at `91b09eb`.

---

## 6. Gaps (blunt)

1. **Tip Actions not green** — `shine` / `shine-benchmark` @ `91b09eb` still **queued** on `justin-macbook-shine` (online + busy; long backlog).
2. **Skill-listing STALE** after #173–#175 — tip doctor will fail content gate until refresh.
3. **ClearSpeed laptop** @ `f674a66`, not `91b09eb`.
4. **Studio S8 / Nucleus attestation / portfolio** not tip-synced; Nucleus attests `6d14dc2`; last full Studio 15/15 `@6f28cff`.
5. **Hosted `ubuntu-latest` billing lock** — optional; Free self-hosted remains the path.
6. Prior #150–#165 PR/tip doctor reds — mostly listing drift / queue; do not claim PR-time green for the whole band.

---

## 7. What would close DoD for tip `91b09eb`

| Gate | Status |
|---|---|
| Merged #149–#175 on tip | **YES** |
| Live skill deploy = tip | **YES** |
| Tip skill-listing current | **NO** (STALE after #173–#175) |
| Tip `doctor-default` + `doctor-full` SUCCESS | **NO** (queued) |
| Tip `benchmark-smoke` SUCCESS | **NO** (queued) |
| ClearSpeed JFMacM5 + Studio @ tip | **NO** (laptop `@f674a66`) |
| Distribution verify 15/15 @ tip | **NO** |
| Nucleus company-tools `sourceRevision` = tip | **NO** (`6d14dc2`) |

Answer to “CI'd, merged, deployed, tested, verified, DoD?” for tip `91b09eb`: **merged + deployed; listing stale; not yet CI-green or host/S8 tip-closed.**
