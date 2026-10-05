// DOM-detectable incomplete-primitive gates for measure.
// Machine subset only — toast-only errors and hover-only row actions stay agent judgment.
//
//   evaluateIncompletePrimitives()  — run inside page.evaluate
//   formatIncompletePrimitiveFailures(result) — turn findings into measure failure strings

/** @returns {{ findings: Array<{ kind: string, sel: string, detail: string }> }} */
export function evaluateIncompletePrimitives() {
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
  };
  const nameOf = (el) =>
    el.tagName.toLowerCase() +
    (el.id ? `#${el.id}` : "") +
    (typeof el.className === "string" && el.className ? `.${el.className.split(/\s+/)[0]}` : "");

  const labelledByText = (el) => {
    const ids = (el.getAttribute("aria-labelledby") || "").trim().split(/\s+/).filter(Boolean);
    if (!ids.length) return "";
    return ids
      .map((id) => document.getElementById(id)?.textContent?.replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .join(" ");
  };

  const associatedLabelText = (el) => {
    if (el.id) {
      const explicit = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if (explicit) return explicit.textContent?.replace(/\s+/g, " ").trim() || "";
    }
    const wrap = el.closest("label");
    if (wrap) return wrap.textContent?.replace(/\s+/g, " ").trim() || "";
    return "";
  };

  const ownText = (el) => {
    // Own text + image alts, ignoring aria-hidden / decorative subtrees.
    const parts = [];
    const walk = (node) => {
      if (node.nodeType === 3) {
        const t = node.textContent.replace(/\s+/g, " ").trim();
        if (t) parts.push(t);
        return;
      }
      if (node.nodeType !== 1) return;
      if (node.getAttribute?.("aria-hidden") === "true") return;
      if (node.tagName === "IMG") {
        const alt = (node.getAttribute("alt") || "").trim();
        if (alt) parts.push(alt);
        return;
      }
      for (const child of node.childNodes) walk(child);
    };
    walk(el);
    return parts.join(" ").trim();
  };

  const accessibleName = (el) => {
    const aria = (el.getAttribute("aria-label") || "").trim();
    if (aria) return aria;
    const by = labelledByText(el);
    if (by) return by;
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) {
      const lab = associatedLabelText(el);
      if (lab) return lab;
    }
    const text = ownText(el);
    if (text) return text;
    const title = (el.getAttribute("title") || "").trim();
    if (title) return title;
    return "";
  };

  const hasIconishContent = (el) =>
    !!el.querySelector(
      "svg,img,i,[class*='icon' i],[data-icon],[data-lucide],.lucide,[class*='Icon']",
    );

  const findings = [];

  // 1. Icon-only controls without an accessible name.
  const iconControls = [
    ...document.querySelectorAll("button,[role='button'],a[href]"),
  ].filter(vis);
  for (const el of iconControls) {
    const text = ownText(el);
    const iconOnly = !text && hasIconishContent(el);
    if (!iconOnly) continue;
    if (accessibleName(el)) continue;
    findings.push({
      kind: "icon-only-unnamed",
      sel: nameOf(el),
      detail: "icon-only control has no aria-label, aria-labelledby, title, or text name",
    });
  }

  // 2. Form controls without label association (placeholder alone does not count).
  const SKIP_INPUT = new Set(["hidden", "submit", "button", "image", "reset"]);
  const fields = [...document.querySelectorAll("input,select,textarea")].filter(vis);
  for (const el of fields) {
    const type = (el.getAttribute("type") || (el.tagName === "INPUT" ? "text" : "")).toLowerCase();
    if (el.tagName === "INPUT" && SKIP_INPUT.has(type)) continue;
    // Native file inputs expose a UA label; still require an author name when present in forms.
    if (accessibleName(el)) continue;
    const placeholderOnly = !!(el.getAttribute("placeholder") || "").trim();
    findings.push({
      kind: "unlabeled-control",
      sel: nameOf(el),
      detail: placeholderOnly
        ? "placeholder-only label — associate a <label>, aria-label, or aria-labelledby"
        : "form control has no associated label, aria-label, or aria-labelledby",
    });
  }

  // 3. Destructive control without a narrow confirm-dialog pattern.
  // Verb-led only (not color) — color-red false positives are agent notes elsewhere.
  const DESTRUCTIVE_RE = /\b(delete|destroy|purge|wipe|erase)\b/i;
  const REMOVE_START = /^(remove|revoke|unlink)\b/i;
  const hasConfirmPattern = (el) => {
    if (el.hasAttribute("data-confirm") || el.hasAttribute("data-shine-confirm")) return true;
    const popup = (el.getAttribute("aria-haspopup") || "").toLowerCase();
    if (popup === "dialog") return true;
    const targetId = el.getAttribute("aria-controls") || el.getAttribute("popovertarget");
    if (targetId) {
      const target = document.getElementById(targetId);
      if (
        target &&
        (target.matches("dialog,[role='dialog'],[data-confirm-dialog],[popover]") ||
          target.hasAttribute("popover"))
      )
        return true;
    }
    // The confirm action itself lives inside the dialog — do not demand a second confirm.
    if (el.closest("dialog,[role='dialog'],[data-confirm-dialog]")) return true;
    return false;
  };

  const actionControls = [
    ...document.querySelectorAll("button,[role='button'],a[href],input[type='submit'],input[type='button']"),
  ].filter(vis);
  for (const el of actionControls) {
    const label = accessibleName(el) || (el.value || "").trim();
    if (!label) continue;
    const destructive = DESTRUCTIVE_RE.test(label) || REMOVE_START.test(label.trim());
    if (!destructive) continue;
    if (hasConfirmPattern(el)) continue;
    findings.push({
      kind: "destructive-unconfirmed",
      sel: nameOf(el),
      detail: `destructive "${label.slice(0, 40)}" has no confirm pattern (data-confirm / aria-haspopup=dialog / dialog target)`,
    });
  }

  return { findings };
}

export function formatIncompletePrimitiveFailures(result) {
  const findings = result?.findings || [];
  return findings.map((f) => {
    if (f.kind === "icon-only-unnamed")
      return `incomplete-primitive: icon-only button without accessible name (${f.sel}) — ${f.detail}`;
    if (f.kind === "unlabeled-control")
      return `incomplete-primitive: form control without label association (${f.sel}) — ${f.detail}`;
    if (f.kind === "destructive-unconfirmed")
      return `incomplete-primitive: destructive control without confirm dialog pattern (${f.sel}) — ${f.detail}`;
    return `incomplete-primitive: ${f.kind} (${f.sel}) — ${f.detail}`;
  });
}
