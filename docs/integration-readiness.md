# Source selection, readiness and browser evidence

The library selector preserves product owners first, then finished Shine blocks, then upstream source. It now exposes public Untitled examples with exact export/source paths and a plan command. `installable` means source or registry access exists; `available` requires the source-level checks. Neither field certifies rendered behavior.

`node integrations/untitled.mjs --project <consumer> --example <id>` inspects the complete public source closure, installed dependencies, named exports and required theme/alias/prefix adaptation. A consumer already using React Aria and Tailwind resolves through the `untitled` recipe. This does not add React Aria to shadcn products automatically.

Block readiness checks actual component resolution, named exports, dependencies, semantic tokens and Tailwind-prefix adaptation. After adaptation, run `integrations/compatibility.mjs` for the consumer TypeScript API and existing browser gates. A matching product export still requires inspection of its actual API and user-job fit.

Run `npm run untitled:browser -- --out <private-directory>` on the corpus host after installing the public source's runtime dependencies. It renders all indexed exports at 390/1440px, supplies the real context for helper exports, records overflow separately, and exercises six representative interaction contracts. `--interactions` runs just those contracts. Each receipt binds the complete components/hooks/styles/utils source fingerprint plus the demo hash. It does not certify every state of every component; untested interaction entries stay `not_tested`.

Set `SHINE_UNTITLED_PROOF` to the generated receipt to expose source-bound evidence in selection. Changed source or duplicate/missing results lose verified status; a failed example is not offered as installable until its failure is resolved. Receipts stay private and are not part of the public catalog.

Private Clearspeed editions retain the name Shine. `verify/edition.mjs` checks the base release, profile hash, generated loader, inherited references and runtime links. The doctor checks all three agent registrations. Distribution preserves a validated edition and refuses to overwrite a stale one: release the base, rebuild the private edition with its canonical installer, then distribute. Private profile source never enters the public bundle.
