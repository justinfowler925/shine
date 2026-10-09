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
| app-shell | `figma-bootstrap-accordion` | shadcn-registry | blueprint | live | app-shell, accordion, bootstrap-figma |
| app-shell | `figma-bootstrap-breadcrumb` | shadcn-registry | blueprint | live | app-shell, breadcrumb, bootstrap-figma |
| app-shell | `figma-bootstrap-links` | shadcn-registry | blueprint | live | app-shell, link, bootstrap-figma |
| app-shell | `figma-bootstrap-navbar` | shadcn-registry | blueprint | live | app-shell, navbar, bootstrap-figma |
| app-shell | `figma-bootstrap-navs` | shadcn-registry | blueprint | live | app-shell, navs, bootstrap-figma |
| app-shell | `figma-bootstrap-tabs` | shadcn-registry | blueprint | live | app-shell, tabs, bootstrap-figma |
| app-shell | `figma-myna-accordion` | shadcn-registry | blueprint | live | app-shell, accordion, tailwind-figma, myna |
| app-shell | `figma-myna-breadcrumb` | shadcn-registry | blueprint | live | app-shell, breadcrumb, tailwind-figma, myna |
| app-shell | `figma-myna-menubar` | shadcn-registry | blueprint | live | app-shell, menubar, tailwind-figma, myna |
| app-shell | `figma-myna-tabs` | shadcn-registry | blueprint | live | app-shell, tabs, tailwind-figma, myna |
| app-shell | `figma-tailgrids-breadcrumbs` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, breadcrumbs, breadcrumbs, app-shell |
| app-shell | `figma-tailgrids-horizontal-menus` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, horizontal-menus, horizontal-menus, app-shell |
| app-shell | `figma-tailgrids-navbars` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, navbars, navbars, app-shell |
| app-shell | `figma-tailgrids-tabs` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, tabs, tabs, app-shell |
| app-shell | `figma-tailgrids-vertical-navbars` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, vertical-navbars, vertical-navbars, app-shell |
| app-shell | `heroui-docs` | heroui | source | live | app-shell, docs, heroui |
| app-shell | `mantine-appshell` | mantine | source | **retired** | app-shell, shell, nav, sidebar |
| app-shell | `figma-heroui-accordion` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, accordion, accordion, component |
| app-shell | `figma-heroui-link` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, link, link, component |
| app-shell | `figma-heroui-tabs` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, tabs, tabs, component |
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
| async-state | `figma-bootstrap-alert` | shadcn-registry | blueprint | live | async-state, alert, bootstrap-figma |
| async-state | `figma-bootstrap-progress` | shadcn-registry | blueprint | live | async-state, progress, bootstrap-figma |
| async-state | `figma-bootstrap-spinners` | shadcn-registry | blueprint | live | async-state, spinner, bootstrap-figma |
| async-state | `figma-bootstrap-toasts` | shadcn-registry | blueprint | live | async-state, toast, bootstrap-figma |
| async-state | `figma-myna-alert` | shadcn-registry | blueprint | live | async-state, alert, tailwind-figma, myna |
| async-state | `figma-myna-progress` | shadcn-registry | blueprint | live | async-state, progress, tailwind-figma, myna |
| async-state | `figma-myna-skeleton` | shadcn-registry | blueprint | live | async-state, skeleton, tailwind-figma, myna |
| async-state | `figma-myna-sonner` | shadcn-registry | blueprint | live | async-state, toast, tailwind-figma, myna |
| async-state | `figma-heroui-alert` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, alert, alert, component |
| async-state | `figma-heroui-progress` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, progress, progress, component |
| async-state | `figma-heroui-spinner` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, spinner, spinner, component |
| async-state | `figma-heroui-toast` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, toast, toast, component |
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
| auth | `figma-tailgrids-sign-in-sign-up` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, sign-in-sign-up, sign-in-sign-up, auth |
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
| catalog | `shadcn-catalog` | shadcn-registry | blueprint | live | catalog, cards, library, packages, directory, gallery, showcase, tools |
| catalog | `shadcn-catalog-integrations` | shadcn-registry | blueprint | live | catalog, cards, library, integrations, connectors, plugins, directory |
| catalog | `shadcn-catalog-skills` | shadcn-registry | blueprint | live | catalog, cards, library, skills, agents, packages, directory |
| catalog | `shadcn-catalog-templates` | shadcn-registry | blueprint | live | catalog, cards, library, templates, gallery, showcase, directory |
| catalog | `shadcn-catalog-tools` | shadcn-registry | blueprint | live | catalog, cards, library, tools, packages, company-tools, directory |
| catalog | `figma-heroui-brand` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, brand, brand, brand |
| catalog | `figma-heroui-button-atoms` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, button-atoms, button, atoms |
| catalog | `figma-heroui-figma-components` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, figma-components, figma-components, atoms |
| catalog | `figma-heroui-icons-essential` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, icons-essential, icons, icons |
| catalog | `figma-heroui-theme-dark` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, theme-dark, theme, tokens |
| catalog | `figma-heroui-theme-light` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, theme-light, theme, tokens |
| catalog | `figma-heroui-theme-radius` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, theme-radius, theme, tokens |
| catalog | `figma-heroui-theme-shadow` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, theme-shadow, theme, tokens |
| catalog | `figma-heroui-theme-spacing` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, theme-spacing, theme, tokens |
| catalog | `figma-heroui-theme-typography` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, theme-typography, theme, tokens |
| catalog | `figma-bootstrap-badges` | shadcn-registry | blueprint | live | catalog, badge, bootstrap-figma |
| catalog | `figma-bootstrap-borders` | shadcn-registry | blueprint | live | catalog, borders, bootstrap-figma |
| catalog | `figma-bootstrap-buttons` | shadcn-registry | blueprint | live | figma-kit, bootstrap-figma, bootstrap, buttons, bootstrap-5-button-strip |
| catalog | `figma-bootstrap-card` | shadcn-registry | blueprint | live | catalog, card, bootstrap-figma |
| catalog | `figma-bootstrap-changelog` | shadcn-registry | blueprint | live | catalog, changelog, bootstrap-figma |
| catalog | `figma-bootstrap-color` | shadcn-registry | blueprint | live | catalog, color, bootstrap-figma |
| catalog | `figma-bootstrap-components` | shadcn-registry | blueprint | live | figma-kit, bootstrap-figma, bootstrap, components, bootstrap-5-components-gallery |
| catalog | `figma-bootstrap-docs-elements` | shadcn-registry | blueprint | live | catalog, docs, bootstrap-figma |
| catalog | `figma-bootstrap-fonts` | shadcn-registry | blueprint | live | catalog, fonts, bootstrap-figma |
| catalog | `figma-bootstrap-foundations` | shadcn-registry | blueprint | live | catalog, foundations, bootstrap-figma |
| catalog | `figma-bootstrap-icons` | shadcn-registry | blueprint | live | catalog, icons, bootstrap-figma |
| catalog | `figma-bootstrap-list-group` | shadcn-registry | blueprint | live | catalog, list, bootstrap-figma |
| catalog | `figma-bootstrap-lists-group` | shadcn-registry | blueprint | live | catalog, list, bootstrap-figma |
| catalog | `figma-bootstrap-radius` | shadcn-registry | blueprint | live | catalog, radius, bootstrap-figma |
| catalog | `figma-bootstrap-shadows` | shadcn-registry | blueprint | live | catalog, shadows, bootstrap-figma |
| catalog | `figma-bootstrap-spacer` | shadcn-registry | blueprint | live | catalog, spacer, bootstrap-figma |
| catalog | `figma-bootstrap-typography` | shadcn-registry | blueprint | live | catalog, typography, bootstrap-figma |
| catalog | `figma-m3-badges` | shadcn-registry | blueprint | live | figma-kit, material-figma, mui, material3, badges, material-3-—-badges |
| catalog | `figma-m3-bottom-app-bars` | shadcn-registry | blueprint | live | figma-kit, material-figma, mui, material3, bottom-app-bars, material-3-—-bottom-app-bars |
| catalog | `figma-m3-bottom-sheets` | shadcn-registry | blueprint | live | figma-kit, material-figma, mui, material3, bottom-sheets, material-3-—-bottom-sheets |
| catalog | `figma-m3-buttons` | shadcn-registry | blueprint | live | figma-kit, material-figma, mui, material3, buttons, material-3-—-buttons |
| catalog | `figma-m3-cards` | shadcn-registry | blueprint | live | figma-kit, material-figma, mui, material3, cards, material-3-—-cards |
| catalog | `figma-m3-carousel` | shadcn-registry | blueprint | live | figma-kit, material-figma, mui, material3, carousel, material-3-—-carousel |
| catalog | `figma-m3-checkboxes` | shadcn-registry | blueprint | live | figma-kit, material-figma, mui, material3, checkboxes, material-3-—-checkboxes |
| catalog | `figma-m3-chips` | shadcn-registry | blueprint | live | figma-kit, material-figma, mui, material3, chips, material-3-—-chips |
| catalog | `figma-m3-color` | shadcn-registry | blueprint | live | figma-kit, material-figma, mui, material3, color, material-3-—-color-guidance |
| catalog | `figma-m3-date-picker` | shadcn-registry | blueprint | live | figma-kit, material-figma, mui, material3, date-picker, material-3-—-date-picker |
| catalog | `figma-m3-dialogs` | shadcn-registry | blueprint | live | figma-kit, material-figma, mui, material3, dialogs, material-3-—-dialogs |
| catalog | `figma-m3-dividers` | shadcn-registry | blueprint | live | figma-kit, material-figma, mui, material3, dividers, material-3-—-dividers |
| catalog | `figma-m3-elements` | shadcn-registry | blueprint | live | figma-kit, material-figma, mui, material3, elements, material-3-—-elements |
| catalog | `figma-m3-elevation` | shadcn-registry | blueprint | live | figma-kit, material-figma, mui, material3, elevation, material-3-—-elevation |
| catalog | `figma-m3-fabs` | shadcn-registry | blueprint | live | figma-kit, material-figma, mui, material3, fabs, material-3-—-fabs |
| catalog | `figma-m3-icon-buttons` | shadcn-registry | blueprint | live | figma-kit, material-figma, mui, material3, icon-buttons, material-3-—-icon-buttons |
| catalog | `figma-m3-layout` | shadcn-registry | blueprint | live | figma-kit, material-figma, mui, material3, layout, material-3-—-layout |
| catalog | `figma-m3-lists` | shadcn-registry | blueprint | live | figma-kit, material-figma, mui, material3, lists, material-3-—-lists |
| catalog | `figma-m3-menu` | shadcn-registry | blueprint | live | figma-kit, material-figma, mui, material3, menu, material-3-—-menu |
| catalog | `figma-m3-navigation-bars` | shadcn-registry | blueprint | live | figma-kit, material-figma, mui, material3, navigation-bars, material-3-—-navigation-bars |
| catalog | `figma-m3-navigation-drawer` | shadcn-registry | blueprint | live | figma-kit, material-figma, mui, material3, navigation-drawer, material-3-—-navigation-drawer |
| catalog | `figma-m3-navigation-rails` | shadcn-registry | blueprint | live | figma-kit, material-figma, mui, material3, navigation-rails, material-3-—-navigation-rails |
| catalog | `figma-m3-progress` | shadcn-registry | blueprint | live | figma-kit, material-figma, mui, material3, progress, material-3-—-progress-indicators |
| catalog | `figma-m3-radio` | shadcn-registry | blueprint | live | figma-kit, material-figma, mui, material3, radio, material-3-—-radio-buttons |
| catalog | `figma-m3-search` | shadcn-registry | blueprint | live | figma-kit, material-figma, mui, material3, search, material-3-—-search |
| catalog | `figma-m3-segmented-buttons` | shadcn-registry | blueprint | live | figma-kit, material-figma, mui, material3, segmented-buttons, material-3-—-segmented-buttons |
| catalog | `figma-m3-side-sheets` | shadcn-registry | blueprint | live | figma-kit, material-figma, mui, material3, side-sheets, material-3-—-side-sheets |
| catalog | `figma-m3-sliders` | shadcn-registry | blueprint | live | figma-kit, material-figma, mui, material3, sliders, material-3-—-sliders |
| catalog | `figma-m3-snackbars` | shadcn-registry | blueprint | live | figma-kit, material-figma, mui, material3, snackbars, material-3-—-snackbars |
| catalog | `figma-m3-switch` | shadcn-registry | blueprint | live | figma-kit, material-figma, mui, material3, switch, material-3-—-switch |
| catalog | `figma-m3-tabs` | shadcn-registry | blueprint | live | figma-kit, material-figma, mui, material3, tabs, material-3-—-tabs |
| catalog | `figma-m3-time-picker` | shadcn-registry | blueprint | live | figma-kit, material-figma, mui, material3, time-picker, material-3-—-time-picker |
| catalog | `figma-m3-toc` | shadcn-registry | blueprint | live | figma-kit, material-figma, mui, material3, toc, material-3-—-table-of-contents |
| catalog | `figma-m3-tooltips` | shadcn-registry | blueprint | live | figma-kit, material-figma, mui, material3, tooltips, material-3-—-tooltips |
| catalog | `figma-m3-top-app-bars` | shadcn-registry | blueprint | live | figma-kit, material-figma, mui, material3, top-app-bars, material-3-—-top-app-bars |
| catalog | `figma-m3-typography` | shadcn-registry | blueprint | live | figma-kit, material-figma, mui, material3, typography, material-3-—-typography |
| catalog | `figma-myna-avatar` | shadcn-registry | blueprint | live | catalog, avatar, tailwind-figma, myna |
| catalog | `figma-myna-badge` | shadcn-registry | blueprint | live | catalog, badge, tailwind-figma, myna |
| catalog | `figma-myna-card` | shadcn-registry | blueprint | live | catalog, card, tailwind-figma, myna |
| catalog | `figma-myna-carousel` | shadcn-registry | blueprint | live | catalog, carousel, tailwind-figma, myna |
| catalog | `figma-myna-components` | shadcn-registry | blueprint | live | figma-kit, tailwind-figma, myna, shadcn, components, myna-ui-tailwind/shadcn-components-gallery |
| catalog | `figma-myna-hover-card` | shadcn-registry | blueprint | live | catalog, hover-card, tailwind-figma, myna |
| catalog | `figma-myna-scrollbar` | shadcn-registry | blueprint | live | catalog, scrollbar, tailwind-figma, myna |
| catalog | `figma-myna-separator` | shadcn-registry | blueprint | live | catalog, separator, tailwind-figma, myna |
| catalog | `figma-tailgrids-alerts` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, alerts, danger-alert, catalog |
| catalog | `figma-tailgrids-atoms` | shadcn-registry | blueprint | live | figma-kit, tailwind-figma, tailgrids, atoms, tailwind-tailgrids-atom/molecule-board |
| catalog | `figma-tailgrids-avatars` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, avatars, avatar, catalog |
| catalog | `figma-tailgrids-badges` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, badges, badges, catalog |
| catalog | `figma-tailgrids-banner` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, banner, banner, catalog |
| catalog | `figma-tailgrids-blogs` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, blogs, blogs, catalog |
| catalog | `figma-tailgrids-brands` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, brands, brands, catalog |
| catalog | `figma-tailgrids-buttons` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, buttons, button, catalog |
| catalog | `figma-tailgrids-calendars` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, calendars, calendars, catalog |
| catalog | `figma-tailgrids-cards` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, cards, cards, catalog |
| catalog | `figma-tailgrids-checkout` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, checkout, checkout, catalog |
| catalog | `figma-tailgrids-colors` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, colors, colors, catalog |
| catalog | `figma-tailgrids-contacts` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, contacts, contacts, catalog |
| catalog | `figma-tailgrids-cookies` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, cookies, cookies, catalog |
| catalog | `figma-tailgrids-data-stats` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, data-stats, data-stats, catalog |
| catalog | `figma-tailgrids-drawers` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, drawers, drawers, catalog |
| catalog | `figma-tailgrids-e-commerce-footers` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, e-commerce-footers, e-commerce-footers, catalog |
| catalog | `figma-tailgrids-e-commerce-headers` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, e-commerce-headers, e-commerce-headers-hero-areas, catalog |
| catalog | `figma-tailgrids-e-commerce-navbars` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, e-commerce-navbars, ecommerce-navbars, catalog |
| catalog | `figma-tailgrids-featured-products` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, featured-products, featured-products, catalog |
| catalog | `figma-tailgrids-features-services` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, features-services, features-services, catalog |
| catalog | `figma-tailgrids-filters` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, filters, filters, catalog |
| catalog | `figma-tailgrids-footers` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, footers, footers, catalog |
| catalog | `figma-tailgrids-icons` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, icons, icons, catalog |
| catalog | `figma-tailgrids-layout` | shadcn-registry | blueprint | live | figma-kit, tailwind-figma, tailgrids, layout, tailwind-tailgrids-layout-grid |
| catalog | `figma-tailgrids-list` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, list, list, catalog |
| catalog | `figma-tailgrids-maps` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, maps, maps, catalog |
| catalog | `figma-tailgrids-newsletters` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, newsletters, newsletters, catalog |
| catalog | `figma-tailgrids-notifications` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, notifications, notifications, catalog |
| catalog | `figma-tailgrids-order-summaries` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, order-summaries, order-summaries, catalog |
| catalog | `figma-tailgrids-page-titles` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, page-titles, page-title-styles, catalog |
| catalog | `figma-tailgrids-pagination` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, pagination, pagination, catalog |
| catalog | `figma-tailgrids-popovers` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, popovers, popovers, catalog |
| catalog | `figma-tailgrids-portfolio` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, portfolio, portfolios, catalog |
| catalog | `figma-tailgrids-pricing-tables` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, pricing-tables, pricing-tables, catalog |
| catalog | `figma-tailgrids-product-carousels` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, product-carousels, product-carousels, catalog |
| catalog | `figma-tailgrids-product-categories` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, product-categories, product-categories, catalog |
| catalog | `figma-tailgrids-product-details` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, product-details, product-details, catalog |
| catalog | `figma-tailgrids-product-grids` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, product-grids, product-grids, catalog |
| catalog | `figma-tailgrids-product-reviews` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, product-reviews, product-reviews, catalog |
| catalog | `figma-tailgrids-profiles` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, profiles, profiles, catalog |
| catalog | `figma-tailgrids-progress-bars` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, progress-bars, progress-bars, catalog |
| catalog | `figma-tailgrids-quick-views` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, quick-views, quick-views, catalog |
| catalog | `figma-tailgrids-recent-products` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, recent-products, recent-products, catalog |
| catalog | `figma-tailgrids-shadows` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, shadows, shadows, catalog |
| catalog | `figma-tailgrids-shopping-carts` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, shopping-carts, shopping-carts, catalog |
| catalog | `figma-tailgrids-stats` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, stats, stats, catalog |
| catalog | `figma-tailgrids-steps` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, steps, steps, catalog |
| catalog | `figma-tailgrids-teams` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, teams, teams, catalog |
| catalog | `figma-tailgrids-testimonials` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, testimonials, testimonials, catalog |
| catalog | `figma-tailgrids-tooltips` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, tooltips, tooltip, catalog |
| catalog | `figma-tailgrids-typography` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, typography, typography, catalog |
| catalog | `figma-tailgrids-videos` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, videos, videos, catalog |
| catalog | `figma-tailgrids-wishlists` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, wishlists, wishlists, catalog |
| catalog | `figma-heroui-avatar` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, avatar, avatar, component |
| catalog | `figma-heroui-avatar-group` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, avatar-group, avatar-group, component |
| catalog | `figma-heroui-badge` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, badge, badge, component |
| catalog | `figma-heroui-card` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, card, card, component |
| catalog | `figma-heroui-carousel` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, carousel, carousel, component |
| catalog | `figma-heroui-chip` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, chip, chip, component |
| catalog | `figma-heroui-theme` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, theme, theme, component |
| catalog | `figma-heroui-user` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, user, user, component |
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
| charts | `figma-tailgrids-charts` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, charts, charts, charts |
| charts | `tailadmin-line-chart` | tailadmin-react | source | live | charts, chart, line, analytics, dataviz |
| chat | `shadcn-chat` | shadcn-registry | blueprint | live | chat, assistant, conversation, thread |
| chat | `shadcn-chat-inbox` | shadcn-registry | blueprint | live | chat, assistant, inbox, threads, conversation |
| chat | `shadcn-chat-sidecar` | shadcn-registry | blueprint | live | chat, assistant, sidecar, conversation, copilot |
| chat | `shadcn-chat-support` | shadcn-registry | blueprint | live | chat, assistant, support, triage, ticket, conversation |
| chat | `spectrum-ai-chat` | react-spectrum | source | live | chat, assistant |
| chat | `figma-tailgrids-chat-boxes` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, chat-boxes, chat-boxes, chat |
| chat | `figma-tailgrids-chat-list` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, chat-list, chat-lists, chat |
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
| empty | `figma-tailgrids-error-pages` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, error-pages, error-pages, empty |
| empty | `flowbite-500` | flowbite-admin | source | live | empty, 500, server-error, error |
| empty | `windmill-404` | windmill-react | source | live | empty, 404, not-found, error |
| empty | `flowbite-maintenance` | flowbite-admin | source | live | empty, maintenance, downtime, status |
| empty | `windmill-blank` | windmill-react | source | live | empty, blank, starter |
| form | `shadcn-form` | shadcn-registry | blueprint | live | form, form-app, input, fields, create, edit |
| form | `shadcn-form-invite` | shadcn-registry | blueprint | live | form, form-app, invite, invite-teammate |
| form | `untitled-date-picker` | untitled-ui-react | source | live | form, input, date, date-range, calendar, picker |
| form | `tailadmin-form-elements` | tailadmin-react | source | live | form, form-app, input, fields, controls |
| form | `untitled-file-upload` | untitled-ui-react | source | live | form, input, upload, attachments, dropzone, files |
| form | `windmill-forms` | windmill-react | source | live | form, form-app, input, fields, validation |
| form | `figma-bootstrap-button-group` | shadcn-registry | blueprint | live | form, button-group, bootstrap-figma |
| form | `figma-bootstrap-dropdown` | shadcn-registry | blueprint | live | form, dropdown, bootstrap-figma |
| form | `figma-bootstrap-form-inputs` | shadcn-registry | blueprint | live | form, fields, input, bootstrap-figma |
| form | `figma-bootstrap-forms` | shadcn-registry | blueprint | live | figma-kit, bootstrap-figma, bootstrap, forms, bootstrap-5-forms-page |
| form | `figma-bootstrap-input-group` | shadcn-registry | blueprint | live | form, input-group, bootstrap-figma |
| form | `figma-bootstrap-modal` | shadcn-registry | blueprint | live | overlay, modal, bootstrap-figma |
| form | `figma-bootstrap-popovers` | shadcn-registry | blueprint | live | overlay, popover, bootstrap-figma |
| form | `figma-bootstrap-tooltips` | shadcn-registry | blueprint | live | form, tooltip, bootstrap-figma |
| form | `figma-m3-text-fields` | shadcn-registry | blueprint | live | figma-kit, material-figma, mui, material3, text-fields, material-3-—-text-fields |
| form | `figma-myna-alert-dialog` | shadcn-registry | blueprint | live | overlay, dialog, tailwind-figma, myna |
| form | `figma-myna-buttons` | shadcn-registry | blueprint | live | form, button, tailwind-figma, myna |
| form | `figma-myna-calendar` | shadcn-registry | blueprint | live | form, calendar, tailwind-figma, myna |
| form | `figma-myna-checkbox` | shadcn-registry | blueprint | live | form, checkbox, tailwind-figma, myna |
| form | `figma-myna-combobox` | shadcn-registry | blueprint | live | form, combobox, tailwind-figma, myna |
| form | `figma-myna-command` | shadcn-registry | blueprint | live | form, command, tailwind-figma, myna |
| form | `figma-myna-context-menu` | shadcn-registry | blueprint | live | form, menu, tailwind-figma, myna |
| form | `figma-myna-dialog` | shadcn-registry | blueprint | live | overlay, dialog, tailwind-figma, myna |
| form | `figma-myna-drawer` | shadcn-registry | blueprint | live | overlay, drawer, tailwind-figma, myna |
| form | `figma-myna-dropdown-menu` | shadcn-registry | blueprint | live | form, menu, tailwind-figma, myna |
| form | `figma-myna-input` | shadcn-registry | blueprint | live | form, input, tailwind-figma, myna |
| form | `figma-myna-input-groups` | shadcn-registry | blueprint | live | form, input, tailwind-figma, myna |
| form | `figma-myna-input-otp` | shadcn-registry | blueprint | live | form, input-otp, tailwind-figma, myna |
| form | `figma-myna-label` | shadcn-registry | blueprint | live | form, label, tailwind-figma, myna |
| form | `figma-myna-popover` | shadcn-registry | blueprint | live | overlay, popover, tailwind-figma, myna |
| form | `figma-myna-radio` | shadcn-registry | blueprint | live | form, radio, tailwind-figma, myna |
| form | `figma-myna-select` | shadcn-registry | blueprint | live | form, select, tailwind-figma, myna |
| form | `figma-myna-sheet` | shadcn-registry | blueprint | live | overlay, sheet, tailwind-figma, myna |
| form | `figma-myna-slider` | shadcn-registry | blueprint | live | form, slider, tailwind-figma, myna |
| form | `figma-myna-switch` | shadcn-registry | blueprint | live | form, switch, tailwind-figma, myna |
| form | `figma-myna-textarea` | shadcn-registry | blueprint | live | form, textarea, tailwind-figma, myna |
| form | `figma-myna-toggle` | shadcn-registry | blueprint | live | form, toggle, tailwind-figma, myna |
| form | `figma-myna-tooltip` | shadcn-registry | blueprint | live | form, tooltip, tailwind-figma, myna |
| form | `figma-tailgrids-button-group` | shadcn-registry | blueprint | live | form, button-group, tailwind-figma, tailgrids |
| form | `figma-tailgrids-check-box` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, check-box, check-box, form |
| form | `figma-tailgrids-dropdowns` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, dropdowns, dropdown, form |
| form | `figma-tailgrids-form-elements` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, form-elements, form-elements, form |
| form | `figma-tailgrids-inputs` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, inputs, input, form |
| form | `figma-tailgrids-select-box` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, select-box, select-box, form |
| form | `figma-tailgrids-textarea` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, textarea, textarea, form |
| form | `figma-tailgrids-toggle-switchers` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, toggle-switchers, toggle-with-text, form |
| form | `untitled-modals` | untitled-ui-react | source | live | overlay, modal, dialog |
| form | `figma-heroui-button` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, button, button, component |
| form | `figma-heroui-button-group` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, button-group, buttongroup, component |
| form | `figma-heroui-calendar` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, calendar, calendar, component |
| form | `figma-heroui-checkbox` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, checkbox, checkbox, component |
| form | `figma-heroui-checkbox-group` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, checkbox-group, checkbox-group, component |
| form | `figma-heroui-code` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, code, code, component |
| form | `figma-heroui-components` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, components, components, component |
| form | `figma-heroui-divider` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, divider, divider, component |
| form | `figma-heroui-input` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, input, input, component |
| form | `figma-heroui-input-otp` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, input-otp, input-otp, component |
| form | `figma-heroui-kbd` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, kbd, kbd, component |
| form | `figma-heroui-number-input` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, number-input, number-input, component |
| form | `figma-heroui-radio` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, radio, radio, component |
| form | `figma-heroui-select` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, select, select, component |
| form | `figma-heroui-slider` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, slider, slider, component |
| form | `figma-heroui-switch` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, switch, switch, component |
| form | `figma-heroui-tooltip` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, tooltip, tooltip, component |
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
| marketing | `shadcn-marketing` | shadcn-registry | blueprint | live | marketing, landing, pricing |
| marketing | `figma-bootstrap-thumbnail` | shadcn-registry | blueprint | live | marketing, cover, bootstrap-figma |
| marketing | `figma-bootstrap-welcome` | shadcn-registry | blueprint | live | marketing, welcome, bootstrap-figma |
| marketing | `figma-heroui-v3-cover` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, v3-cover, welcome, cover |
| marketing | `figma-heroui-welcome` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, welcome, welcome, cover |
| marketing | `figma-m3-cover` | shadcn-registry | blueprint | live | figma-kit, material-figma, mui, material3, cover, material-3-design-kit-cover-(mui-/-material-ui-target) |
| marketing | `figma-tailgrids-cover` | shadcn-registry | blueprint | live | figma-kit, tailwind-figma, tailgrids, cover, tailwind-tailgrids-cover |
| marketing | `heroui-home` | heroui | source | live | marketing, landing, heroui, home |
| marketing | `figma-tailgrids-about` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, about, about, marketing |
| marketing | `figma-tailgrids-cta` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, cta, cta, marketing |
| marketing | `figma-tailgrids-faq` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, faq, faq, marketing |
| marketing | `figma-tailgrids-header-hero-area` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, header-hero-area, header-hero-area, marketing |
| marketing | `heroui-about` | heroui | source | live | marketing, about, heroui |
| marketing | `figma-heroui-cover` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, cover, cover, component |
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
| queue | `shadcn-operate-decide` | shadcn-registry | blueprint | live | queue, worklist, triage, decide, decide-queue, sled, pursue, inbox, datagrid |
| queue | `untitled-table` | untitled-ui-react | source | live | queue, crud, table, records, datagrid |
| queue | `shadcn-queue` | shadcn-registry | blueprint | live | queue, worklist, triage, inbox, datagrid |
| queue | `tailadmin-tables` | tailadmin-react | source | live | queue, crud, table, records, datagrid |
| queue | `windmill-tables` | windmill-react | source | live | queue, crud, table, records, datagrid |
| queue | `figma-bootstrap-pagination` | shadcn-registry | blueprint | live | queue, pagination, bootstrap-figma |
| queue | `figma-bootstrap-tables` | shadcn-registry | blueprint | live | queue, table, bootstrap-figma |
| queue | `figma-myna-data-table` | shadcn-registry | blueprint | live | queue, table, tailwind-figma, myna |
| queue | `figma-myna-pagination` | shadcn-registry | blueprint | live | queue, pagination, tailwind-figma, myna |
| queue | `figma-myna-table` | shadcn-registry | blueprint | live | queue, table, tailwind-figma, myna |
| queue | `figma-tailgrids-table-grids` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, table-grids, table-grids, queue |
| queue | `figma-tailgrids-table-stack` | shadcn-registry | blueprint | live | figma-kit, tailwind-figma, tailgrids, table-stack, tailwind-tailgrids-table-stack-list |
| queue | `figma-tailgrids-table-stacks` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, table-stacks, table-stacks, queue |
| queue | `figma-tailgrids-tables` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, tables, tables, queue |
| queue | `flowbite-users` | flowbite-admin | source | live | queue, crud, table, records, users, admin |
| queue | `figma-heroui-table` | shadcn-registry | blueprint | live | heroui-figma, figma-kit, table, table, component |
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
| settings | `figma-tailgrids-settings-pages` | shadcn-registry | blueprint | live | tailwind-figma, tailgrids, settings-pages, pro-components, settings |
| tabs | `untitled-tabs` | untitled-ui-react | source | live | tabs, sections, segmented, workspace-tabs, section-tabs |
| weekly-board | `shadcn-weekly-board` | shadcn-registry | blueprint | live | weekly-board, board, cadence, report-out, standup, kanban, elt |
| wizard | `shadcn-wizard` | shadcn-registry | blueprint | live | wizard, stepper, multi-step, onboarding |

600 rows, 2 of them retired. Required screen coverage: dashboard, marketing, auth, checkout, app-shell, crud, queue, record, chat, settings, wizard, empty, command-palette, lex-record.

## Retired rows — do not cite

- `mantine-appshell` — shadcn is the house source: both Clearspeed consumers are shadcn/Tailwind repos, so a reference on another kit's runtime cannot be built against; shadcn covers app-shell (shadcn-sidebar-07)
- `tremor-charts` — shadcn is the house kit; shadcn-chart-area-interactive is the chart-led page reference and the corpus carries 70 shadcn chart component packs alongside it

