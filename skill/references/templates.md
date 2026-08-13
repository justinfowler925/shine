# Templates — start from a real page

**catalog cite required.** Inventing a page is a Critical completeness hole.
Pick a row, copy its structure, shine-paint. Never clone vendor pixels.
Generated from `corpus/templates.json` — do not hand-edit; run `node corpus/index-templates.mjs`.

## Default start-from

| Screen | Id | Kit | Path |
|---|---|---|---|
| dashboard | `tremor-dashboard` | tremor | `tremor/src/components` |
| marketing | `mui-marketing-page` | mui-material | `mui-material/docs/data/material/getting-started/templates/marketing-page` |
| auth | `mui-sign-in-side` | mui-material | `mui-material/docs/data/material/getting-started/templates/sign-in-side` |
| checkout | `mui-checkout` | mui-material | `mui-material/docs/data/material/getting-started/templates/checkout` |
| app-shell | `shadcn-sidebar-07` | shadcn-registry | `shadcn-registry/items/sidebar-07.json` |
| crud | `mui-crud-dashboard` | mui-material | `mui-material/docs/data/material/getting-started/templates/crud-dashboard` |

First match by `startFrom` wins unless the user names another id.

## How to cite

```
Template: mui-crud-dashboard
Path: mui-material/docs/data/material/getting-started/templates/crud-dashboard
Paint: shine tokens. Structure cloned; Material purple is not.
```

No row for this screen → `inspiration.md` (fill the catalog) then build. Do not invent.

## Full catalog

| Id | Screen | Rank | Kit | Kind | Path |
|---|---|---|---|---|---|
| `shadcn-sidebar-07` | app-shell | 1 | shadcn-registry | source | `shadcn-registry/items/sidebar-07.json` |
| `mui-dashboard` | app-shell | 2 | mui-material | source | `mui-material/docs/data/material/getting-started/templates/dashboard` |
| `antd-pro-app` | app-shell | 3 | ant-design-pro | source | `ant-design-pro/src` |
| `heroui-next-app` | app-shell | 4 | heroui | source | `heroui-next-app` |
| `chakra-compositions` | app-shell | 5 | chakra-ui | source | `chakra-ui/apps/compositions` |
| `shadcn-sidebar-01` | app-shell | 11 | shadcn-registry | source | `shadcn-registry/items/sidebar-01.json` |
| `shadcn-sidebar-02` | app-shell | 12 | shadcn-registry | source | `shadcn-registry/items/sidebar-02.json` |
| `shadcn-sidebar-03` | app-shell | 13 | shadcn-registry | source | `shadcn-registry/items/sidebar-03.json` |
| `shadcn-sidebar-04` | app-shell | 14 | shadcn-registry | source | `shadcn-registry/items/sidebar-04.json` |
| `shadcn-sidebar-05` | app-shell | 15 | shadcn-registry | source | `shadcn-registry/items/sidebar-05.json` |
| `shadcn-sidebar-06` | app-shell | 16 | shadcn-registry | source | `shadcn-registry/items/sidebar-06.json` |
| `shadcn-sidebar-08` | app-shell | 18 | shadcn-registry | source | `shadcn-registry/items/sidebar-08.json` |
| `shadcn-sidebar-09` | app-shell | 19 | shadcn-registry | source | `shadcn-registry/items/sidebar-09.json` |
| `shadcn-sidebar-10` | app-shell | 20 | shadcn-registry | source | `shadcn-registry/items/sidebar-10.json` |
| `shadcn-sidebar-11` | app-shell | 21 | shadcn-registry | source | `shadcn-registry/items/sidebar-11.json` |
| `shadcn-sidebar-12` | app-shell | 22 | shadcn-registry | source | `shadcn-registry/items/sidebar-12.json` |
| `shadcn-sidebar-13` | app-shell | 23 | shadcn-registry | source | `shadcn-registry/items/sidebar-13.json` |
| `shadcn-sidebar-14` | app-shell | 24 | shadcn-registry | source | `shadcn-registry/items/sidebar-14.json` |
| `shadcn-sidebar-15` | app-shell | 25 | shadcn-registry | source | `shadcn-registry/items/sidebar-15.json` |
| `shadcn-sidebar-16` | app-shell | 26 | shadcn-registry | source | `shadcn-registry/items/sidebar-16.json` |
| `query-mui-store` | app-shell | 90 | mui-store | query-only | `query-only/query-mui-store.png` |
| `query-adminlte` | app-shell | 91 | adminlte | query-only | `query-only/query-adminlte.png` |
| `query-primeblocks` | app-shell | 92 | primeblocks | query-only | `query-only/query-primeblocks.png` |
| `mui-sign-in-side` | auth | 1 | mui-material | source | `mui-material/docs/data/material/getting-started/templates/sign-in-side` |
| `shadcn-login-04` | auth | 2 | shadcn-registry | source | `shadcn-registry/items/login-04.json` |
| `mui-sign-in` | auth | 3 | mui-material | source | `mui-material/docs/data/material/getting-started/templates/sign-in` |
| `mui-sign-up` | auth | 4 | mui-material | source | `mui-material/docs/data/material/getting-started/templates/sign-up` |
| `shadcn-login-01` | auth | 10 | shadcn-registry | source | `shadcn-registry/items/login-01.json` |
| `shadcn-login-02` | auth | 10 | shadcn-registry | source | `shadcn-registry/items/login-02.json` |
| `shadcn-login-03` | auth | 10 | shadcn-registry | source | `shadcn-registry/items/login-03.json` |
| `shadcn-login-05` | auth | 10 | shadcn-registry | source | `shadcn-registry/items/login-05.json` |
| `shadcn-signup-01` | auth | 11 | shadcn-registry | source | `shadcn-registry/items/signup-01.json` |
| `shadcn-signup-02` | auth | 11 | shadcn-registry | source | `shadcn-registry/items/signup-02.json` |
| `shadcn-signup-03` | auth | 11 | shadcn-registry | source | `shadcn-registry/items/signup-03.json` |
| `shadcn-signup-04` | auth | 11 | shadcn-registry | source | `shadcn-registry/items/signup-04.json` |
| `shadcn-signup-05` | auth | 11 | shadcn-registry | source | `shadcn-registry/items/signup-05.json` |
| `mui-blog` | blog | 1 | mui-material | source | `mui-material/docs/data/material/getting-started/templates/blog` |
| `shadcn-chart-area-axes` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-area-axes.json` |
| `shadcn-chart-area-default` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-area-default.json` |
| `shadcn-chart-area-gradient` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-area-gradient.json` |
| `shadcn-chart-area-icons` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-area-icons.json` |
| `shadcn-chart-area-interactive` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-area-interactive.json` |
| `shadcn-chart-area-legend` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-area-legend.json` |
| `shadcn-chart-area-linear` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-area-linear.json` |
| `shadcn-chart-area-stacked` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-area-stacked.json` |
| `shadcn-chart-area-stacked-expand` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-area-stacked-expand.json` |
| `shadcn-chart-area-step` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-area-step.json` |
| `shadcn-chart-bar-active` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-bar-active.json` |
| `shadcn-chart-bar-default` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-bar-default.json` |
| `shadcn-chart-bar-horizontal` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-bar-horizontal.json` |
| `shadcn-chart-bar-interactive` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-bar-interactive.json` |
| `shadcn-chart-bar-label` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-bar-label.json` |
| `shadcn-chart-bar-label-custom` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-bar-label-custom.json` |
| `shadcn-chart-bar-mixed` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-bar-mixed.json` |
| `shadcn-chart-bar-multiple` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-bar-multiple.json` |
| `shadcn-chart-bar-negative` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-bar-negative.json` |
| `shadcn-chart-bar-stacked` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-bar-stacked.json` |
| `shadcn-chart-line-default` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-line-default.json` |
| `shadcn-chart-line-dots` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-line-dots.json` |
| `shadcn-chart-line-dots-colors` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-line-dots-colors.json` |
| `shadcn-chart-line-dots-custom` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-line-dots-custom.json` |
| `shadcn-chart-line-interactive` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-line-interactive.json` |
| `shadcn-chart-line-label` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-line-label.json` |
| `shadcn-chart-line-label-custom` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-line-label-custom.json` |
| `shadcn-chart-line-linear` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-line-linear.json` |
| `shadcn-chart-line-multiple` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-line-multiple.json` |
| `shadcn-chart-line-step` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-line-step.json` |
| `shadcn-chart-pie-donut` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-pie-donut.json` |
| `shadcn-chart-pie-donut-active` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-pie-donut-active.json` |
| `shadcn-chart-pie-donut-text` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-pie-donut-text.json` |
| `shadcn-chart-pie-interactive` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-pie-interactive.json` |
| `shadcn-chart-pie-label` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-pie-label.json` |
| `shadcn-chart-pie-label-custom` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-pie-label-custom.json` |
| `shadcn-chart-pie-label-list` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-pie-label-list.json` |
| `shadcn-chart-pie-legend` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-pie-legend.json` |
| `shadcn-chart-pie-separator-none` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-pie-separator-none.json` |
| `shadcn-chart-pie-simple` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-pie-simple.json` |
| `shadcn-chart-pie-stacked` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-pie-stacked.json` |
| `shadcn-chart-radar-default` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-radar-default.json` |
| `shadcn-chart-radar-dots` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-radar-dots.json` |
| `shadcn-chart-radar-grid-circle` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-radar-grid-circle.json` |
| `shadcn-chart-radar-grid-circle-fill` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-radar-grid-circle-fill.json` |
| `shadcn-chart-radar-grid-circle-no-lines` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-radar-grid-circle-no-lines.json` |
| `shadcn-chart-radar-grid-custom` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-radar-grid-custom.json` |
| `shadcn-chart-radar-grid-fill` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-radar-grid-fill.json` |
| `shadcn-chart-radar-grid-none` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-radar-grid-none.json` |
| `shadcn-chart-radar-icons` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-radar-icons.json` |
| `shadcn-chart-radar-label-custom` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-radar-label-custom.json` |
| `shadcn-chart-radar-legend` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-radar-legend.json` |
| `shadcn-chart-radar-lines-only` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-radar-lines-only.json` |
| `shadcn-chart-radar-multiple` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-radar-multiple.json` |
| `shadcn-chart-radar-radius` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-radar-radius.json` |
| `shadcn-chart-radial-grid` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-radial-grid.json` |
| `shadcn-chart-radial-label` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-radial-label.json` |
| `shadcn-chart-radial-shape` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-radial-shape.json` |
| `shadcn-chart-radial-simple` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-radial-simple.json` |
| `shadcn-chart-radial-stacked` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-radial-stacked.json` |
| `shadcn-chart-radial-text` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-radial-text.json` |
| `shadcn-chart-tooltip-advanced` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-tooltip-advanced.json` |
| `shadcn-chart-tooltip-default` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-tooltip-default.json` |
| `shadcn-chart-tooltip-formatter` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-tooltip-formatter.json` |
| `shadcn-chart-tooltip-icons` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-tooltip-icons.json` |
| `shadcn-chart-tooltip-indicator-line` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-tooltip-indicator-line.json` |
| `shadcn-chart-tooltip-indicator-none` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-tooltip-indicator-none.json` |
| `shadcn-chart-tooltip-label-custom` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-tooltip-label-custom.json` |
| `shadcn-chart-tooltip-label-formatter` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-tooltip-label-formatter.json` |
| `shadcn-chart-tooltip-label-none` | charts | 2 | shadcn-registry | source | `shadcn-registry/items/chart-tooltip-label-none.json` |
| `mui-checkout` | checkout | 1 | mui-material | source | `mui-material/docs/data/material/getting-started/templates/checkout` |
| `mui-crud-dashboard` | crud | 1 | mui-material | source | `mui-material/docs/data/material/getting-started/templates/crud-dashboard` |
| `antd-pro-crud` | crud | 2 | ant-design-pro | source | `ant-design-pro/src/pages` |
| `tremor-dashboard` | dashboard | 1 | tremor | source | `tremor/src/components` |
| `mui-dashboard-analytics` | dashboard | 2 | mui-material | source | `mui-material/docs/data/material/getting-started/templates/dashboard` |
| `shadcn-dashboard-01` | dashboard | 3 | shadcn-registry | source | `shadcn-registry/items/dashboard-01.json` |
| `query-shadcn-blocks` | dashboard | 80 | shadcn-registry | query-only | `query-only/query-shadcn-blocks.png` |
| `query-haze` | dashboard | 90 | haze | query-only | `query-only/query-haze.png` |
| `mui-marketing-page` | marketing | 1 | mui-material | source | `mui-material/docs/data/material/getting-started/templates/marketing-page` |
| `query-mui-free-gallery` | marketing | 80 | mui-material | query-only | `query-only/query-mui-free-gallery.png` |

Indexed 117 templates from /Users/justinfowler/design-corpus.
