# Templates — start from a real page

Run `node corpus/cite.mjs <job>` — it resolves synonyms, extracts readable
source, and points at the pack screenshot when one is harvested. No row for
your screen → start from the nearest row plus `references/patterns.md`; add a
row here (via `corpus/index-templates.mjs`) only after the screen shipped and
earned it.

Generated from `corpus/templates.json` — do not hand-edit; run `node corpus/index-templates.mjs`.

| Screen | Id | Kit | Kind | Jobs |
|---|---|---|---|---|
| ai-generate | `shadcn-input-group-textarea` | shadcn-registry | source | ai-generate, prompt, composer |
| ai-generate | `shadcn-field-choice-card` | shadcn-registry | source | ai-generate, prompt, composer |
| app-shell | `shadcn-sidebar-07` | shadcn-registry | source | app-shell, shell, nav, sidebar |
| app-shell | `mantine-appshell` | mantine | source | app-shell, shell, nav, sidebar |
| app-shell | `heroui-next-app` | heroui | source | app-shell, shell, nav, sidebar |
| app-shell | `query-adminlte` | adminlte | query-only | app-shell, shell, nav, sidebar |
| app-shell | `query-primeblocks` | primeblocks | query-only | app-shell, shell, nav, sidebar |
| auth | `shadcn-login-04` | shadcn-registry | source | auth, login, signin, signup |
| charts | `tremor-charts` | tremor | source | charts, chart, dataviz |
| chat | `spectrum-ai-chat` | react-spectrum | source | chat, assistant |
| command-palette | `shadcn-command` | shadcn-registry | source | command-palette, palette, cmdk |
| dashboard | `shadcn-dashboard-01` | shadcn-registry | source | dashboard |
| dashboard | `query-shadcn-blocks` | shadcn-registry | query-only | dashboard |
| dashboard | `query-haze` | haze | query-only | dashboard |
| empty | `shadcn-empty-icon` | shadcn-registry | source | empty, ai-generate |
| lex-console | `lex-console` | slds | blueprint | lex-console |
| lex-email | `lex-email` | slds | blueprint | lex-email, email |
| lex-lwr | `lex-lwr` | slds | blueprint | lex-lwr |
| lex-mobile | `lex-mobile` | slds | blueprint | lex-mobile |
| lex-queue | `lex-queue` | slds | blueprint | lex-queue, queue |
| lex-record | `lex-record` | slds | blueprint | lex-record, record, detail, lightning, lwc |
| lex-record | `lex-record-narrow` | slds | blueprint | lex-record-narrow, lex-record |
| marketing-hero | `magicui-hero` | magicui | source | marketing-hero, hero, landing |
| settings | `fluent-nav` | fluentui | source | settings |

24 rows. Required screen coverage: dashboard, auth, app-shell, chat, settings, empty, command-palette, lex-record.

