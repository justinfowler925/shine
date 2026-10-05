# Nucleus golden fixture

Distilled Company Tools / Operate shell for expert-track attach when a live Nucleus
checkout is unavailable. **No production secrets.**

## Files

| Path | Intent |
|---|---|
| `before.html` | Dual filled primaries + equal KPI card soup + “Welcome to your dashboard” filler |
| `after.html` | Single Install primary, searchable catalog, reversible Clear filters, honest empty |

## Scripted path

```sh
# Fail closed on seeded bloat (CTA pressure + composition detectors as they land)
node verify/measure.mjs verify/fixtures/nucleus-golden/before.html \
  --cite shadcn-catalog --lane saas

# After expert pass
node verify/measure.mjs verify/fixtures/nucleus-golden/after.html \
  --cite shadcn-catalog --lane saas

# Automated fail→pass bite
node verify/nucleus-golden.test.mjs
```

Packet / diagnosis against the fixture (audit mode):

```sh
node core/design-packet.mjs \
  --job "Company Tools: find a package and install it" \
  --lane saas --mode audit --category catalog
```

Proof standard: fail→pass **logs** and cropped defect evidence — not identical
full-page before/after screenshots.
