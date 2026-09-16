# One look, and edits nobody asked for

**2026-09-16.** Two complaints about the shipped skill, both real, both mechanical:
every surface came out looking the same, and a pass to fix one thing repainted things
that were fine. Neither was the model's taste. Both were in the tooling, and this note
says where.

## The one look was the catalog

`corpus/templates.json` had 130 rows. 111 were `shadcn-zinc`; 71 of those were chart
component blocks. Untitled UI — documented as the "buildable sibling" — had three rows.
Marketing had two: one Magic UI hero component and a shadcn region map. The shortlist
rule "one slot per visual family" cannot produce variety when, for most briefs, exactly
one family is eligible. `retrieveDirections` reported that faithfully as a `diversity:`
gap on nearly every query, and the gap was ignored because there was nothing to do
about it.

What changed:

| Source | Before | After | How rows are derived |
| --- | --- | --- | --- |
| Untitled UI React | 3 | 16 | `UNTITLED_DEMOS` in `index-templates.mjs` classifies every `application/*.demo.tsx` the shipped examples catalog knows; an unclassified application demo is reported |
| Magic UI | 1 | 45 | `MAGICUI_FAMILIES` classifies the 168 registry examples into six marketing screens; the decorative rest (patterns, text effects, buttons, confetti) is declared, not indexed |
| cult-ui | 0 | 11 | declared singles: five hero treatments, logo and feature carousels, metric counter, onboarding, intro disclosure, 3D carousel |
| Total | 130 rows / 10 families | 197 rows / 11 families | `--check` still proves the committed file is what the generator makes |

Both new kits install through the shadcn registry on Tailwind, so unlike Mantine and
HeroUI (retired 2026-08-31, `docs/no-foreign-runtimes.md`) they can be built in the
consumers. They join the shadcn and Tailwind recipes in `integrations/resolve.mjs`
after the two house kits, so they win only screens shadcn does not publish.

Six marketing screens replace the single `marketing` bucket: features, proof, metrics,
mockup, developer, integrations. Each has its own direction profile in
`art-direction.json`, so two rows on different marketing regions are not near-duplicates
of each other, and a landing-page brief can hold three distinct families in its shortlist.
The first regenerate also exposed that the cult-ui profile had been copied from Magic UI:
identical axes made every cult row a near-duplicate of the Magic UI row for the same
screen, and the second family never surfaced. The profile now differs on density, tone
and type.

### Licensed kits

Tailwind Plus is the catalog with fifteen genuinely different site silhouettes, and its
license forbids redistribution. Shine is a public repository with a public site and a
`git archive` package, so its rows and files can never be committed. `corpus/owned/`
documents the lane: a manifest under `~/design-corpus/owned/<kit>/` indexes into a
gitignored `corpus/templates.owned.json`, and `corpus/catalog.mjs` — now the only
catalog reader — merges it for `cite`, the packet, `measure`, `compare`, `usability` and
`coverage`. A machine without the kit passes `--check`; a machine with it gets the rows.

## The unrequested edits were two gates

**The diagnosis quota.** `validateDiagnosis` required 3–8 defects and at least one
critical or major on every existing-surface pass. A sound surface could not pass. The
agent did what the contract forced: invented findings and inflated severities, then fixed
them. Now 1–8 real defects validate, no severity is mandatory, and `verdict: no-change`
is a legal result when it names what was exercised (`verdictEvidence`) and confirms every
bucket was checked. `prove.mjs` treats a no-change verdict as binding nothing; the other
categories still have to pass. The seed file carries one blank defect and says so.

**Whole-file lint.** `design-lint` blocked on every off-token value in any file the turn
touched. Editing one line of a stylesheet with twenty legacy values meant repainting all
twenty or the turn could not end. Now `changedLines()` reads `git diff -U0 HEAD` for the
file and blocking is scoped to touched lines; untouched violations arrive as one soft
note. Untracked files, repos with no commit and paths outside any repo still lint whole
— every line there is new. `--all-lines` and `SHINE_LINT_SCOPE=file` restore whole-file
blocking; the doctor uses it for its committed fixture so that check cannot pass
vacuously. `verify/design-lint-scope.test.mjs` locks each case.

**Audit had no mode.** The packet knew `existing` and `new`. A review request ran as
`existing`, whose contract is "fix every defect you named". `--mode audit` requires the
diagnosis, keeps measure and usability, drops compare and completion, and sets
`editing.allowed: false`. The skill text says so in one paragraph.

## The second pass: proving the rows

The first PR added 67 rows and none of them had a validated capture. The census said
why that was not new: only 8 of 130 rows were `passed`; 114 were legacy captures with no
HTTP or content evidence and 74 had no screenshot. `prove.mjs` requires
`referenceValidity` to pass, so completion had only ever been reachable for eight
references — and the shadcn harvest target expected `body`, a selector `captureHealth`
rejects, so the legacy packs could never refresh.

`harvest.mjs` now maps Untitled UI, Magic UI and cult-ui rows from their `preview`
pages (each Untitled row names the public component page that renders its examples),
names the rendered control for every shadcn block, paces requests and retries transport
failures, and points the Lightning and Spectrum targets at pages that still exist. After
the harvest and materialize passes, 190 of 197 rows are `passed`; the seven that are not
are query-only screenshots and three region-map blueprints with no renderable source. The
packet now says up front when a selected reference is unvalidated, with the harvest
command and any validated alternative.

Two things surfaced along the way. A test asserted that `spectrum-ai-chat` was a failed
404 capture and broke the moment it was recaptured; it builds its own broken fixture now.
And the library build's Tailwind scan was reading the whole repository, so the new pack
sources grew the published stylesheet by 44 KB of utilities nothing uses; `source(none)`
limits it to the declared paths and the stylesheet shrinks by a third.

CI for the two personal-account repositories was also silently off: Actions were disabled
on both, there was no runner registered for either, and the doctor had not run since
2026-08-30. Runners `justin-macbook-shine` and `justin-macbook-portfolio` are registered
from the same package as the Nucleus runner, Actions are enabled, the portfolio guard
targets its runner, and the doctor ran both lanes on main under Node 22.

## The third pass: application surfaces

Marketing and onboarding had three families after the first two passes; every
application surface still had one page-scope family, shadcn. The lever was not another
component library but composed pages on plain Tailwind: TailAdmin, Windmill and Flowbite
admin publish whole dashboards, tables, forms, auth pages, settings and profiles under
MIT, each with a distinct look, and their structure ports into a Tailwind or shadcn host
without a runtime. Eighteen page rows, harvested from the live demos, give the dashboard,
queue, auth, settings, form and record shortlists three families each. The house kit's
page keeps a reserved slot so a shadcn host is always offered the shadcn composition
beside the alternatives.

The three region-map blueprints that had no pixels now render at rest in
`reference.html` and carry validated captures. 211 of 215 references are `passed`. The
remaining four are query-only screenshots of paid stores, which carry no source and are
excluded from source-mode retrieval by design.

## What did not change

Mantine, HeroUI, Spectrum and Fluent stay at one retired or single row each. They carry
their own runtimes; adding rows would recreate the costume problem the August deletion
closed. Variety has to come from kits the consumers can actually build.
