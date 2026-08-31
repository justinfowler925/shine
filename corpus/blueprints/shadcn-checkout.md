# shadcn checkout

Regions, in order. Host: focused page, no app sidebar. Density: comfortable. Paint: `tokens/voices/shadcn-zinc.css`.

shadcn ships no checkout block. `mui-checkout` is the corpus's only checkout row and its region graph is sound — a stepper beside a persistent order summary. Port that structure; do not copy MUI source, which carries Emotion and its own theming. This file exists so the port has a shadcn-shaped target rather than an Ant or MUI-shaped one.

Region map only: no authored source ships for this row. The estate does not build a checkout, so authored TSX here would be untested reference code. The MUI shot is the pixel reference for structure; the paint comes from the shadcn voice sheet.

1. **Order summary** — persistent, never behind a disclosure, and never re-collapsed after step one. On wide hosts it is a right rail that stays visible through every step; on narrow hosts it is a sticky collapsed bar showing the total, expandable in place. The reader is being asked for money and must be able to see what for at the moment they commit.
2. **Step indicator** — same contract as `shadcn-wizard`: every step visible, state in shape and text, completed steps are links back. Address → Delivery → Payment → Review is the conventional order and deviating from it costs the reader more than it saves.
3. **Step body** — the fields for this step only. Autofill attributes are not optional here: `autocomplete="postal-code"`, `"cc-number"`, `"tel"` and the rest. A checkout that defeats autofill is the single most expensive craft defect on this screen.
4. **Cost breakdown** — subtotal, shipping, tax, and total, with the total in the largest step on the page and `tabular-nums` throughout so the column aligns. Every line the reader did not choose (tax, fees) carries a one-line explanation. A total that appears only at the final step is a surprise, and surprises at payment are abandonments.
5. **Review before commit** — every entered value restated with a link back to the step that set it, and the commit button named for what it does (`Pay $209.00`), carrying the amount. `Place order` without the amount makes the reader scroll back to check.
6. **Post-commit receipt** — an order reference, what happens next, and when. This is a region, not a toast.

## Host facts the region map cannot show

- Never block `Continue` on an async address validation with no visible pending state; the reader will click twice and you will take two orders. Disable on submit and say why.
- Card fields are three separate inputs with one error region between them; a single combined field cannot report which part is wrong.
- Currency formatting is locale-dependent and the total must agree with the server to the cent. Format for display, compare in minor units.
- `role="status"` for the pending state and `role="alert"` for a declined payment — a decline the reader does not hear is a decline they retry.

## Do not

- Copy MUI source. Port the regions; the runtime and theming do not come with them.
- Hide the order summary behind a disclosure at any breakpoint.
- Introduce shipping cost or tax for the first time on the final step.
- `Place order` with no amount.
- Require an account before purchase.
- Autofill-hostile field names.

## Checklist (agent)

- The order total is visible at every step, at every breakpoint.
- Every money field is `tabular-nums` and every unchosen line item is explained.
- Autofill attributes are present on every address and payment field.
- The commit button carries the amount.
- Pending and declined states are announced, and double-submit is impossible.
- `data-cite="shadcn-checkout"` on the artifact.
- Prove with `verify/measure.mjs`, then `verify/usability.mjs` with a contract that advances to review and back, then `verify/compare.mjs`.

## Source of truth

- The regions above are the structure. They are not optional.
- `mui-checkout`'s shot is the structural pixel reference; its source is not to be copied.
- Paint comes from `tokens/voices/shadcn-zinc.css`.
- No authored source and no pack shot ship for this row, so `verify/compare.mjs` has nothing to compare against. Say so rather than reporting a likeness score.
- Payment-field composition is a compliance surface as well as a design one; do not invent field sets.
