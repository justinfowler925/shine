# Owned kits — licensed references that never leave this machine

Shine's public catalog (`corpus/templates.json`) is generated, committed, published on
the site, packaged into the Nucleus archive and mirrored to every local agent. A kit you
paid for — **Tailwind Plus**, Untitled UI PRO, a purchased Figma file — may be used in
the consumers' end products but its source may not be redistributed. So its rows cannot
live in the committed catalog, and its files cannot live in this repository.

They live under `~/design-corpus/owned/<kit>/` and are indexed into
`corpus/templates.owned.json`, which is gitignored, excluded from `git archive` (the
Nucleus package), never copied to the site, and merged at read time by
`corpus/catalog.mjs`. `cite`, the design packet, `measure`, `compare`, `usability` and
`coverage` all read through that loader, so an owned row is selectable, cite-able and
compare-able exactly like a public one. `index-templates.mjs --check` ignores the owned
file, so a machine without the kit still passes the doctor.

## Adding Tailwind Plus

1. Download the templates and Catalyst kit from your Tailwind Plus account into
   `~/design-corpus/owned/tailwind-plus/` (for example `templates/spotlight/`,
   `templates/salient/`, `catalyst/`). Keep the vendor's directory names.
2. Write `~/design-corpus/owned/tailwind-plus/manifest.json` (schema below). Each
   template row points at the rendered page source inside the download, names the
   screen it solves, and carries the jobs a brief would use to reach it. Give every
   Tailwind Plus site template its own `dna.family` (`tw-spotlight`, `tw-salient`, …):
   the family cap allots one shortlist slot per family, and the templates are exactly
   the distinct silhouettes the public catalog lacks.
3. Run `node corpus/index-templates.mjs`. It reports the private rows separately and
   writes `corpus/templates.owned.json`. `node corpus/cite.mjs "marketing landing"`
   should now offer the owned template beside the public rows.
4. Pixel comparison needs a harvested pack at `corpus/packs/<id>/` (shot, source,
   tokens, meta). Packs there are normally committed; an owned pack must not be, so add
   `corpus/packs/tw-*/` to `.git/info/exclude` before running `corpus/capture-local.mjs`
   for the row. Until captured, the row's reference health is `not_tested`: the packet
   reports it and `compare` refuses to compare against nothing.

## Manifest schema

```json
{
  "id": "tailwind-plus",
  "kit": "tailwind-plus",
  "name": "Tailwind Plus (templates + Catalyst)",
  "license": "proprietary",
  "publication": "private-reference-only",
  "source": "https://tailwindcss.com/plus",
  "capturedAt": "2026-09-16",
  "templates": [
    {
      "id": "tw-spotlight-home",
      "screen": "marketing",
      "scope": "page",
      "title": "Tailwind Plus Spotlight — personal site home (intro, articles, newsletter, work)",
      "path": "owned/tailwind-plus/templates/spotlight/src/app/page.tsx",
      "preview": "https://spotlight.tailwindui.com",
      "jobs": ["marketing", "landing", "personal", "portfolio", "editorial"],
      "dna": { "family": "tw-spotlight", "density": "editorial" },
      "reference": { "required": ["navigation"] },
      "startFrom": 1
    }
  ]
}
```

`path` is relative to `~/design-corpus`. Rows missing `id`, `screen`, `title` or `path`,
pointing at a file that is not on disk, or colliding with a public id are reported and
skipped. `kind`, `license` and `publication` are forced to `owned` / `proprietary` /
`private-reference-only` regardless of what the manifest says.

Figma-only kits (like the existing `untitled-ui-free-v2` snapshot) keep their page
metadata and PNG renders in the same directory; without a `templates` array they are
reference material for a human, not catalog rows.

## What stays true

- Nothing under `owned/` is ever committed, packaged, published or symlinked.
- An owned row that appears in a receipt is identified by id and title only; the
  receipt does not embed its source.
- Public rows still win ties: an owned row needs a real job match, not just a license.
