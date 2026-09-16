# Templates — start from a real page

Run `node corpus/cite.mjs <job>` — it resolves synonyms, extracts readable
source, and points at the pack screenshot when one is harvested. No row for
your screen → start from the nearest row plus `references/patterns.md`; add a
row here (via `corpus/index-templates.mjs`) only after the screen shipped and
earned it.

Generated from `corpus/templates.json` — do not hand-edit; run `node corpus/index-templates.mjs`.

A row marked **retired** is not selectable: `cite.mjs` and the packet skip it,
its pack survives only as a regression fixture, and citing it by id is a defect.
Reasons are listed under the table.

| Screen | Id | Kit | Kind | Status | Jobs |
|---|---|---|---|---|---|
| ai-generate | `shadcn-input-group-textarea` | shadcn-registry | source | live | ai-generate, prompt, composer |
| ai-generate | `shadcn-field-choice-card` | shadcn-registry | source | live | ai-generate, prompt, composer |
| app-shell | `shadcn-sidebar-01` | shadcn-registry | source | live | app-shell, shell, nav, sidebar |
| app-shell | `shadcn-sidebar-02` | shadcn-registry | source | live | app-shell, shell, nav, sidebar |
| app-shell | `shadcn-sidebar-03` | shadcn-registry | source | live | app-shell, shell, nav, sidebar |
| app-shell | `shadcn-sidebar-04` | shadcn-registry | source | live | app-shell, shell, nav, sidebar |
| app-shell | `shadcn-sidebar-05` | shadcn-registry | source | live | app-shell, shell, nav, sidebar |
| app-shell | `shadcn-sidebar-06` | shadcn-registry | source | live | app-shell, shell, nav, sidebar |
| app-shell | `shadcn-sidebar-07` | shadcn-registry | source | live | app-shell, shell, nav, sidebar |
| app-shell | `shadcn-sidebar-08` | shadcn-registry | source | live | app-shell, shell, nav, sidebar |
| app-shell | `shadcn-sidebar-09` | shadcn-registry | source | live | app-shell, shell, nav, sidebar |
| app-shell | `shadcn-sidebar-10` | shadcn-registry | source | live | app-shell, shell, nav, sidebar |
| app-shell | `shadcn-sidebar-11` | shadcn-registry | source | live | app-shell, shell, nav, sidebar |
| app-shell | `shadcn-sidebar-12` | shadcn-registry | source | live | app-shell, shell, nav, sidebar |
| app-shell | `shadcn-sidebar-13` | shadcn-registry | source | live | app-shell, shell, nav, sidebar |
| app-shell | `shadcn-sidebar-14` | shadcn-registry | source | live | app-shell, shell, nav, sidebar |
| app-shell | `shadcn-sidebar-15` | shadcn-registry | source | live | app-shell, shell, nav, sidebar |
| app-shell | `shadcn-sidebar-16` | shadcn-registry | source | live | app-shell, shell, nav, sidebar |
| app-shell | `untitled-sidebar-navigation` | untitled-ui-react | source | live | app-shell, navigation, sidebar |
| app-shell | `untitled-header-navigation` | untitled-ui-react | source | live | app-shell, navigation, header, topbar, horizontal-nav |
| app-shell | `untitled-featured-cards` | untitled-ui-react | source | live | app-shell, navigation, featured, usage, upgrade-prompt |
| app-shell | `mantine-appshell` | mantine | source | **retired** | app-shell, shell, nav, sidebar |
| app-shell | `heroui-next-app` | heroui | source | **retired** | app-shell, shell, nav, sidebar |
| app-shell | `query-adminlte` | adminlte | query-only | live | app-shell, shell, nav, sidebar |
| app-shell | `query-primeblocks` | primeblocks | query-only | live | app-shell, shell, nav, sidebar |
| async-state | `untitled-loading-indicator` | untitled-ui-react | source | live | loading, spinner, pending, async, skeleton |
| auth | `shadcn-login-01` | shadcn-registry | source | live | auth, login, signin, signup, sign-in |
| auth | `shadcn-login-02` | shadcn-registry | source | live | auth, login, signin, signup, sign-in |
| auth | `shadcn-login-03` | shadcn-registry | source | live | auth, login, signin, signup, sign-in |
| auth | `shadcn-login-05` | shadcn-registry | source | live | auth, login, signin, signup, sign-in |
| auth | `shadcn-signup-01` | shadcn-registry | source | live | auth, login, signin, signup, sign-up |
| auth | `shadcn-signup-02` | shadcn-registry | source | live | auth, login, signin, signup, sign-up |
| auth | `shadcn-signup-03` | shadcn-registry | source | live | auth, login, signin, signup, sign-up |
| auth | `shadcn-signup-04` | shadcn-registry | source | live | auth, login, signin, signup, sign-up |
| auth | `shadcn-signup-05` | shadcn-registry | source | live | auth, login, signin, signup, sign-up |
| auth | `shadcn-login-04` | shadcn-registry | source | live | auth, login, signin, signup |
| auth | `tailadmin-signin` | tailadmin-react | source | live | auth, login, signin, sign-in |
| auth | `windmill-login` | windmill-react | source | live | auth, login, signin, sign-in |
| auth | `windmill-create-account` | windmill-react | source | live | auth, signup, sign-up, register |
| auth | `flowbite-sign-in` | flowbite-admin | source | live | auth, login, signin, sign-in |
| blog | `shadcn-blog` | shadcn-registry | blueprint | live | blog, article, editorial, post |
| broadcast | `shadcn-broadcast` | shadcn-registry | blueprint | live | broadcast, video, media, player, television, presenter |
| calendar | `tailadmin-calendar` | tailadmin-react | source | live | calendar, schedule, events, agenda, month-view |
| carousel | `untitled-carousel` | untitled-ui-react | source | live | carousel, gallery, slides, slideshow |
| carousel | `cult-three-d-carousel` | cult-ui | source | live | carousel, gallery, slides, media, 3d |
| charts | `shadcn-chart-area-axes` | shadcn-registry | source | live | charts, chart, area, analytics |
| charts | `shadcn-chart-area-default` | shadcn-registry | source | live | charts, chart, area, analytics |
| charts | `shadcn-chart-area-gradient` | shadcn-registry | source | live | charts, chart, area, analytics |
| charts | `shadcn-chart-area-icons` | shadcn-registry | source | live | charts, chart, area, analytics |
| charts | `shadcn-chart-area-interactive` | shadcn-registry | source | live | charts, chart, area, dataviz, trend, timeseries |
| charts | `shadcn-chart-area-legend` | shadcn-registry | source | live | charts, chart, area, analytics |
| charts | `shadcn-chart-area-linear` | shadcn-registry | source | live | charts, chart, area, analytics |
| charts | `shadcn-chart-area-stacked` | shadcn-registry | source | live | charts, chart, area, analytics |
| charts | `shadcn-chart-area-stacked-expand` | shadcn-registry | source | live | charts, chart, area, analytics |
| charts | `shadcn-chart-area-step` | shadcn-registry | source | live | charts, chart, area, analytics |
| charts | `shadcn-chart-bar-active` | shadcn-registry | source | live | charts, chart, bar, analytics |
| charts | `shadcn-chart-bar-default` | shadcn-registry | source | live | charts, chart, bar, analytics |
| charts | `shadcn-chart-bar-horizontal` | shadcn-registry | source | live | charts, chart, bar, analytics |
| charts | `shadcn-chart-bar-interactive` | shadcn-registry | source | live | charts, chart, bar, analytics |
| charts | `shadcn-chart-bar-label` | shadcn-registry | source | live | charts, chart, bar, analytics |
| charts | `shadcn-chart-bar-label-custom` | shadcn-registry | source | live | charts, chart, bar, analytics |
| charts | `shadcn-chart-bar-mixed` | shadcn-registry | source | live | charts, chart, bar, analytics |
| charts | `shadcn-chart-bar-multiple` | shadcn-registry | source | live | charts, chart, bar, analytics |
| charts | `shadcn-chart-bar-negative` | shadcn-registry | source | live | charts, chart, bar, analytics |
| charts | `shadcn-chart-bar-stacked` | shadcn-registry | source | live | charts, chart, bar, analytics |
| charts | `shadcn-chart-line-default` | shadcn-registry | source | live | charts, chart, line, analytics |
| charts | `shadcn-chart-line-dots` | shadcn-registry | source | live | charts, chart, line, analytics |
| charts | `shadcn-chart-line-dots-colors` | shadcn-registry | source | live | charts, chart, line, analytics |
| charts | `shadcn-chart-line-dots-custom` | shadcn-registry | source | live | charts, chart, line, analytics |
| charts | `shadcn-chart-line-interactive` | shadcn-registry | source | live | charts, chart, line, analytics |
| charts | `shadcn-chart-line-label` | shadcn-registry | source | live | charts, chart, line, analytics |
| charts | `shadcn-chart-line-label-custom` | shadcn-registry | source | live | charts, chart, line, analytics |
| charts | `shadcn-chart-line-linear` | shadcn-registry | source | live | charts, chart, line, analytics |
| charts | `shadcn-chart-line-multiple` | shadcn-registry | source | live | charts, chart, line, analytics |
| charts | `shadcn-chart-line-step` | shadcn-registry | source | live | charts, chart, line, analytics |
| charts | `shadcn-chart-pie-donut` | shadcn-registry | source | live | charts, chart, pie, analytics |
| charts | `shadcn-chart-pie-donut-active` | shadcn-registry | source | live | charts, chart, pie, analytics |
| charts | `shadcn-chart-pie-donut-text` | shadcn-registry | source | live | charts, chart, pie, analytics |
| charts | `shadcn-chart-pie-interactive` | shadcn-registry | source | live | charts, chart, pie, analytics |
| charts | `shadcn-chart-pie-label` | shadcn-registry | source | live | charts, chart, pie, analytics |
| charts | `shadcn-chart-pie-label-custom` | shadcn-registry | source | live | charts, chart, pie, analytics |
| charts | `shadcn-chart-pie-label-list` | shadcn-registry | source | live | charts, chart, pie, analytics |
| charts | `shadcn-chart-pie-legend` | shadcn-registry | source | live | charts, chart, pie, analytics |
| charts | `shadcn-chart-pie-separator-none` | shadcn-registry | source | live | charts, chart, pie, analytics |
| charts | `shadcn-chart-pie-simple` | shadcn-registry | source | live | charts, chart, pie, analytics |
| charts | `shadcn-chart-pie-stacked` | shadcn-registry | source | live | charts, chart, pie, analytics |
| charts | `shadcn-chart-radar-default` | shadcn-registry | source | live | charts, chart, radar, analytics |
| charts | `shadcn-chart-radar-dots` | shadcn-registry | source | live | charts, chart, radar, analytics |
| charts | `shadcn-chart-radar-grid-circle` | shadcn-registry | source | live | charts, chart, radar, analytics |
| charts | `shadcn-chart-radar-grid-circle-fill` | shadcn-registry | source | live | charts, chart, radar, analytics |
| charts | `shadcn-chart-radar-grid-circle-no-lines` | shadcn-registry | source | live | charts, chart, radar, analytics |
| charts | `shadcn-chart-radar-grid-custom` | shadcn-registry | source | live | charts, chart, radar, analytics |
| charts | `shadcn-chart-radar-grid-fill` | shadcn-registry | source | live | charts, chart, radar, analytics |
| charts | `shadcn-chart-radar-grid-none` | shadcn-registry | source | live | charts, chart, radar, analytics |
| charts | `shadcn-chart-radar-icons` | shadcn-registry | source | live | charts, chart, radar, analytics |
| charts | `shadcn-chart-radar-label-custom` | shadcn-registry | source | live | charts, chart, radar, analytics |
| charts | `shadcn-chart-radar-legend` | shadcn-registry | source | live | charts, chart, radar, analytics |
| charts | `shadcn-chart-radar-lines-only` | shadcn-registry | source | live | charts, chart, radar, analytics |
| charts | `shadcn-chart-radar-multiple` | shadcn-registry | source | live | charts, chart, radar, analytics |
| charts | `shadcn-chart-radar-radius` | shadcn-registry | source | live | charts, chart, radar, analytics |
| charts | `shadcn-chart-radial-grid` | shadcn-registry | source | live | charts, chart, radial, analytics |
| charts | `shadcn-chart-radial-label` | shadcn-registry | source | live | charts, chart, radial, analytics |
| charts | `shadcn-chart-radial-shape` | shadcn-registry | source | live | charts, chart, radial, analytics |
| charts | `shadcn-chart-radial-simple` | shadcn-registry | source | live | charts, chart, radial, analytics |
| charts | `shadcn-chart-radial-stacked` | shadcn-registry | source | live | charts, chart, radial, analytics |
| charts | `shadcn-chart-radial-text` | shadcn-registry | source | live | charts, chart, radial, analytics |
| charts | `shadcn-chart-tooltip-advanced` | shadcn-registry | source | live | charts, chart, tooltip, analytics |
| charts | `shadcn-chart-tooltip-default` | shadcn-registry | source | live | charts, chart, tooltip, analytics |
| charts | `shadcn-chart-tooltip-formatter` | shadcn-registry | source | live | charts, chart, tooltip, analytics |
| charts | `shadcn-chart-tooltip-icons` | shadcn-registry | source | live | charts, chart, tooltip, analytics |
| charts | `shadcn-chart-tooltip-indicator-line` | shadcn-registry | source | live | charts, chart, tooltip, analytics |
| charts | `shadcn-chart-tooltip-indicator-none` | shadcn-registry | source | live | charts, chart, tooltip, analytics |
| charts | `shadcn-chart-tooltip-label-custom` | shadcn-registry | source | live | charts, chart, tooltip, analytics |
| charts | `shadcn-chart-tooltip-label-formatter` | shadcn-registry | source | live | charts, chart, tooltip, analytics |
| charts | `shadcn-chart-tooltip-label-none` | shadcn-registry | source | live | charts, chart, tooltip, analytics |
| charts | `tremor-charts` | tremor | source | **retired** | charts, chart, dataviz |
| charts | `untitled-activity-gauges` | untitled-ui-react | source | live | charts, chart, gauge, kpi, target, dataviz |
| charts | `untitled-bar-charts` | untitled-ui-react | source | live | charts, chart, bar, comparison, analytics, dataviz |
| charts | `untitled-pie-charts` | untitled-ui-react | source | live | charts, chart, pie, donut, share, breakdown, dataviz |
| charts | `untitled-progress-circles` | untitled-ui-react | source | live | charts, chart, progress, completion, kpi, dataviz |
| charts | `untitled-radar-charts` | untitled-ui-react | source | live | charts, chart, radar, profile, comparison, dataviz |
| charts | `windmill-charts` | windmill-react | source | live | charts, chart, analytics, dataviz |
| chat | `spectrum-ai-chat` | react-spectrum | source | live | chat, assistant |
| checkout | `shadcn-checkout` | shadcn-registry | blueprint | live | checkout, payment |
| command-palette | `shadcn-command` | shadcn-registry | source | live | command-palette, palette, cmdk |
| dashboard | `shadcn-dashboard-01` | shadcn-registry | source | live | crud, dashboard, list, records |
| dashboard | `untitled-line-charts` | untitled-ui-react | source | live | dashboard, analytics, charts, dataviz |
| dashboard | `tailadmin-dashboard` | tailadmin-react | source | live | dashboard, analytics, kpi, ecommerce, metrics |
| dashboard | `windmill-dashboard` | windmill-react | source | live | dashboard, analytics, kpi, metrics |
| dashboard | `flowbite-dashboard` | flowbite-admin | source | live | dashboard, analytics, kpi, metrics, sales |
| dashboard | `query-shadcn-blocks` | shadcn-registry | query-only | live | dashboard |
| dashboard | `query-haze` | haze | query-only | live | dashboard |
| empty | `shadcn-empty-icon` | shadcn-registry | source | live | empty, ai-generate |
| form | `untitled-date-picker` | untitled-ui-react | source | live | form, input, date, date-range, calendar, picker |
| form | `tailadmin-form-elements` | tailadmin-react | source | live | form, input, fields, controls |
| form | `untitled-file-upload` | untitled-ui-react | source | live | form, input, upload, attachments, dropzone, files |
| form | `windmill-forms` | windmill-react | source | live | form, input, fields, validation |
| lex-console | `lex-console` | slds | blueprint | live | lex-console |
| lex-email | `lex-email` | slds | blueprint | live | lex-email, email |
| lex-lwr | `lex-lwr` | slds | blueprint | live | lex-lwr |
| lex-mobile | `lex-mobile` | slds | blueprint | live | lex-mobile |
| lex-queue | `lex-queue` | slds | blueprint | live | lex-queue, queue |
| lex-record | `lex-record` | slds | blueprint | live | lex-record, record, detail, lightning, lwc |
| lex-record | `lex-record-narrow` | slds | blueprint | live | lex-record-narrow, lex-record |
| marketing | `shadcn-marketing` | shadcn-registry | blueprint | live | marketing, landing, pricing |
| marketing-developer | `magicui-code-comparison-demo` | magicui | source | live | marketing, developer, docs, code, terminal, landing, api |
| marketing-developer | `magicui-file-tree-demo` | magicui | source | live | marketing, developer, docs, code, terminal, landing, api |
| marketing-developer | `magicui-terminal-demo` | magicui | source | live | marketing, developer, docs, code, terminal, landing, api |
| marketing-developer | `magicui-terminal-demo-2` | magicui | source | live | marketing, developer, docs, code, terminal, landing, api |
| marketing-features | `magicui-bento-demo` | magicui | source | live | marketing, features, feature-grid, capabilities, landing, benefits |
| marketing-features | `magicui-bento-demo-vertical` | magicui | source | live | marketing, features, feature-grid, capabilities, landing, benefits |
| marketing-features | `cult-feature-carousel` | cult-ui | source | live | marketing, features, carousel, capabilities, walkthrough, landing |
| marketing-hero | `magicui-hero` | magicui | source | live | marketing-hero, hero, landing |
| marketing-hero | `magicui-hero-video-dialog-demo` | magicui | source | live | marketing-hero, hero, landing, video, launch |
| marketing-hero | `magicui-hero-video-dialog-demo-top-in-bottom-out` | magicui | source | live | marketing-hero, hero, landing, video, launch |
| marketing-hero | `cult-hero-color-panel` | cult-ui | source | live | marketing-hero, hero, landing, split, panel |
| marketing-hero | `cult-hero-dithering` | cult-ui | source | live | marketing-hero, hero, landing, texture, editorial |
| marketing-hero | `cult-hero-heatmap` | cult-ui | source | live | marketing-hero, hero, landing, data, heatmap |
| marketing-hero | `cult-hero-liquid-metal` | cult-ui | source | live | marketing-hero, hero, landing, shader, premium |
| marketing-hero | `cult-hero-static-radial-gradient` | cult-ui | source | live | marketing-hero, hero, landing, radial, minimal |
| marketing-integrations | `magicui-animated-beam-bidirectional` | magicui | source | live | marketing, integrations, ecosystem, network, global, landing, connectors |
| marketing-integrations | `magicui-animated-beam-demo` | magicui | source | live | marketing, integrations, ecosystem, network, global, landing, connectors |
| marketing-integrations | `magicui-animated-beam-multiple-inputs` | magicui | source | live | marketing, integrations, ecosystem, network, global, landing, connectors |
| marketing-integrations | `magicui-animated-beam-multiple-outputs` | magicui | source | live | marketing, integrations, ecosystem, network, global, landing, connectors |
| marketing-integrations | `magicui-animated-beam-unidirectional` | magicui | source | live | marketing, integrations, ecosystem, network, global, landing, connectors |
| marketing-integrations | `magicui-dotted-map-demo` | magicui | source | live | marketing, integrations, ecosystem, network, global, landing, connectors |
| marketing-integrations | `magicui-dotted-map-demo-2` | magicui | source | live | marketing, integrations, ecosystem, network, global, landing, connectors |
| marketing-integrations | `magicui-dotted-map-demo-3` | magicui | source | live | marketing, integrations, ecosystem, network, global, landing, connectors |
| marketing-integrations | `magicui-globe-demo` | magicui | source | live | marketing, integrations, ecosystem, network, global, landing, connectors |
| marketing-integrations | `magicui-icon-cloud-demo` | magicui | source | live | marketing, integrations, ecosystem, network, global, landing, connectors |
| marketing-integrations | `magicui-icon-cloud-demo-2` | magicui | source | live | marketing, integrations, ecosystem, network, global, landing, connectors |
| marketing-integrations | `magicui-icon-cloud-demo-3` | magicui | source | live | marketing, integrations, ecosystem, network, global, landing, connectors |
| marketing-integrations | `magicui-orbiting-circles-demo` | magicui | source | live | marketing, integrations, ecosystem, network, global, landing, connectors |
| marketing-metrics | `magicui-animated-circular-progress-bar-demo` | magicui | source | live | marketing, stats, metrics, counters, landing, outcomes |
| marketing-metrics | `magicui-number-ticker-decimal-demo` | magicui | source | live | marketing, stats, metrics, counters, landing, outcomes |
| marketing-metrics | `magicui-number-ticker-demo` | magicui | source | live | marketing, stats, metrics, counters, landing, outcomes |
| marketing-metrics | `magicui-number-ticker-demo-2` | magicui | source | live | marketing, stats, metrics, counters, landing, outcomes |
| marketing-metrics | `cult-animated-number` | cult-ui | source | live | marketing, stats, metrics, counters, landing |
| marketing-mockup | `magicui-android-demo` | magicui | source | live | marketing, screenshot, device, mockup, product-shot, landing, demo |
| marketing-mockup | `magicui-android-demo-2` | magicui | source | live | marketing, screenshot, device, mockup, product-shot, landing, demo |
| marketing-mockup | `magicui-android-demo-3` | magicui | source | live | marketing, screenshot, device, mockup, product-shot, landing, demo |
| marketing-mockup | `magicui-iphone-demo` | magicui | source | live | marketing, screenshot, device, mockup, product-shot, landing, demo |
| marketing-mockup | `magicui-iphone-demo-2` | magicui | source | live | marketing, screenshot, device, mockup, product-shot, landing, demo |
| marketing-mockup | `magicui-iphone-demo-3` | magicui | source | live | marketing, screenshot, device, mockup, product-shot, landing, demo |
| marketing-mockup | `magicui-safari-demo` | magicui | source | live | marketing, screenshot, device, mockup, product-shot, landing, demo |
| marketing-mockup | `magicui-safari-demo-2` | magicui | source | live | marketing, screenshot, device, mockup, product-shot, landing, demo |
| marketing-mockup | `magicui-safari-demo-3` | magicui | source | live | marketing, screenshot, device, mockup, product-shot, landing, demo |
| marketing-mockup | `magicui-safari-demo-4` | magicui | source | live | marketing, screenshot, device, mockup, product-shot, landing, demo |
| marketing-proof | `magicui-avatar-circles-demo` | magicui | source | live | marketing, logos, testimonials, social-proof, customers, landing, trust |
| marketing-proof | `magicui-marquee-3d` | magicui | source | live | marketing, logos, testimonials, social-proof, customers, landing, trust |
| marketing-proof | `magicui-marquee-demo` | magicui | source | live | marketing, logos, testimonials, social-proof, customers, landing, trust |
| marketing-proof | `magicui-marquee-demo-vertical` | magicui | source | live | marketing, logos, testimonials, social-proof, customers, landing, trust |
| marketing-proof | `magicui-marquee-logos` | magicui | source | live | marketing, logos, testimonials, social-proof, customers, landing, trust |
| marketing-proof | `magicui-tweet-card-demo` | magicui | source | live | marketing, logos, testimonials, social-proof, customers, landing, trust |
| marketing-proof | `magicui-tweet-card-images` | magicui | source | live | marketing, logos, testimonials, social-proof, customers, landing, trust |
| marketing-proof | `magicui-tweet-card-meta-preview` | magicui | source | live | marketing, logos, testimonials, social-proof, customers, landing, trust |
| marketing-proof | `cult-logo-carousel` | cult-ui | source | live | marketing, logos, customers, social-proof, carousel, landing |
| onboarding | `cult-onboarding` | cult-ui | source | live | onboarding, first-run, tour, intro, steps |
| onboarding | `cult-intro-disclosure` | cult-ui | source | live | onboarding, intro, whats-new, feature-announcement, disclosure |
| pagination | `untitled-pagination` | untitled-ui-react | source | live | pagination, paging, page-size, pager |
| pricing | `flowbite-pricing` | flowbite-admin | source | live | pricing, plans, tiers, marketing, landing |
| queue | `untitled-table` | untitled-ui-react | source | live | queue, crud, table, records, datagrid |
| queue | `shadcn-queue` | shadcn-registry | blueprint | live | queue, worklist, triage, inbox, datagrid |
| queue | `tailadmin-tables` | tailadmin-react | source | live | queue, crud, table, records, datagrid |
| queue | `windmill-tables` | windmill-react | source | live | queue, crud, table, records, datagrid |
| queue | `flowbite-users` | flowbite-admin | source | live | queue, crud, table, records, users, admin |
| queue | `flowbite-products` | flowbite-admin | source | live | queue, crud, table, products, inventory, catalog |
| record | `shadcn-record` | shadcn-registry | blueprint | live | record, detail, account, opportunity |
| record | `tailadmin-profile` | tailadmin-react | source | live | record, profile, detail, account, user |
| settings | `shadcn-settings` | shadcn-registry | blueprint | live | settings, preferences, account |
| settings | `fluent-nav` | fluentui | source | live | settings |
| settings | `flowbite-settings` | flowbite-admin | source | live | settings, preferences, account, profile |
| tabs | `untitled-tabs` | untitled-ui-react | source | live | tabs, sections, segmented, workspace-tabs, section-tabs |
| weekly-board | `shadcn-weekly-board` | shadcn-registry | blueprint | live | weekly-board, board, cadence, report-out, standup, kanban, elt |
| wizard | `shadcn-wizard` | shadcn-registry | blueprint | live | wizard, stepper, multi-step, onboarding |

215 rows, 3 of them retired. Required screen coverage: dashboard, marketing, auth, checkout, app-shell, crud, queue, record, chat, settings, wizard, empty, command-palette, lex-record.

## Retired rows — do not cite

- `mantine-appshell` — shadcn is the house source: both Clearspeed consumers are shadcn/Tailwind repos, so a reference on another kit's runtime cannot be built against; shadcn covers app-shell (shadcn-sidebar-07)
- `heroui-next-app` — shadcn is the house source: both Clearspeed consumers are shadcn/Tailwind repos, so a reference on another kit's runtime cannot be built against; shadcn covers app-shell (shadcn-sidebar-07)
- `tremor-charts` — shadcn is the house kit; shadcn-chart-area-interactive is the chart-led page reference and the corpus carries 70 shadcn chart component packs alongside it

