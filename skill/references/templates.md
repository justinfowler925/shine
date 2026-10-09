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
| catalog | `figma-bootstrap-buttons` | shadcn-registry | blueprint | **retired** | catalog, buttons, bootstrap-figma |
| catalog | `figma-bootstrap-components` | shadcn-registry | blueprint | **retired** | catalog, components, bootstrap-figma |
| catalog | `figma-m3-badges` | shadcn-registry | blueprint | **retired** | catalog, badge, material-figma, mui, material3 |
| catalog | `figma-m3-bottom-app-bars` | shadcn-registry | blueprint | **retired** | catalog, app-bar, navigation, material-figma, mui, material3 |
| catalog | `figma-m3-bottom-sheets` | shadcn-registry | blueprint | **retired** | catalog, sheet, overlay, material-figma, mui, material3 |
| catalog | `figma-m3-buttons` | shadcn-registry | blueprint | **retired** | catalog, buttons, material-figma, mui, material3 |
| catalog | `figma-m3-cards` | shadcn-registry | blueprint | **retired** | catalog, cards, material-figma, mui, material3 |
| catalog | `figma-m3-carousel` | shadcn-registry | blueprint | **retired** | catalog, carousel, material-figma, mui, material3 |
| catalog | `figma-m3-checkboxes` | shadcn-registry | blueprint | **retired** | catalog, checkbox, material-figma, mui, material3 |
| catalog | `figma-m3-chips` | shadcn-registry | blueprint | **retired** | catalog, chips, material-figma, mui, material3 |
| catalog | `figma-m3-color` | shadcn-registry | blueprint | **retired** | catalog, color, styles, material-figma, mui, material3 |
| catalog | `figma-m3-date-picker` | shadcn-registry | blueprint | **retired** | catalog, date, picker, material-figma, mui, material3 |
| catalog | `figma-m3-dialogs` | shadcn-registry | blueprint | **retired** | catalog, dialog, overlay, material-figma, mui, material3 |
| catalog | `figma-m3-dividers` | shadcn-registry | blueprint | **retired** | catalog, divider, material-figma, mui, material3 |
| catalog | `figma-m3-elements` | shadcn-registry | blueprint | **retired** | catalog, elements, styles, material-figma, mui, material3 |
| catalog | `figma-m3-elevation` | shadcn-registry | blueprint | **retired** | catalog, elevation, styles, material-figma, mui, material3 |
| catalog | `figma-m3-fabs` | shadcn-registry | blueprint | **retired** | catalog, fab, buttons, material-figma, mui, material3 |
| catalog | `figma-m3-icon-buttons` | shadcn-registry | blueprint | **retired** | catalog, icon-button, buttons, material-figma, mui, material3 |
| catalog | `figma-m3-layout` | shadcn-registry | blueprint | **retired** | catalog, layout, styles, material-figma, mui, material3 |
| catalog | `figma-m3-lists` | shadcn-registry | blueprint | **retired** | catalog, list, records, material-figma, mui, material3 |
| catalog | `figma-m3-menu` | shadcn-registry | blueprint | **retired** | catalog, menu, overlay, material-figma, mui, material3 |
| catalog | `figma-m3-navigation-bars` | shadcn-registry | blueprint | **retired** | catalog, navigation, material-figma, mui, material3 |
| catalog | `figma-m3-navigation-drawer` | shadcn-registry | blueprint | **retired** | catalog, navigation, drawer, material-figma, mui, material3 |
| catalog | `figma-m3-navigation-rails` | shadcn-registry | blueprint | **retired** | catalog, navigation, rail, material-figma, mui, material3 |
| catalog | `figma-m3-progress` | shadcn-registry | blueprint | **retired** | catalog, progress, material-figma, mui, material3 |
| catalog | `figma-m3-radio` | shadcn-registry | blueprint | **retired** | catalog, radio, material-figma, mui, material3 |
| catalog | `figma-m3-search` | shadcn-registry | blueprint | **retired** | catalog, search, material-figma, mui, material3 |
| catalog | `figma-m3-segmented-buttons` | shadcn-registry | blueprint | **retired** | catalog, segmented, buttons, material-figma, mui, material3 |
| catalog | `figma-m3-side-sheets` | shadcn-registry | blueprint | **retired** | catalog, sheet, drawer, material-figma, mui, material3 |
| catalog | `figma-m3-sliders` | shadcn-registry | blueprint | **retired** | catalog, slider, material-figma, mui, material3 |
| catalog | `figma-m3-snackbars` | shadcn-registry | blueprint | **retired** | catalog, snackbar, feedback, material-figma, mui, material3 |
| catalog | `figma-m3-switch` | shadcn-registry | blueprint | **retired** | catalog, switch, material-figma, mui, material3 |
| catalog | `figma-m3-tabs` | shadcn-registry | blueprint | **retired** | catalog, tabs, material-figma, mui, material3 |
| catalog | `figma-m3-time-picker` | shadcn-registry | blueprint | **retired** | catalog, time, picker, material-figma, mui, material3 |
| catalog | `figma-m3-toc` | shadcn-registry | blueprint | **retired** | catalog, navigation, toc, material-figma, mui, material3 |
| catalog | `figma-m3-tooltips` | shadcn-registry | blueprint | **retired** | catalog, tooltip, material-figma, mui, material3 |
| catalog | `figma-m3-top-app-bars` | shadcn-registry | blueprint | **retired** | catalog, app-bar, navigation, material-figma, mui, material3 |
| catalog | `figma-m3-typography` | shadcn-registry | blueprint | **retired** | catalog, typography, styles, material-figma, mui, material3 |
| catalog | `figma-myna-components` | shadcn-registry | blueprint | **retired** | catalog, components, tailwind-figma, myna, shadcn |
| catalog | `figma-tailgrids-atoms` | shadcn-registry | blueprint | **retired** | catalog, atoms, components, tailwind-figma, tailgrids |
| catalog | `figma-tailgrids-layout` | shadcn-registry | blueprint | **retired** | catalog, layout, grid, tailwind-figma, tailgrids |
| catalog | `shadcn-catalog` | shadcn-registry | blueprint | live | catalog, cards, library, packages, directory, gallery, showcase, tools |
| catalog | `shadcn-catalog-integrations` | shadcn-registry | blueprint | live | catalog, cards, library, integrations, connectors, plugins, directory |
| catalog | `shadcn-catalog-skills` | shadcn-registry | blueprint | live | catalog, cards, library, skills, agents, packages, directory |
| catalog | `shadcn-catalog-templates` | shadcn-registry | blueprint | live | catalog, cards, library, templates, gallery, showcase, directory |
| catalog | `shadcn-catalog-tools` | shadcn-registry | blueprint | live | catalog, cards, library, tools, packages, company-tools, directory |
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
| chat | `shadcn-chat` | shadcn-registry | blueprint | live | chat, assistant, conversation, thread |
| chat | `shadcn-chat-inbox` | shadcn-registry | blueprint | live | chat, assistant, inbox, threads, conversation |
| chat | `shadcn-chat-sidecar` | shadcn-registry | blueprint | live | chat, assistant, sidecar, conversation, copilot |
| chat | `shadcn-chat-support` | shadcn-registry | blueprint | live | chat, assistant, support, triage, ticket, conversation |
| chat | `spectrum-ai-chat` | react-spectrum | source | live | chat, assistant |
| checkout | `shadcn-checkout` | shadcn-registry | blueprint | live | checkout, payment |
| command-palette | `shadcn-command` | shadcn-registry | source | live | command-palette, palette, cmdk |
| dashboard | `shadcn-dashboard-01` | shadcn-registry | source | live | crud, dashboard, list, records |
| dashboard | `untitled-line-charts` | untitled-ui-react | source | live | dashboard, analytics, charts, dataviz |
| dashboard | `shadcn-cockpit-adoption` | shadcn-registry | blueprint | live | dashboard, cockpit, kpi, kpis, adoption, workspaces, dense |
| dashboard | `shadcn-cockpit-compliance` | shadcn-registry | blueprint | live | dashboard, cockpit, kpi, kpis, compliance, risk, findings, dense |
| dashboard | `shadcn-cockpit-ops` | shadcn-registry | blueprint | live | dashboard, cockpit, kpi, kpis, ops, console, dense |
| dashboard | `shadcn-cockpit-revenue` | shadcn-registry | blueprint | live | dashboard, cockpit, kpi, kpis, revenue, pipeline, dense |
| dashboard | `tailadmin-dashboard` | tailadmin-react | source | live | dashboard, analytics, kpi, ecommerce, metrics |
| dashboard | `windmill-dashboard` | windmill-react | source | live | dashboard, analytics, kpi, metrics, dense |
| dashboard | `flowbite-dashboard` | flowbite-admin | source | live | dashboard, analytics, kpi, metrics, sales, dense |
| dashboard | `flowbite-stacked` | flowbite-admin | source | live | dashboard, analytics, kpi, metrics, dense, stacked |
| dashboard | `flowbite-sidebar-layout` | flowbite-admin | source | live | dashboard, analytics, kpi, metrics, dense, app-shell |
| dashboard | `query-shadcn-blocks` | shadcn-registry | query-only | live | dashboard |
| dashboard | `query-haze` | haze | query-only | live | dashboard |
| empty | `shadcn-empty-icon` | shadcn-registry | source | live | empty, ai-generate |
| form | `figma-bootstrap-forms` | shadcn-registry | blueprint | **retired** | form, fields, bootstrap-figma |
| form | `figma-m3-text-fields` | shadcn-registry | blueprint | **retired** | form, fields, material-figma, mui, material3 |
| form | `shadcn-form` | shadcn-registry | blueprint | live | form, form-app, input, fields, create, edit |
| form | `shadcn-form-invite` | shadcn-registry | blueprint | live | form, form-app, invite, invite-teammate |
| form | `untitled-date-picker` | untitled-ui-react | source | live | form, input, date, date-range, calendar, picker |
| form | `tailadmin-form-elements` | tailadmin-react | source | live | form, form-app, input, fields, controls |
| form | `untitled-file-upload` | untitled-ui-react | source | live | form, input, upload, attachments, dropzone, files |
| form | `windmill-forms` | windmill-react | source | live | form, form-app, input, fields, validation |
| lex-console | `lex-console` | slds | blueprint | live | lex-console |
| lex-email | `lex-email` | slds | blueprint | live | lex-email, email |
| lex-lwr | `lex-lwr` | slds | blueprint | live | lex-lwr |
| lex-mobile | `lex-mobile` | slds | blueprint | live | lex-mobile |
| lex-queue | `lex-queue` | slds | blueprint | live | lex-queue, queue |
| lex-record | `lex-record` | slds | blueprint | live | lex-record, record, detail, lightning, lwc |
| lex-record | `lex-record-narrow` | slds | blueprint | live | lex-record-narrow, lex-record |
| marketing | `figma-m3-cover` | shadcn-registry | blueprint | **retired** | marketing, material-figma, mui, material3 |
| marketing | `figma-tailgrids-cover` | shadcn-registry | blueprint | **retired** | marketing, landing, tailwind-figma, tailgrids |
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
| queue | `figma-tailgrids-table-stack` | shadcn-registry | blueprint | **retired** | queue, table, records, tailwind-figma, tailgrids |
| queue | `untitled-table` | untitled-ui-react | source | live | queue, crud, table, records, datagrid |
| queue | `shadcn-queue` | shadcn-registry | blueprint | live | queue, worklist, triage, inbox, datagrid |
| queue | `tailadmin-tables` | tailadmin-react | source | live | queue, crud, table, records, datagrid |
| queue | `windmill-tables` | windmill-react | source | live | queue, crud, table, records, datagrid |
| queue | `flowbite-users` | flowbite-admin | source | live | queue, crud, table, records, users, admin |
| queue | `flowbite-products` | flowbite-admin | source | live | queue, crud, table, products, inventory, catalog |
| record | `shadcn-record` | shadcn-registry | blueprint | live | record, detail, account, opportunity |
| record | `shadcn-record-account` | shadcn-registry | blueprint | live | record, account, detail, customer |
| record | `tailadmin-profile` | tailadmin-react | source | live | record, profile, detail, account, user |
| settings | `shadcn-settings` | shadcn-registry | blueprint | live | settings, preferences, account |
| settings | `shadcn-settings-billing` | shadcn-registry | blueprint | live | settings, billing, plan, seats |
| settings | `shadcn-settings-members` | shadcn-registry | blueprint | live | settings, members, roles, access |
| settings | `shadcn-settings-notifications` | shadcn-registry | blueprint | live | settings, notifications, preferences, alerts |
| settings | `flowbite-settings` | flowbite-admin | source | live | settings, preferences, account, profile |
| settings | `fluent-nav` | fluentui | source | live | settings |
| tabs | `untitled-tabs` | untitled-ui-react | source | live | tabs, sections, segmented, workspace-tabs, section-tabs |
| weekly-board | `shadcn-weekly-board` | shadcn-registry | blueprint | live | weekly-board, board, cadence, report-out, standup, kanban, elt |
| wizard | `shadcn-wizard` | shadcn-registry | blueprint | live | wizard, stepper, multi-step, onboarding |

282 rows, 49 of them retired. Required screen coverage: dashboard, marketing, auth, checkout, app-shell, crud, queue, record, chat, settings, wizard, empty, command-palette, lex-record.

## Retired rows — do not cite

- `mantine-appshell` — shadcn is the house source: both Clearspeed consumers are shadcn/Tailwind repos, so a reference on another kit's runtime cannot be built against; shadcn covers app-shell (shadcn-sidebar-07)
- `heroui-next-app` — shadcn is the house source: both Clearspeed consumers are shadcn/Tailwind repos, so a reference on another kit's runtime cannot be built against; shadcn covers app-shell (shadcn-sidebar-07)
- `figma-bootstrap-buttons` — undefined
- `figma-bootstrap-components` — undefined
- `figma-m3-badges` — undefined
- `figma-m3-bottom-app-bars` — undefined
- `figma-m3-bottom-sheets` — undefined
- `figma-m3-buttons` — undefined
- `figma-m3-cards` — undefined
- `figma-m3-carousel` — undefined
- `figma-m3-checkboxes` — undefined
- `figma-m3-chips` — undefined
- `figma-m3-color` — undefined
- `figma-m3-date-picker` — undefined
- `figma-m3-dialogs` — undefined
- `figma-m3-dividers` — undefined
- `figma-m3-elements` — undefined
- `figma-m3-elevation` — undefined
- `figma-m3-fabs` — undefined
- `figma-m3-icon-buttons` — undefined
- `figma-m3-layout` — undefined
- `figma-m3-lists` — undefined
- `figma-m3-menu` — undefined
- `figma-m3-navigation-bars` — undefined
- `figma-m3-navigation-drawer` — undefined
- `figma-m3-navigation-rails` — undefined
- `figma-m3-progress` — undefined
- `figma-m3-radio` — undefined
- `figma-m3-search` — undefined
- `figma-m3-segmented-buttons` — undefined
- `figma-m3-side-sheets` — undefined
- `figma-m3-sliders` — undefined
- `figma-m3-snackbars` — undefined
- `figma-m3-switch` — undefined
- `figma-m3-tabs` — undefined
- `figma-m3-time-picker` — undefined
- `figma-m3-toc` — undefined
- `figma-m3-tooltips` — undefined
- `figma-m3-top-app-bars` — undefined
- `figma-m3-typography` — undefined
- `figma-myna-components` — undefined
- `figma-tailgrids-atoms` — undefined
- `figma-tailgrids-layout` — undefined
- `tremor-charts` — shadcn is the house kit; shadcn-chart-area-interactive is the chart-led page reference and the corpus carries 70 shadcn chart component packs alongside it
- `figma-bootstrap-forms` — undefined
- `figma-m3-text-fields` — undefined
- `figma-m3-cover` — undefined
- `figma-tailgrids-cover` — undefined
- `figma-tailgrids-table-stack` — undefined

