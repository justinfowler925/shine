# Owned paid templates

Checked Atlas vault on 2026-08-12 (`op item list --vault Atlas`, 148 items).

No items matching MUI Store, AdminLTE, PrimeTek, ThemeForest, Haze, or Creative Tim.

**No owned ingest.** Paid kits stay query-only (`corpus/query-only.json` +
`~/design-corpus/query-only/` screenshots). Do not clone their source.

If a license is added to Atlas later, drop the product under
`~/design-corpus/owned/<name>/` with a `manifest.json` row and re-run
`node corpus/index-templates.mjs`.
