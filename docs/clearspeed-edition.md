# ClearSpeed Shine edition

Private overlay that keeps the skill name **Shine** and injects the Clearspeed /
Nucleus application profile. Validated by `verify/edition.mjs`.

## Layout

```text
~/.local/share/shine/
  releases/<baseSha>/          # immutable base (scripts/release.mjs)
  current -> releases/<baseSha>
  editions/<baseSha>-clearspeed-<profileHash12>/
    clearspeed-edition.json
    skill/                     # SKILL.md = base + profile instructions
    * -> ../../releases/<baseSha>/*   # runtime symlinks
  editions/clearspeed-current -> editions/<…>
  dist/shine-clearspeed-<sha7>-<profileHash12>.tgz
```

Agent skill symlinks (`~/.cursor|claude|agents/skills/shine`) must resolve to
**`editions/…/skill`**, not the bare release.

## Studio install (online)

```sh
# from a clean main checkout
node scripts/release.mjs
node scripts/install-clearspeed-edition.mjs --hooks
# optional: python3 scripts/distribute.py link  # preserves a validated edition
cd "$(realpath ~/.cursor/skills/shine)/.." && npm run doctor
```

## Portable offline package

```sh
node scripts/package-clearspeed-edition.mjs
# writes ~/.local/share/shine/dist/shine-clearspeed-….tgz
# and mirrors to ~/Projects/shine-dist/
```

Laptop (no network once the archive is on disk):

```sh
tar -xzf shine-clearspeed-<sha7>-<profileHash12>.tgz
node shine-clearspeed-<sha7>-<profileHash12>/install.mjs
```

## Nucleus Company Tools

`company-tools/packages/shine.zip` remains the **generic** attested source package
(`distribute.py prepare`). ClearSpeed agents still rebuild/link the edition after
installing that base (or use the offline `.tgz`). Receipt for the offline bundle:
`company-tools/releases/shine-clearspeed.json` (points at Studio `shine-dist/`; the
`.tgz` itself is not stored in git).

## Brand palette

**Authority:** Claude Design → `clearspeed-brand` plugin (narrative/visual). Shine’s
ClearSpeed **machine** seam is `skill/references/clearspeed/brand.json` → Signal Orange
`#ED5925` (hover `#D24A1B`). Emit the writer kit with `node scripts/sync-tokens.mjs`
(`brand-tokens.json`). See `docs/clearspeed-brand-tokens.md` (S7 — old plugin
`sync-tokens.mjs` dead-path generator is retired).

`install-clearspeed-edition.mjs` materializes `edition/tokens` (not a base symlink) and
runs `scripts/apply-clearspeed-brand.mjs` so the edition tree carries Clearspeed orange
instead of the public placeholder indigo. The base release `tokens/` lane stays
placeholder on purpose; only the private edition is recolored. `verify/edition.mjs`
fails closed if `#4338ca` remains or `#ED5925` is missing from the profile / edition
tokens.

See `docs/nucleus-attach.md` and `docs/distribution-dod.md`.
