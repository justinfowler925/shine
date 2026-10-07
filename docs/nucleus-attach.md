# Nucleus attach — Shine expert loop

**Audience:** agents and Justin running Shine against Clearspeed Nucleus  
**Fixture:** [`verify/fixtures/nucleus-golden/`](../verify/fixtures/nucleus-golden/)  
**Profile:** [`skill/references/clearspeed/profile-instructions.md`](../skill/references/clearspeed/profile-instructions.md)

## Why this exists

Nucleus checkout is often absent on Cloud Agent VMs. The golden fixture + Clearspeed
profile give a repeatable attach path: audit a Nucleus-shaped surface → diagnose →
(optional) prove — without inventing architecture or needing production credentials.

## Quick start

```sh
# Seeded bloat must fail (CTA / composition / copy heuristics)
node verify/measure.mjs verify/fixtures/nucleus-golden/before.html \
  --cite shadcn-catalog --lane saas

# Expert pass + operable primary job
node verify/measure.mjs verify/fixtures/nucleus-golden/after.html \
  --cite shadcn-catalog --lane saas
node verify/usability.mjs verify/fixtures/nucleus-golden/after.html \
  --contract verify/fixtures/nucleus-golden/shine-usability.json --cite shadcn-catalog

node verify/nucleus-golden.test.mjs
```

### Real-surface-shaped substitute (no SSO)

When `justin-fowler_cspd/nucleus` is 404 / SSO absent, use the SLED Capture fixture distilled
from the Project sled dump — still fail→pass with cropped defects + operable pursue:

```sh
node verify/sled-capture-prove.test.mjs
```

See `docs/sled-capture-prove.md`. Do **not** invent Workspace auth bypasses.

With a real checkout on Justin's machine:

1. Clone `justin-fowler_cspd/nucleus`
2. Copy `consumers.example` → `consumers.local` and add a Nucleus token row (see example)
3. Load Clearspeed edition / profile instructions
4. Packet with `--lane saas --category catalog|queue|settings|…` and `--product-reference`
5. Mandatory prove for Operate cites — compare alone does not finish

## Related

- Audit lesson: `docs/audits/2026-09-16-nucleus-company-tools.md`
- Distribution: `distribution.json` → `consumers.nucleus`
- Live base: `https://nucleus-clearspeed.vercel.app`
