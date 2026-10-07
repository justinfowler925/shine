/**
 * ClearSpeed Signal Orange — single machine constant for the sync-tokens /
 * edition brandAccent fail-closed path.
 *
 * Narrative SSOT remains Claude Design → clearspeed-brand plugin.
 * Shine machine seam: skill/references/clearspeed/brand.json action.
 */
export const CLEARSPEED_BRAND_ACCENT = "#ED5925";

export function normalizeBrandAccent(hex) {
  return String(hex ?? "")
    .trim()
    .toUpperCase();
}

/**
 * Fail closed when a ClearSpeed accent is missing or drifts from Signal Orange.
 * @returns {string} normalized `#ED5925`
 */
export function assertClearspeedBrandAccent(hex, label = "brandAccent") {
  const normalized = normalizeBrandAccent(hex);
  if (normalized !== CLEARSPEED_BRAND_ACCENT) {
    throw new Error(
      `${label} must be ${CLEARSPEED_BRAND_ACCENT} (got ${hex ? String(hex) : "(missing)"})`,
    );
  }
  return normalized;
}

/** Read + assert action from a parsed brand.json object. */
export function brandAccentFromBrand(brand, label = "brand.json color.brand.action") {
  return assertClearspeedBrandAccent(brand?.color?.brand?.action, label);
}
