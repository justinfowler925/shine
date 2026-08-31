// Every voice sheet's action pair must clear 4.5:1 in every mode it declares,
// and every sheet must carry the same core roles.
//
// This test used to read exactly one sheet (ant.css) and assert three hand-written
// facts about Ant's palette. Ant was deleted from the corpus on 2026-08-31
// (docs/no-foreign-runtimes.md) and the test went red — which showed the real
// defect: a contrast law proven on one vendor's sheet is not a law, it is an
// anecdote. It now runs over every sheet on disk, so adding a voice adds coverage
// instead of adding an untested palette.
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const dir = join(dirname(fileURLToPath(import.meta.url)), "../tokens/voices");

// oklch → sRGB (CSS Color 4). Needed because the house and shadcn sheets declare
// their action colours in oklch; converting here keeps the law one law rather
// than one law per colour syntax.
const srgb = (l, c, h) => {
  const hr = (h * Math.PI) / 180;
  const a = Math.cos(hr) * c;
  const b = Math.sin(hr) * c;
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    +4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
};

// Relative luminance takes linear-light channels, so hex is de-gamma'd and oklch
// output is already linear.
const linear = (channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
const luminanceOf = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

function parse(raw) {
  let value = raw.trim();
  const varMatch = value.match(/^var\([^,]+,\s*(.+)\)$/);
  if (varMatch) value = varMatch[1].trim();
  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const h = hex[1].length === 3 ? hex[1].split("").map((c) => c + c).join("") : hex[1];
    return (h.match(/[0-9a-f]{2}/gi) || []).map((x) => linear(parseInt(x, 16) / 255));
  }
  const rgb = value.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
  if (rgb) return [rgb[1], rgb[2], rgb[3]].map((x) => linear(Number(x) / 255));
  const oklch = value.match(/^oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+|none)/i);
  if (oklch) {
    const l = Number(oklch[1]) > 1 ? Number(oklch[1]) / 100 : Number(oklch[1]);
    return srgb(l, Number(oklch[2]), oklch[3] === "none" ? 0 : Number(oklch[3]));
  }
  return null;
}

// A sheet declares one colour per role, or a light-dark() pair. Both members of a
// pair are real paint on a real ground, so both are measured.
function modes(raw) {
  // A sheet may reach for a host token first — var(--slds-…, light-dark(a, b)).
  // The fallback is the paint Shine ships, so it is what gets measured.
  const varMatch = raw.trim().match(/^var\([^,]+,\s*(.+)\)$/is);
  const value = varMatch ? varMatch[1].trim() : raw.trim();
  const pair = value.match(/^light-dark\(\s*(.+?)\s*,\s*(.+?)\s*\)$/is);
  if (pair) return [["light", parse(pair[1])], ["dark", parse(pair[2])]];
  return [["both", parse(value)]];
}

const contrast = (a, b) => {
  const [hi, lo] = [luminanceOf(a), luminanceOf(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const role = (source, name) => {
  const line = source.match(new RegExp(`--shine-color-${name}:\\s*([^;]+);`, "i"));
  return line ? line[1].replace(/\/\*.*?\*\//g, "").trim() : null;
};

// The roles every sheet must define. A page painted with a sheet that omits one
// falls back to browser defaults for it, which is how a "kit-faithful" page ends
// up with 16px Times inside an otherwise correct layout.
const CORE = [
  "--shine-font-sans", "--shine-radius-sm", "--shine-radius-md", "--shine-duration-base",
  "--shine-color-bg", "--shine-color-bg-subtle", "--shine-color-fg", "--shine-color-fg-muted",
  "--shine-color-border", "--shine-color-primary", "--shine-color-primary-fg", "--shine-color-ring",
];

const sheets = readdirSync(dir).filter((f) => f.endsWith(".css")).sort();
assert.ok(sheets.length >= 8, `expected the full voice set, found ${sheets.length}`);

const measured = [];
for (const file of sheets) {
  const source = readFileSync(join(dir, file), "utf8");
  for (const token of CORE)
    assert.ok(new RegExp(`${token}:`).test(source), `${file} omits ${token} — a page painted with it falls back to browser defaults`);

  const primary = role(source, "primary");
  const primaryFg = role(source, "primary-fg");
  assert.ok(primary && primaryFg, `${file} has no action pair`);
  const fills = modes(primary);
  const texts = modes(primaryFg);
  for (const [mode, fill] of fills) {
    assert.ok(fill, `${file} action fill (${mode}) is unparseable: ${primary}`);
    const match = texts.find(([m]) => m === mode) || texts[0];
    assert.ok(match[1], `${file} action text is unparseable: ${primaryFg}`);
    const ratio = contrast(fill, match[1]);
    assert.ok(ratio >= 4.5, `${file} action contrast ${ratio.toFixed(2)}:1 (${mode}) < 4.5`);
    measured.push(`${file.replace(".css", "")}:${ratio.toFixed(2)}`);
  }
}

// Two facts worth pinning by name rather than by law: the muted-text tokens that
// were each picked one ramp step too light and measured as AA failures.
const shadcn = readFileSync(join(dir, "shadcn-zinc.css"), "utf8");
assert.match(shadcn, /fg-muted:\s*light-dark\(oklch\(44\.2% 0\.017 285\.786\)/, "shadcn muted text must use zinc-600, not the measured-AA-failing zinc-500");

console.log(`voice contrast PASS: ${sheets.length} sheets, ${measured.length} action pairs all >= 4.5:1 (${measured.join(" ")}); core roles complete`);
