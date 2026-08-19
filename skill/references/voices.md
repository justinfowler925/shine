# Voices — three legal paints

Shine is a **director**, not a painter. Structure and visual DNA both come from the
cite. House style is a fallback voice, not the only legal paint.

Pick the voice from the **job**, not from habit. Cite prints the DNA block; apply it.

| Voice | When | Paint |
|---|---|---|
| **kit-faithful** (default) | A catalog row or kit page was cited | Cite carries family, density, type, radius, chroma, elevation, motion. Retune shine tokens to that DNA. Linear/IBM **logos** are not cloned; density and type pairing **are**. |
| **house** (fallback) | No cite DNA, or the user asked for shine-native | Personal/brand tokens as they stand. Dark-first, one accent, dense editorial. |
| **brand** (locked) | Clearspeed or any brand pack | Kit **structure** yes, kit **chrome** no. The only lane that still sandpapers vendor paint — on purpose. `brand.md` / `brand.local.md`. |

## How to apply DNA

1. Open the cite preview (URL or PNG) **before** drawing.
2. Clone regions from the listed files.
3. Map paint onto shine **semantic** tokens (`bg-surface`, `text-fg`, `shadow-md`) whose **values** express the DNA — not the house defaults when they fight the cite.
4. Brand lane: keep the regions; replace chroma, type family, and logos with the brand pack.

Do not overwrite Carbon density or MUI marketing type with house style. That is the
sanding this file exists to stop.

## House (when it is the voice)

Dark-first, dense, instrumental, editorial type. OKLCH greys with a slight cast toward
the accent, one accent, borders over shadows, mono numerics, motion under 200ms for
state. Light derived from the same token source. Lanes: `brand` and `personal`.

House craft rules (chroma 0.13–0.24, ~1.12 UI type band, 150ms motion) live in SKILL.md
and `taste.md`. They bind the **house** voice. Kit-faithful uses the cite DNA range
instead — a Linear-like 14/15 pairing is legal when DNA says so; house lane stays tight.

## Fail if

- Cite DNA exists and the screen still reads as shadcn zinc / Geist / one-accent house.
- Brand-locked work clones IBM/Linear/Shopify chrome.
- A report still sandpapers every cite into house style.
