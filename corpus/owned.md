# Owned paid templates

Checked Atlas vault and `~/.untitledui/config.json` on 2026-08-25.

No items matching MUI Store, AdminLTE, PrimeTek, ThemeForest, Haze, Creative Tim,
or Untitled UI; no local Untitled UI CLI login exists.

**No owned ingest.** Paid kits stay query-only (`corpus/query-only.json` +
`~/design-corpus/query-only/` screenshots). Do not clone their source.

If a license is added to Atlas later, drop the product under
`~/design-corpus/owned/<name>/` with a `manifest.json` row and re-run
`node corpus/index-templates.mjs`.

Untitled UI's public React repository is MIT and lives in
`~/design-corpus/untitled-ui-react`. Its PRO page examples stay out of this public
repo unless a valid license is present, and then belong under `owned/` rather than
in a published `corpus/packs/` payload.
