# Redesign this Operate surface

**Default agent path** for ClearSpeed Operate queues (Nucleus / Sled Capture):  
**cite → measure → denoise-loop → prove**. Not an audit pack. Not craft-only polish.

Edition: `clearspeed-operate`. Sibling cites before catalog fashion  
(`knowledge/editions/clearspeed-operate/siblings.json` · [`edition-siblings.md`](./edition-siblings.md)).

## Commands

```sh
# 1 Cite — product sibling → preferred cite + kit
node core/edition-siblings.mjs resolve \
  --category queue \
  --job "Decide Pursue/Review/Dismiss on the next notice"

# 2 Measure — name the defects (cta-pressure, dual-focal, kpi-soup, …)
node verify/measure.mjs <artifact.html> --cite <preferredCite> --lane saas

# 3–4 Denoise-loop + prove (hosts packet → apply → Critic≠Actor ≤3 rounds → prove)
node verify/denoise-loop.mjs \
  --html <artifact.html> [--tsx <file.tsx>] \
  --cite <preferredCite> \
  --edition clearspeed-operate \
  --category queue \
  --job "<Monday job>" \
  --out /tmp/shine-operate-denoise \
  --prove
```

Stop on `status=passed`, `namedDenoiseCleared=true`, `reflexionVerdict=done`, and a FAIL→PASS **crop** (twin full-page shots are invalid).

Skill entry: `skill/SKILL.md` · loop detail: `skill/references/denoise.md` · golden: [`denoise-golden-prove.md`](./denoise-golden-prove.md).
