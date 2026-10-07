# Denoise + enterprise — Definition of Done (live)

**Audience:** Justin  
**Verified:** 2026-10-07T20:14Z  
**Verdict: PARTIAL** — tip `f674a66` (#167) is **merged + skill-deployed** (live `release.json` matches). Tip Actions (`doctor-*` / `benchmark-smoke`) are **queued**, not green. Local tip checkout fails `skill-listing --check` again (drift after #165–#167; #164 had cleared an earlier stale). ClearSpeed hosts trail tip (laptop `@8805c1d`, Studio S8 last **15/15** `@6f28cff`). Hosted `ubuntu-latest` still billing-locked; CI is Free self-hosted Mac.

**Tip under test / `main` HEAD:** `f674a66bbb4ef6c42866ff975b3affc11ce19c78` (#167 D10 XOR dual-grid recommend deepen).  
**Denoise product tip (pre-docs band):** `b043a41b973ff534d92debb9432a9d1e36b11e69` (#161); post-docs deepen continues through #167.  
**Last `shine-benchmark` SUCCESS on `main`:** `a6b045a…` (#164) — https://github.com/justinfowler925/shine/actions/runs/37675830335  
**Last tip `shine` doctor FAILURE on `main`:** `9401e15…` (#165) listing stale — https://github.com/justinfowler925/shine/actions/runs/37678308266  
**Do not treat `8805c1d` / `9401e15` / `a6b045a` / `b043a41` / `77ee84b` as tip** — superseded by #167.

Plans (Project store): `shine-denoise-build-plan.md` · `shine-enterprise-agent-plan.md`  
Related in-repo DoD: [`distribution-dod.md`](./distribution-dod.md) (15/15 destinations) · [`phase0/DOD.md`](./phase0/DOD.md)

---

## Honest DoD matrix

| Track | Merged | CI green | Local tests | Deployed | Prove / hosts | Gaps |
|---|---|---|---|---|---|---|
| Shine #149–#167 denoise + deepen @ tip | **YES** | **NO** (tip runs queued; listing stale again) | PR-local bites; #164 PR doctor green; #165 tip doctor **FAIL** (listing); tip listing **stale** | **YES** (live `release.json` = tip) | Laptop ClearSpeed `@8805c1d` (1 tip behind); Studio S8 `@6f28cff` | Tip Actions + skill-listing + host tip sync + S8 |
| Shine N0–N11 + DDR + Reflexion + #132–#148 base | **YES** | last full green tip `368acb0` / listing-refresh benchmark `a6b045a` | historical YES | historical YES | — | superseded tip |
| Nucleus Company Tools attestation | n/a | n/a | n/a | **trails** (`sourceRevision` `9401e15`) | refresh after Studio/Nucleus bump | behind tip |
| Distribution 15/15 | last receipt `@6f28cff` | — | — | Studio verify pending tip | — | not re-proven @ tip |

**Bottom line:** #149–#167 is **merged + Vercel-deployed** at `f674a66`. It is **not** CI-green on tip yet, and ClearSpeed / S8 / Nucleus attestation are **not** tip-synced.

---

## 1. Shine Actions — posture @ tip

### Runner

| Runner | Labels | Status | Busy |
|---|---|---|---|
| `justin-macbook-shine` | `self-hosted`, `macOS`, `ARM64`, `shine` | **online** | **yes** |

Large queue of `shine` + `shine-benchmark` runs from #149+ merges. Tip push runs:

| Workflow | Tip SHA | Status | URL |
|---|---|---|---|
| `shine` (`doctor-default` / `doctor-full`) | `f674a66` | **queued** | https://github.com/justinfowler925/shine/actions/runs/37680234245 |
| `shine-benchmark` | `f674a66` | **queued** | https://github.com/justinfowler925/shine/actions/runs/37680234251 |

### Tip content gate (will fail doctor when run)

On clean tip checkout (2026-10-07T20:14Z):

```text
skill-listing: STALE — denoise.md says 187, is 188; kits.md says 179, is 182; table-quality.md says 95, is 103; total says 5735, is 5747
  fix: node site/scripts/skill-listing.mjs --write
```

#164 refreshed listing after #162/#163; #165–#167 re-drifted line counts. #165 tip doctor already **FAILED** on the same class of gate. **Required tip CI is not green until listing is current and queue drains.**

### Hosted `ubuntu-latest`

Still billing-locked on Free (`justinfowler925`). Optional; not required for DoD. Self-hosted Mac remains the Free path (#132 pattern).

---

## 2. Shine PRs #149–#167 — merge SHAs + check posture

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
| [#167](https://github.com/justinfowler925/shine/pull/167) | D10 XOR dual-grid via denoise recommend fixture | `f674a66…` **tip** | pending (queued); Vercel SUCCESS |

Admin-merged through queue is the live pattern for recent densoise deepen PRs; do not read empty/pending rollups as green.

---

## 3. Shine `main` tip — surface present

**HEAD:** `f674a66bbb4ef6c42866ff975b3affc11ce19c78` (#167)

Includes #149–#167: denoise deepen (fixtures, constitutionIds, sibling map/learn, DDR + denoise-loop audit append, Critic≠Actor host, wireframe-brief lock, `reflexionVerdict`, skill A/B deepen, Operate slop anti-patterns, measure anti-pattern cite fail-closed), enterprise DoD docs (#162/#163), skill-listing refresh (#164), records/worklist table-quality (#165), ClearSpeed `brandAccent` fail-closed (#166), D10 XOR dual-grid recommend deepen (#167) on top of earlier N0–N11 / DDR / Reflexion / CI-unblock stack.

---

## 4. Shine deploy — live matches tip

Live [`https://shine-blond.vercel.app/release.json`](https://shine-blond.vercel.app/release.json) @ verify time:

```json
{
  "sourceRepository": "justinfowler925/shine",
  "sourceRevision": "f674a66bbb4ef6c42866ff975b3affc11ce19c78",
  "skillSha256": "f62455043524a65f0f1fc92a7a95302aefe4324639e94ea7f65ff342299abcbe"
}
```

| Signal | Value |
|---|---|
| `main` tip | `f674a66…` |
| Live `sourceRevision` | `f674a66…` (**match**) |

---

## 5. ClearSpeed hosts

| Host | Tip installed | Package / proof | Status |
|---|---|---|---|
| **JFMacM5** (`JFowler3`) | `8805c1d…` (#166) | `shine-clearspeed-8805c1d-774d84b147ed` · `brandAccent #ED5925` · `verifySkillDeployment` PASS `kind: edition` | **1 tip behind** `f674a66` — bump pending |
| **Mac Studio** (`jf-studio` / `jfstudio`) | last S8 **15/15** `@6f28cff` (#148); peer bumps mid-flight | Studio proofs through older tips; tip bump **pending** | **trails tip** |
| Nucleus `/api/company-tools/shine/release` | attests `9401e15…` (#165) | https://nucleus-clearspeed.vercel.app/api/company-tools/shine/release | **trails tip** |

Hosted distribution DoD ([`distribution-dod.md`](./distribution-dod.md)) is **not** re-closed at `f674a66`.

---

## 6. Gaps (blunt)

1. **Tip Actions not green** — `shine` / `shine-benchmark` @ `f674a66` still **queued** on `justin-macbook-shine` (online + busy; long backlog).
2. **Tip skill-listing stale again** — doctor content gate will fail until `node site/scripts/skill-listing.mjs --write` lands on `main` (post-#165/#166/#167 drift; #164 fix superseded).
3. **ClearSpeed laptop** @ `8805c1d`, not `f674a66`.
4. **Studio S8 / Nucleus attestation / portfolio** not tip-synced; Nucleus attests `9401e15`; last full Studio 15/15 `@6f28cff`.
5. **Hosted `ubuntu-latest` billing lock** — optional; Free self-hosted remains the path.
6. Prior #150–#165 PR/tip doctor reds — mostly listing drift / queue; do not claim PR-time green for the whole band.

---

## 7. What would close DoD for tip `f674a66`

| Gate | Status |
|---|---|
| Merged #149–#167 on tip | **YES** |
| Live skill deploy = tip | **YES** |
| Tip `doctor-default` + `doctor-full` SUCCESS | **NO** (queued + listing stale) |
| Tip `benchmark-smoke` SUCCESS | **NO** (queued) |
| ClearSpeed JFMacM5 + Studio @ tip | **NO** (laptop `@8805c1d`) |
| Distribution verify 15/15 @ tip | **NO** |
| Nucleus company-tools `sourceRevision` = tip | **NO** (`9401e15`) |

Answer to “CI'd, merged, deployed, tested, verified, DoD?” for tip `f674a66`: **merged + deployed; not yet CI-green or host/S8 tip-closed.**
