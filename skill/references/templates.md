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
| app-shell | `untitled-sidebar-navigation` | untitled-ui-react | source | app-shell, navigation, sidebar |
| app-shell | `mui-dashboard` | mui-material | source | app-shell, shell, nav, sidebar |
| app-shell | `antd-pro-app` | ant-design-pro | source | app-shell, shell, nav, sidebar |
| app-shell | `carbon-uishell` | carbon | source | app-shell, shell, nav, sidebar |
| app-shell | `mantine-appshell` | mantine | source | app-shell, shell, nav, sidebar |
| app-shell | `heroui-next-app` | heroui | source | app-shell, shell, nav, sidebar |
| app-shell | `query-mui-store` | mui-store | query-only | app-shell, shell, nav, sidebar |
| app-shell | `query-adminlte` | adminlte | query-only | app-shell, shell, nav, sidebar |
| app-shell | `query-primeblocks` | primeblocks | query-only | app-shell, shell, nav, sidebar |
| auth | `mui-sign-in-side` | mui-material | source | auth, login, signin, signup |
| auth | `shadcn-login-04` | shadcn-registry | source | auth, login, signin, signup |
| blog | `mui-blog` | mui-material | source | blog, article |
| charts | `tremor-charts` | tremor | source | charts, chart, dataviz |
| chat | `spectrum-ai-chat` | react-spectrum | source | chat, assistant |
| chat | `antd-pro-chatbot` | ant-design-pro | source | chat |
| checkout | `mui-checkout` | mui-material | source | checkout |
| command-palette | `shadcn-command` | shadcn-registry | source | command-palette, palette, cmdk |
| crud | `mui-crud-dashboard` | mui-material | source | crud, admin |
| crud | `antd-pro-crud` | ant-design-pro | source | crud, admin |
| dashboard | `shadcn-dashboard-01` | shadcn-registry | source | dashboard |
| dashboard | `untitled-line-charts` | untitled-ui-react | source | dashboard, analytics, charts, dataviz |
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
| marketing | `mui-marketing-page` | mui-material | source | marketing, marketing-hero |
| marketing | `query-mui-free-gallery` | mui-material | query-only | marketing, marketing-hero |
| marketing-hero | `magicui-hero` | magicui | source | marketing-hero, hero, landing |
| queue | `carbon-datatable` | carbon | source | queue, list, inbox |
| queue | `untitled-table` | untitled-ui-react | source | queue, crud, table, records, datagrid |
| queue | `antd-pro-list` | ant-design-pro | source | queue, list, inbox |
| record | `antd-pro-profile` | ant-design-pro | source | record, detail, profile |
| settings | `antd-pro-settings` | ant-design-pro | source | settings, preferences, account |
| settings | `fluent-nav` | fluentui | source | settings |
| wizard | `antd-pro-step-form` | ant-design-pro | source | wizard, steps, onboarding |

44 rows. Required screen coverage: dashboard, marketing, auth, checkout, app-shell, crud, queue, record, chat, settings, wizard, empty, command-palette, lex-record.

