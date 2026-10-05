# shadcn form-app

Regions, in order. Host: application shell or a focused content column. Density: comfortable. Paint: `tokens/voices/shadcn-zinc.css`. Authored source: `corpus/blueprints/shadcn-form/page.tsx`.

shadcn ships no composed form block. Kit form-element galleries (`tailadmin-form-elements`, `windmill-forms`) show controls; this row is the Operate **form-app** — one entity create/edit with a single primary submit. A wizard is the wrong cite when every field can validate together; use `shadcn-wizard` only when steps each end in a commit decision.

1. **Page title + purpose** — an `h1` naming the entity action (`Create opportunity`) and one sentence saying what submitting does. "Form" is not a title.
2. **Grouped field sections** — two or three `h2` sections (`Basics`, `Owner & timing`, `Notes`), each a `divide-y` list of label / control / helper rows. Same field-row idiom as `shadcn-settings`. No card-per-field.
3. **Validation summary** — on a failed submit, an `Alert` above the first section listing each blocked field as a link to it. Per-field errors stay at the fields too.
4. **Primary submit + cancel** — one filled submit naming the action (`Create opportunity`), one outline cancel. Submit is enabled at rest; it validates on click. A disabled submit with no reason leaves the reader stuck.
5. **Status region** — `role="status"` mounted at rest with resting copy, updated after a successful save.

## Host facts the region map cannot show

- Validate on submit, not on every blur while the reader is still filling.
- Cancel must leave the page or reset to loaded values; a Cancel that only clears the status line is a lie.
- Required markers are text (`Required`) or `aria-required`, never colour alone.
- `data-cite="shadcn-form"` on the artifact.

## Do not

- Cite a chart atom or settings page for a form-app brief.
- A multi-step wizard when the form fits one screen.
- One global settings-style section nav for a create form — that is settings findability, not form-app commit.
- Card-per-field layout.

## Checklist (agent)

- Title names the entity action; purpose says what submit does.
- Fields are grouped; every label is the reader's word.
- Failed submit shows a summary with links plus per-field errors.
- Submit names the action; status region exists at rest.
- Prove with `verify/measure.mjs`, then `verify/usability.mjs` with a contract that fills required fields and submits.

## Source of truth

- The regions above are the structure.
- `corpus/blueprints/shadcn-form/page.tsx` is authored shadcn source — copy it, do not port it.
- Paint comes from `tokens/voices/shadcn-zinc.css`.
