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
| app-shell | `heroui-docs` | heroui | source | live | app-shell, docs, heroui |
| app-shell | `mantine-appshell` | mantine | source | **retired** | app-shell, shell, nav, sidebar |
| app-shell | `heroui-next-app` | heroui | source | live | app-shell, shell, nav, sidebar |
| app-shell | `heroui-accordion` | heroui | source | live | app-shell, navigation, heroui, accordion |
| app-shell | `heroui-breadcrumbs` | heroui | source | live | app-shell, navigation, heroui, breadcrumbs |
| app-shell | `heroui-disclosure` | heroui | source | live | app-shell, navigation, heroui, disclosure |
| app-shell | `heroui-disclosure-group` | heroui | source | live | app-shell, navigation, heroui, disclosure-group |
| app-shell | `heroui-header` | heroui | source | live | app-shell, navigation, heroui, header |
| app-shell | `heroui-link` | heroui | source | live | app-shell, navigation, heroui, link |
| app-shell | `heroui-tabs` | heroui | source | live | app-shell, navigation, heroui, tabs |
| app-shell | `heroui-toolbar` | heroui | source | live | app-shell, navigation, heroui, toolbar |
| app-shell | `query-adminlte` | adminlte | query-only | live | app-shell, shell, nav, sidebar |
| app-shell | `query-primeblocks` | primeblocks | query-only | live | app-shell, shell, nav, sidebar |
| async-state | `untitled-loading-indicator` | untitled-ui-react | source | live | loading, spinner, pending, async, skeleton |
| async-state | `heroui-alert` | heroui | source | live | async-state, loading, feedback, heroui, alert |
| async-state | `heroui-empty-state` | heroui | source | live | async-state, loading, feedback, heroui, empty-state |
| async-state | `heroui-meter` | heroui | source | live | async-state, loading, feedback, heroui, meter |
| async-state | `heroui-progress-bar` | heroui | source | live | async-state, loading, feedback, heroui, progress-bar |
| async-state | `heroui-progress-circle` | heroui | source | live | async-state, loading, feedback, heroui, progress-circle |
| async-state | `heroui-skeleton` | heroui | source | live | async-state, loading, feedback, heroui, skeleton |
| async-state | `heroui-spinner` | heroui | source | live | async-state, loading, feedback, heroui, spinner |
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
| auth | `tailadmin-signup` | tailadmin-react | source | live | auth, signup, sign-up, register |
| auth | `windmill-login` | windmill-react | source | live | auth, login, signin, sign-in |
| auth | `windmill-create-account` | windmill-react | source | live | auth, signup, sign-up, register |
| auth | `flowbite-sign-in` | flowbite-admin | source | live | auth, login, signin, sign-in |
| auth | `windmill-forgot-password` | windmill-react | source | live | auth, forgot-password, recovery |
| auth | `flowbite-sign-up` | flowbite-admin | source | live | auth, signup, sign-up, register |
| auth | `flowbite-forgot-password` | flowbite-admin | source | live | auth, forgot-password, reset, recovery |
| auth | `flowbite-reset-password` | flowbite-admin | source | live | auth, reset-password, password, recovery |
| auth | `flowbite-profile-lock` | flowbite-admin | source | live | auth, lock-screen, reauth, session |
| blog | `shadcn-blog` | shadcn-registry | blueprint | live | blog, article, editorial, post |
| blog | `heroui-blog` | heroui | source | live | blog, article, heroui |
| blog | `heroui-kbd` | heroui | source | live | typography, heroui, kbd |
| blog | `heroui-typography` | heroui | source | live | typography, heroui, typography |
| broadcast | `shadcn-broadcast` | shadcn-registry | blueprint | live | broadcast, video, media, player, television, presenter |
| calendar | `tailadmin-calendar` | tailadmin-react | source | live | calendar, schedule, events, agenda, month-view |
| calendar | `heroui-calendar` | heroui | source | live | calendar, form, date, heroui, calendar |
| calendar | `heroui-calendar-year-picker` | heroui | source | live | calendar, form, date, heroui, calendar-year-picker |
| calendar | `heroui-date-field` | heroui | source | live | calendar, form, date, heroui, date-field |
| calendar | `heroui-date-input-group` | heroui | source | live | calendar, form, date, heroui, date-input-group |
| calendar | `heroui-date-picker` | heroui | source | live | calendar, form, date, heroui, date-picker |
| calendar | `heroui-date-range-picker` | heroui | source | live | calendar, form, date, heroui, date-range-picker |
| calendar | `heroui-range-calendar` | heroui | source | live | calendar, form, date, heroui, range-calendar |
| calendar | `heroui-time-field` | heroui | source | live | calendar, form, date, heroui, time-field |
| carousel | `untitled-carousel` | untitled-ui-react | source | live | carousel, gallery, slides, slideshow |
| carousel | `cult-three-d-carousel` | cult-ui | source | live | carousel, gallery, slides, media, 3d |
| catalog | `figma-bootstrap-buttons` | shadcn-registry | blueprint | **retired** | catalog, buttons, bootstrap-figma |
| catalog | `figma-bootstrap-components` | shadcn-registry | blueprint | **retired** | catalog, components, bootstrap-figma |
| catalog | `figma-heroui-avatar-group` | shadcn-registry | blueprint | **retired** | catalog, avatar, people, heroui-figma |
| catalog | `figma-heroui-badge` | shadcn-registry | blueprint | **retired** | catalog, badge, status, heroui-figma |
| catalog | `figma-heroui-calendar` | shadcn-registry | blueprint | **retired** | catalog, calendar, date, heroui-figma |
| catalog | `figma-heroui-card` | shadcn-registry | blueprint | **retired** | catalog, card, heroui-figma |
| catalog | `figma-heroui-components` | shadcn-registry | blueprint | **retired** | catalog, docs, heroui-figma, components |
| catalog | `figma-heroui-progress` | shadcn-registry | blueprint | **retired** | catalog, progress, loading, heroui-figma |
| catalog | `figma-heroui-radio` | shadcn-registry | blueprint | **retired** | catalog, radio, form, heroui-figma |
| catalog | `figma-heroui-theme` | shadcn-registry | blueprint | **retired** | catalog, theme, tokens, heroui-figma |
| catalog | `figma-myna-components` | shadcn-registry | blueprint | **retired** | catalog, components, tailwind-figma, myna, shadcn |
| catalog | `figma-tailgrids-atoms` | shadcn-registry | blueprint | **retired** | catalog, atoms, components, tailwind-figma, tailgrids |
| catalog | `figma-tailgrids-layout` | shadcn-registry | blueprint | **retired** | catalog, layout, grid, tailwind-figma, tailgrids |
| catalog | `shadcn-catalog` | shadcn-registry | blueprint | live | catalog, cards, library, packages, directory, gallery, showcase, tools |
| catalog | `shadcn-catalog-integrations` | shadcn-registry | blueprint | live | catalog, cards, library, integrations, connectors, plugins, directory |
| catalog | `shadcn-catalog-skills` | shadcn-registry | blueprint | live | catalog, cards, library, skills, agents, packages, directory |
| catalog | `shadcn-catalog-templates` | shadcn-registry | blueprint | live | catalog, cards, library, templates, gallery, showcase, directory |
| catalog | `shadcn-catalog-tools` | shadcn-registry | blueprint | live | catalog, cards, library, tools, packages, company-tools, directory |
| catalog | `windmill-cards` | windmill-react | source | live | component, card, catalog |
| catalog | `tailadmin-images` | tailadmin-react | source | live | component, image, media, gallery |
| catalog | `heroui-card` | heroui | source | live | catalog, layout, heroui, card |
| catalog | `heroui-separator` | heroui | source | live | catalog, layout, heroui, separator |
| catalog | `heroui-surface` | heroui | source | live | catalog, layout, heroui, surface |
| catalog | `tailadmin-videos` | tailadmin-react | source | live | component, video, media, player |
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
| charts | `tailadmin-bar-chart` | tailadmin-react | source | live | charts, chart, bar, analytics, dataviz |
| charts | `tailadmin-line-chart` | tailadmin-react | source | live | charts, chart, line, analytics, dataviz |
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
| empty | `tailadmin-blank` | tailadmin-react | source | live | empty, blank, starter, canvas |
| empty | `untitled-empty-state` | untitled-ui-react | source | live | empty, empty-state, zero |
| empty | `flowbite-404` | flowbite-admin | source | live | empty, 404, not-found, error |
| empty | `tailadmin-not-found` | tailadmin-react | source | live | empty, 404, not-found, error |
| empty | `flowbite-500` | flowbite-admin | source | live | empty, 500, server-error, error |
| empty | `windmill-404` | windmill-react | source | live | empty, 404, not-found, error |
| empty | `flowbite-maintenance` | flowbite-admin | source | live | empty, maintenance, downtime, status |
| empty | `windmill-blank` | windmill-react | source | live | empty, blank, starter |
| form | `figma-bootstrap-forms` | shadcn-registry | blueprint | **retired** | form, fields, bootstrap-figma |
| form | `shadcn-form` | shadcn-registry | blueprint | live | form, form-app, input, fields, create, edit |
| form | `shadcn-form-invite` | shadcn-registry | blueprint | live | form, form-app, invite, invite-teammate |
| form | `untitled-date-picker` | untitled-ui-react | source | live | form, input, date, date-range, calendar, picker |
| form | `tailadmin-form-elements` | tailadmin-react | source | live | form, form-app, input, fields, controls |
| form | `untitled-file-upload` | untitled-ui-react | source | live | form, input, upload, attachments, dropzone, files |
| form | `windmill-forms` | windmill-react | source | live | form, form-app, input, fields, validation |
| form | `untitled-modals` | untitled-ui-react | source | live | overlay, modal, dialog |
| form | `tailadmin-alerts` | tailadmin-react | source | live | component, alert, feedback, banner, tailadmin |
| form | `untitled-slideout` | untitled-ui-react | source | live | overlay, sheet, slideout, drawer |
| form | `tailadmin-badges` | tailadmin-react | source | live | component, badge, status, chip |
| form | `windmill-buttons` | windmill-react | source | live | component, button, cta |
| form | `heroui-alert-dialog` | heroui | source | live | overlay, dialog, heroui, alert-dialog |
| form | `heroui-autocomplete` | heroui | source | live | form, form-app, input, fields, heroui, autocomplete |
| form | `heroui-button` | heroui | source | live | form, chrome, button, heroui, button |
| form | `heroui-button-group` | heroui | source | live | form, chrome, button, heroui, button-group |
| form | `heroui-checkbox` | heroui | source | live | form, form-app, input, fields, heroui, checkbox |
| form | `heroui-checkbox-group` | heroui | source | live | form, form-app, input, fields, heroui, checkbox-group |
| form | `heroui-close-button` | heroui | source | live | form, chrome, button, heroui, close-button |
| form | `heroui-color-area` | heroui | source | live | form, picker, color, heroui, color-area |
| form | `heroui-color-field` | heroui | source | live | form, picker, color, heroui, color-field |
| form | `heroui-color-input-group` | heroui | source | live | form, picker, color, heroui, color-input-group |
| form | `heroui-color-picker` | heroui | source | live | form, picker, color, heroui, color-picker |
| form | `heroui-color-slider` | heroui | source | live | form, picker, color, heroui, color-slider |
| form | `heroui-color-swatch` | heroui | source | live | form, picker, color, heroui, color-swatch |
| form | `heroui-color-swatch-picker` | heroui | source | live | form, picker, color, heroui, color-swatch-picker |
| form | `heroui-combo-box` | heroui | source | live | form, form-app, input, fields, heroui, combo-box |
| form | `heroui-description` | heroui | source | live | form, form-app, input, fields, heroui, description |
| form | `heroui-drawer` | heroui | source | live | overlay, dialog, heroui, drawer |
| form | `heroui-dropdown` | heroui | source | live | form, menu, collections, heroui, dropdown |
| form | `heroui-error-message` | heroui | source | live | form, form-app, input, fields, heroui, error-message |
| form | `heroui-field-error` | heroui | source | live | form, form-app, input, fields, heroui, field-error |
| form | `heroui-fieldset` | heroui | source | live | form, form-app, input, fields, heroui, fieldset |
| form | `heroui-form` | heroui | source | live | form, form-app, input, fields, heroui, form |
| form | `heroui-input` | heroui | source | live | form, form-app, input, fields, heroui, input |
| form | `heroui-input-group` | heroui | source | live | form, form-app, input, fields, heroui, input-group |
| form | `heroui-input-otp` | heroui | source | live | form, form-app, input, fields, heroui, input-otp |
| form | `heroui-label` | heroui | source | live | form, form-app, input, fields, heroui, label |
| form | `heroui-menu` | heroui | source | live | form, menu, collections, heroui, menu |
| form | `heroui-menu-item` | heroui | source | live | form, menu, collections, heroui, menu-item |
| form | `heroui-menu-section` | heroui | source | live | form, menu, collections, heroui, menu-section |
| form | `heroui-modal` | heroui | source | live | overlay, dialog, heroui, modal |
| form | `heroui-number-field` | heroui | source | live | form, form-app, input, fields, heroui, number-field |
| form | `heroui-popover` | heroui | source | live | overlay, dialog, heroui, popover |
| form | `heroui-radio` | heroui | source | live | form, form-app, input, fields, heroui, radio |
| form | `heroui-radio-group` | heroui | source | live | form, form-app, input, fields, heroui, radio-group |
| form | `heroui-scroll-shadow` | heroui | source | live | component, heroui, scroll-shadow |
| form | `heroui-search-field` | heroui | source | live | form, form-app, input, fields, heroui, search-field |
| form | `heroui-select` | heroui | source | live | form, form-app, input, fields, heroui, select |
| form | `heroui-slider` | heroui | source | live | form, form-app, input, fields, heroui, slider |
| form | `heroui-switch` | heroui | source | live | form, form-app, input, fields, heroui, switch |
| form | `heroui-switch-group` | heroui | source | live | form, form-app, input, fields, heroui, switch-group |
| form | `heroui-tag` | heroui | source | live | form, menu, collections, heroui, tag |
| form | `heroui-tag-group` | heroui | source | live | form, menu, collections, heroui, tag-group |
| form | `heroui-textarea` | heroui | source | live | form, form-app, input, fields, heroui, textarea |
| form | `heroui-textfield` | heroui | source | live | form, form-app, input, fields, heroui, textfield |
| form | `heroui-toast` | heroui | source | live | overlay, dialog, heroui, toast |
| form | `heroui-toggle-button` | heroui | source | live | form, chrome, button, heroui, toggle-button |
| form | `heroui-toggle-button-group` | heroui | source | live | form, chrome, button, heroui, toggle-button-group |
| form | `heroui-tooltip` | heroui | source | live | overlay, dialog, heroui, tooltip |
| form | `tailadmin-buttons` | tailadmin-react | source | live | component, button, cta, controls |
| form | `windmill-modals` | windmill-react | source | live | component, modal, overlay, dialog |
| lex-console | `lex-console` | slds | blueprint | live | lex-console |
| lex-email | `lex-email` | slds | blueprint | live | lex-email, email |
| lex-lwr | `lex-lwr` | slds | blueprint | live | lex-lwr |
| lex-mobile | `lex-mobile` | slds | blueprint | live | lex-mobile |
| lex-queue | `lex-queue` | slds | blueprint | live | lex-queue, queue |
| lex-record | `lex-record` | slds | blueprint | live | lex-record, record, detail, lightning, lwc |
| lex-record | `lex-record-narrow` | slds | blueprint | live | lex-record-narrow, lex-record |
| marketing | `figma-heroui-cover` | shadcn-registry | blueprint | **retired** | marketing, landing, heroui-figma, cover |
| marketing | `figma-m3-cover` | shadcn-registry | blueprint | **retired** | marketing, material-figma, mui, material3 |
| marketing | `figma-tailgrids-cover` | shadcn-registry | blueprint | **retired** | marketing, landing, tailwind-figma, tailgrids |
| marketing | `shadcn-marketing` | shadcn-registry | blueprint | live | marketing, landing, pricing |
| marketing | `heroui-home` | heroui | source | live | marketing, landing, heroui, home |
| marketing | `heroui-about` | heroui | source | live | marketing, about, heroui |
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
| pricing | `heroui-pricing` | heroui | source | live | pricing, plans, marketing, heroui |
| queue | `figma-tailgrids-table-stack` | shadcn-registry | blueprint | **retired** | queue, table, records, tailwind-figma, tailgrids |
| queue | `shadcn-operate-decide` | shadcn-registry | blueprint | live | queue, worklist, triage, decide, decide-queue, sled, pursue, inbox, datagrid |
| queue | `untitled-table` | untitled-ui-react | source | live | queue, crud, table, records, datagrid |
| queue | `shadcn-queue` | shadcn-registry | blueprint | live | queue, worklist, triage, inbox, datagrid |
| queue | `tailadmin-tables` | tailadmin-react | source | live | queue, crud, table, records, datagrid |
| queue | `windmill-tables` | windmill-react | source | live | queue, crud, table, records, datagrid |
| queue | `flowbite-users` | flowbite-admin | source | live | queue, crud, table, records, users, admin |
| queue | `flowbite-products` | flowbite-admin | source | live | queue, crud, table, products, inventory, catalog |
| queue | `heroui-list-box` | heroui | source | live | queue, table, crud, heroui, list-box |
| queue | `heroui-list-box-item` | heroui | source | live | queue, table, crud, heroui, list-box-item |
| queue | `heroui-list-box-section` | heroui | source | live | queue, table, crud, heroui, list-box-section |
| queue | `heroui-pagination` | heroui | source | live | queue, table, crud, heroui, pagination |
| queue | `heroui-table` | heroui | source | live | queue, table, crud, heroui, table |
| record | `shadcn-record` | shadcn-registry | blueprint | live | record, detail, account, opportunity |
| record | `shadcn-record-account` | shadcn-registry | blueprint | live | record, account, detail, customer |
| record | `tailadmin-profile` | tailadmin-react | source | live | record, profile, detail, account, user |
| record | `tailadmin-avatars` | tailadmin-react | source | live | component, avatar, identity |
| record | `heroui-avatar` | heroui | source | live | record, data-display, heroui, avatar |
| record | `heroui-badge` | heroui | source | live | record, data-display, heroui, badge |
| record | `heroui-chip` | heroui | source | live | record, data-display, heroui, chip |
| settings | `shadcn-settings` | shadcn-registry | blueprint | live | settings, preferences, account |
| settings | `shadcn-settings-billing` | shadcn-registry | blueprint | live | settings, billing, plan, seats |
| settings | `shadcn-settings-members` | shadcn-registry | blueprint | live | settings, members, roles, access |
| settings | `shadcn-settings-notifications` | shadcn-registry | blueprint | live | settings, notifications, preferences, alerts |
| settings | `flowbite-settings` | flowbite-admin | source | live | settings, preferences, account, profile |
| settings | `fluent-nav` | fluentui | source | live | settings |
| tabs | `untitled-tabs` | untitled-ui-react | source | live | tabs, sections, segmented, workspace-tabs, section-tabs |
| weekly-board | `shadcn-weekly-board` | shadcn-registry | blueprint | live | weekly-board, board, cadence, report-out, standup, kanban, elt |
| wizard | `shadcn-wizard` | shadcn-registry | blueprint | live | wizard, stepper, multi-step, onboarding |

371 rows, 20 of them retired. Required screen coverage: dashboard, marketing, auth, checkout, app-shell, crud, queue, record, chat, settings, wizard, empty, command-palette, lex-record.

## Retired rows — do not cite

- `mantine-appshell` — shadcn is the house source: both Clearspeed consumers are shadcn/Tailwind repos, so a reference on another kit's runtime cannot be built against; shadcn covers app-shell (shadcn-sidebar-07)
- `figma-bootstrap-buttons` — undefined
- `figma-bootstrap-components` — undefined
- `figma-heroui-avatar-group` — undefined
- `figma-heroui-badge` — undefined
- `figma-heroui-calendar` — undefined
- `figma-heroui-card` — undefined
- `figma-heroui-components` — undefined
- `figma-heroui-progress` — undefined
- `figma-heroui-radio` — undefined
- `figma-heroui-theme` — undefined
- `figma-myna-components` — undefined
- `figma-tailgrids-atoms` — undefined
- `figma-tailgrids-layout` — undefined
- `tremor-charts` — shadcn is the house kit; shadcn-chart-area-interactive is the chart-led page reference and the corpus carries 70 shadcn chart component packs alongside it
- `figma-bootstrap-forms` — undefined
- `figma-heroui-cover` — undefined
- `figma-m3-cover` — undefined
- `figma-tailgrids-cover` — undefined
- `figma-tailgrids-table-stack` — undefined

