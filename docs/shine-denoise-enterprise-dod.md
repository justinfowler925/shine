# Denoise + enterprise — Definition of Done (live)

**Audience:** Justin  
**Verified:** 2026-10-07T19:30Z  
**Verdict: PARTIAL** — tip `b043a41` (#161) is **merged + skill-deployed** (live `release.json` matches). Tip Actions (`doctor-*` / `benchmark-smoke`) are **queued**, not green. Local tip checkout fails `skill-listing --check` (stale line counts) — tip doctor will fail when the Mac runner drains the queue unless listing is refreshed. ClearSpeed hosts trail tip (laptop `@77ee84b`, Studio S8 last **15/15** `@6f28cff`). Hosted `ubuntu-latest` still billing-locked; CI is Free self-hosted Mac.

**Tip under test:** Shine `main` = `b043a41b973ff534d92debb9432a9d1e36b11e69` (#161 on top of #149–#160).  
**Last `shine` workflow SUCCESS on `main`:** `368acb0…` (#147) — https://github.com/justinfowler925/shine/actions/runs/37653218861  
**Do not treat `77ee84b` / `3cb2ab7` / `d7a12e64` as tip** — superseded by #161.

Plans (Project store): `shine-denoise-build-plan.md` · `shine-enterprise-agent-plan.md`  
Related in-repo DoD: [`distribution-dod.md`](./distribution-dod.md) (15/15 destinations) · [`phase0/DOD.md`](./phase0/DOD.md)

---

## Honest DoD matrix

| Track | Merged | CI green | Local tests | Deployed | Prove / hosts | Gaps |
|---|---|---|---|---|---|---|
| Shine #149–#161 denoise deepen @ tip | **YES** | **NO** (tip runs queued; listing stale) | PR-local bites + #149 PR doctor green; tip listing **stale** | **YES** (live `release.json` = tip) | Laptop ClearSpeed `@77ee84b` (1 tip behind); Studio S8 `@6f28cff` | Tip Actions + skill-listing + host tip sync + S8 |
| Shine N0–N11 + DDR + Reflexion + #132–#148 base | **YES** | last full green tip `368acb0` / prior denoise green `d7a12e64` | historical YES | historical YES | — | superseded tip |
| Nucleus Company Tools attestation | n/a | n/a | n/a | **trails** (`sourceRevision` `77ee84b`) | refresh after Studio/Nucleus bump | behind tip |
| Distribution 15/15 | last receipt `@6f28cff` | — | — | Studio verify pending tip | — | not re-proven @ tip |

**Bottom line:** Denoise #149–#161 is **merged + Vercel-deployed** at `b043a41`. It is **not** CI-green on tip yet, and ClearSpeed / S8 / Nucleus attestation are **not** tip-synced.

---

## 1. Shine Actions — posture @ tip

### Runner

| Runner | Labels | Status | Busy |
|---|---|---|---|
| `justin-macbook-shine` | `self-hosted`, `macOS`, `ARM64`, `shine` | **online** | **yes** |

Large queue of `shine` + `shine-benchmark` runs from #149+ merges (dozens queued). Tip push runs:

| Workflow | Tip SHA | Status | URL |
|---|---|---|---|
| `shine` (`doctor-default` / `doctor-full`) | `b043a41` | **queued** | https://github.com/justinfowler925/shine/actions/runs/37674439378 |
| `shine-benchmark` | `b043a41` | **queued** | https://github.com/justinfowler925/shine/actions/runs/37674439404 |

### Tip content gate (will fail doctor when run)

On clean tip checkout (2026-10-07T19:30Z):

```text
skill-listing: STALE — denoise.md says 150, is 187; wireframe.md says 227, is 252; total says 5672, is 5735
  fix: node site/scripts/skill-listing.mjs --write
```

Same class of fail seen on #150 PR doctor (listing drift). **Required tip CI is not green until queue drains and listing is current.**

### Hosted `ubuntu-latest`

Still billing-locked on Free (`justinfowler925`). Optional; not required for DoD. Self-hosted Mac remains the Free path (#132 pattern).

---

## 2. Shine PRs #149–#161 — merge SHAs + check posture

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
| [#160](https://github.com/justinfowler925/shine/pull/160) | Operate slop anti-patterns JSON + doctor bite | `77ee84b…` | pending (queued) |
| [#161](https://github.com/justinfowler925/shine/pull/161) | Measure fail-closed on Operate anti-pattern cites | `b043a41…` **tip** | pending (queued); Vercel SUCCESS |

Admin-merged through queue is the live pattern for #159–#161; do not read empty/pending rollups as green.

---

## 3. Shine `main` tip — surface present

**HEAD:** `b043a41b973ff534d92debb9432a9d1e36b11e69`

Includes #149–#161 denoise deepen (fixtures, constitutionIds, sibling map/learn, DDR + denoise-loop audit append, Critic≠Actor host, wireframe-brief lock, `reflexionVerdict`, skill A/B deepen, Operate slop anti-patterns, measure anti-pattern cite fail-closed) on top of earlier N0–N11 / DDR / Reflexion / CI-unblock stack.

---

## 4. Shine deploy — live matches tip

Live [`https://shine-blond.vercel.app/release.json`](https://shine-blond.vercel.app/release.json) @ verify time:

```json
{
  "sourceRepository": "justinfowler925/shine",
  "sourceRevision": "b043a41b973ff534d92debb9432a9d1e36b11e69",
  "skillSha256": "f62455043524a65f0f1fc92a7a95302aefe4324639e94ea7f65ff342299abcbe"
}
```

| Signal | Value |
|---|---|
| `main` tip | `b043a41…` |
| Live `sourceRevision` | `b043a41…` (**match**) |

---

## 5. ClearSpeed hosts

| Host | Tip installed | Package / proof | Status |
|---|---|---|---|
| **JFMacM5** (`JFowler3`) | `77ee84b…` (#160) | `shine-clearspeed-77ee84b-a40634be0ece` · `brandAccent #ED5925` · `verifySkillDeployment` PASS `kind: edition` | **1 tip behind** `b043a41` — bump pending |
| **Mac Studio** (`jf-studio` / `jfstudio`) | last S8 **15/15** `@6f28cff` (#148); peer bumps mid-flight | Studio proofs through older tips; `77ee84b`/`b043a41` bump **pending** | **trails tip** |
| Nucleus `/api/company-tools/shine/release` | attests `77ee84b…` | https://nucleus-clearspeed.vercel.app/api/company-tools/shine/release | **trails tip** |

Hosted distribution DoD ([`distribution-dod.md`](./distribution-dod.md)) is **not** re-closed at `b043a41`.

---

## 6. Gaps (blunt)

1. **Tip Actions not green** — `shine` / `shine-benchmark` @ `b043a41` still **queued** on `justin-macbook-shine` (online + busy; long backlog).
2. **Tip skill-listing stale** — doctor content gate will fail until `node site/scripts/skill-listing.mjs --write` lands on `main`.
3. **ClearSpeed laptop** @ `77ee84b`, not `b043a41`.
4. **Studio S8 / Nucleus attestation / portfolio** not tip-synced; last full Studio 15/15 `@6f28cff`.
5. **Hosted `ubuntu-latest` billing lock** — optional; Free self-hosted remains the path.
6. Prior #150–#159 PR doctor reds — mostly listing drift / queue; do not claim PR-time green for the whole band.

---

## 7. What would close DoD for tip `b043a41`

| Gate | Status |
|---|---|
| Merged #149–#161 on tip | **YES** |
| Live skill deploy = tip | **YES** |
| Tip `doctor-default` + `doctor-full` SUCCESS | **NO** (queued + listing stale) |
| Tip `benchmark-smoke` SUCCESS | **NO** (queued) |
| ClearSpeed JFMacM5 + Studio @ tip | **NO** |
| Distribution verify 15/15 @ tip | **NO** |
| Nucleus company-tools `sourceRevision` = tip | **NO** (`77ee84b`) |

Answer to “CI'd, merged, deployed, tested, verified, DoD?” for tip `b043a41`: **merged + deployed; not yet CI-green or host/S8 tip-closed.**
