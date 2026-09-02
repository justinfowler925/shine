# Voices — three legal paints

Structure comes from the cited template; paint comes from the voice. Pick the voice from
the **job**, not habit.

| Voice | When | Paint |
|---|---|---|
| **kit-faithful** (default) | A kit template was cited | The kit's own values — type pairing, radii, density, motion, **and colors**. |
| **house** (fallback) | No kit cite, or the user asked for shine-native | Dark-first, one accent, dense editorial. Stone neutrals, ember accent, chroma 0.13–0.24. |
| **brand** (locked) | Clearspeed or any brand pack | Kit **structure** yes, kit **chrome** no — `brand.md` / the private brand pack. |

## How kit paint works

Raw values belong in **custom-property definitions**, never at **usage sites** — the
token layer is where raw values are supposed to live. So kit paint is one block plus
`var()` everywhere else:

1. Take the kit's real colors from its own published token sources — the shadcn theme
   CSS in registry items, Untitled UI's theme, Spectrum and Fluent token files — and
   declare them **once** as custom properties in the page/app token layer.
2. Every usage site says `var(--…)`. No hex, no `rgb()`, no Tailwind palette literal at
   a usage site.
3. In an existing repo, use the tokens the project already defines before declaring new
   ones.

Do not overwrite a kit's density or its marketing type with house style; do not leave a
Magic UI hero in house grays. Put your after-screenshot beside the cited template: an
`untitled-table` cite beside your page should read as relatives.

## House (when it is the voice)

House is a deliberate system, not an absence of choice: dark-first stone neutrals with a
single warm ember accent, borders over fills for separation, editorial type discipline.
Declare it as a token block at the top of the artifact; do not leave color roles
undefined and hope the page invents hex.

## Brand lane

Keep the cited template's regions; replace chroma, type family, and logos with the brand
pack. Do not import a vendor voice onto Clearspeed. Vendor logos are never cloned in any
voice; density and type pairing are.

## Fail if

- A kit cite still ships in house paint (or shadcn zinc when the cite is another family).
- Brand-locked work clones IBM/Linear/Shopify chrome.
- Kit colors are typed as raw values at usage sites instead of declared once as tokens.
