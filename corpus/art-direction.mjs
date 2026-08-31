import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
export const directionMetadata = JSON.parse(readFileSync(join(ROOT, "art-direction.json"), "utf8"));
const STOP = new Set(["a", "an", "the", "page", "screen", "view", "ui", "for", "of", "my", "our", "new", "with"]);
const words = (value) => String(value || "").toLowerCase().split(/[^a-z0-9]+/).filter((word) => word && !STOP.has(word));
const hasAny = (tokens, values) => values.some((value) => tokens.includes(value));

const AXIS_WORDS = {
  lane: { internal:["internal","ops","operations"], saas:["saas","product"], lex:["lex","lwc","lightning","salesforce","slds"], marketing:["marketing","landing","campaign"] },
  audience: { executive:["executive","exec","cro","ceo","leader"], operator:["operator","ops","analyst","agent","rep"], customer:["customer","buyer","visitor","applicant"], admin:["admin","administrator"], developer:["developer","engineer"] },
  density: { dense:["dense","compact","high-density"], comfortable:["comfortable","balanced"], editorial:["editorial","spacious"] },
  informationShape: { records:["records","rows","table","grid","queue","crud","admin"], metrics:["metrics","analytics","chart","dashboard","kpi"], narrative:["story","article","marketing","landing"], form:["form","settings","wizard","checkout","login"], conversation:["chat","assistant","conversation"], navigation:["shell","navigation","sidebar"] },
  brand: { "brand-locked":["brand","branded","clearspeed","slds"], "kit-faithful":["kit-faithful","spectrum","fluent","untitled"], neutral:["neutral","unbranded"] },
  interaction: { "data-operations":["table","grid","queue","crud","triage"], analysis:["analytics","chart","dashboard"], form:["form","settings","wizard","checkout"], conversation:["chat","assistant"], conversion:["marketing","landing","signup"], navigation:["shell","sidebar"] },
  tone: { serious:["serious","institutional","enterprise"], editorial:["editorial","magazine"], expressive:["expressive","bold","playful"], technical:["technical","precise"], restrained:["restrained","quiet","minimal"] },
  type: { display:["display","editorial"], numeric:["numeric","metrics"], humanist:["humanist","friendly"], ui:["ui","interface"] },
  image: { none:["no-image","imageless"], editorial:["photo","editorial-image","photography"], product:["product-image","screenshot"], illustration:["illustration"] },
  framework: { "shadcn-tanstack":["shadcn","tanstack"], lex:["lex","lwc","lightning","salesforce","slds"], native:["native","html"] }
};

const detect = (tokens, groups, fallback = "unspecified") => Object.entries(groups).find(([, synonyms]) => hasAny(tokens, synonyms))?.[0] || fallback;
export function normalizeBrief(text, constraints = {}) {
  const tokens = words(text);
  const demandedSlop = directionMetadata.slopStyles.filter((style) => tokens.includes(style));
  const lane = constraints.lane || detect(tokens, AXIS_WORDS.lane, hasAny(tokens, AXIS_WORDS.lane.lex) ? "lex" : "saas");
  return {
    text, tokens, job: constraints.job || "unspecified", lane,
    audience: constraints.audience || detect(tokens, AXIS_WORDS.audience),
    density: constraints.density || detect(tokens, AXIS_WORDS.density),
    informationShape: constraints.informationShape || detect(tokens, AXIS_WORDS.informationShape),
    brand: constraints.brand || detect(tokens, AXIS_WORDS.brand),
    interaction: constraints.interaction || detect(tokens, AXIS_WORDS.interaction),
    tone: constraints.tone || detect(tokens, AXIS_WORDS.tone),
    type: constraints.type || detect(tokens, AXIS_WORDS.type),
    image: constraints.image || detect(tokens, AXIS_WORDS.image),
    // The job text describes the desired visual/interaction reference. The
    // consumer's implementation framework is a separate constraint supplied
    // explicitly by the project resolver. "Untitled + shadcn" must therefore
    // remain eligible for an Untitled reference implemented with shadcn.
    framework: constraints.framework || "unspecified",
    demandedSlop,
    licenseMode: constraints.licenseMode || "source"
  };
}

export function candidateAxes(template, brief) {
  const lexScreen = template.screen.startsWith("lex-");
  const screen = directionMetadata.screenProfiles[template.screen] || (lexScreen ? directionMetadata.screenProfiles.record : {});
  const kit = directionMetadata.kitProfiles[template.kit] || {};
  const axes = { job: template.screen, lane: lexScreen ? "lex" : template.screen.startsWith("marketing") ? "marketing" : brief.lane, audience: brief.audience, ...screen, ...kit };
  for (const [axis, fallback] of Object.entries({ audience:"general", informationShape:"mixed", brand:"neutral", interaction:"browsing", tone:"restrained", type:"ui", image:"none", framework:"native" }))
    if (!axes[axis] || axes[axis] === "unspecified") axes[axis] = fallback;
  axes.density = template.dna?.density || axes.density || "comfortable";
  axes.signature = `${template.dna?.family || template.kit}:${axes.signature || template.screen}:${axes.density}:${axes.type}:${axes.image}`;
  return axes;
}

const constrainedAxes = ["lane","audience","density","informationShape","brand","interaction","tone","type","image","framework"];
export function axisDistance(a, b) {
  return constrainedAxes.reduce((sum, axis) => sum + (a[axis] !== b[axis] ? 1 : 0), 0) + (a.signature !== b.signature ? 1 : 0);
}

const baseScore = (template, brief) => {
  const jobs = (template.jobs || []).map((job) => job.toLowerCase());
  const bag = new Set(words([template.id, template.screen, template.title, ...jobs].join(" ")));
  const query = brief.tokens.join("-");
  let score = template.id === query ? 100 : 0;
  if (template.screen === query || jobs.includes(query)) score += 60;
  for (const token of brief.tokens) {
    if (template.screen === token || jobs.includes(token)) score += 40;
    else if (bag.has(token)) score += 10;
  }
  if (brief.informationShape === "records") {
    if (["crud","queue"].includes(template.screen)) score += 50;
    if (["app-shell","dashboard"].includes(template.screen)) score -= 25;
  }
  if (brief.lane === "lex") score += template.kit === "slds" ? 80 : -20;
  return score;
};

const historyCounts = (path) => {
  if (!path || !existsSync(path)) return {};
  const value = JSON.parse(readFileSync(path, "utf8"));
  const ids = Array.isArray(value) ? value : value.citations || [];
  return ids.reduce((counts, id) => ({ ...counts, [id]: (counts[id] || 0) + 1 }), {});
};

export function retrieveDirections(templates, text, constraints = {}) {
  const brief = normalizeBrief(text, constraints);
  const history = historyCounts(constraints.history);
  const exclusions = [];
  const eligible = [];
  for (const template of templates) {
    const axes = candidateAxes(template, brief);
    const reasons = [];
    if (template.selectable === false) reasons.push(`retired: ${template.retiredReason || "not eligible for new work"}`);
    if (brief.licenseMode === "source" && template.kind === "query-only") reasons.push("license: query-only cannot be a build source");
    if (brief.framework !== "unspecified" && axes.framework !== brief.framework) reasons.push(`framework: needs ${brief.framework}, candidate is ${axes.framework}`);
    if (brief.lane === "lex" && axes.lane !== "lex") reasons.push("lane: Lightning requires SLDS/LEX structure");
    if (brief.lane !== "lex" && axes.lane === "lex") reasons.push("lane: LEX blueprint does not fit this host");
    const score = baseScore(template, brief);
    if (reasons.length) exclusions.push({ template, axes, score, reasons });
    else if (score >= 40) {
      const matches = constrainedAxes.filter((axis) => brief[axis] !== "unspecified" && brief[axis] === axes[axis]);
      eligible.push({ template, axes, score: score + matches.length * 8, matches, history: history[template.id] || 0 });
    }
  }
  eligible.sort((a,b) => b.score-a.score || a.history-b.history || (a.template.startFrom ?? 99)-(b.template.startFrom ?? 99) || a.template.id.localeCompare(b.template.id));
  // Kit affinity. The consumer's installed kit decided the build recipe but had
  // no say in which page reference won, so a Next+shadcn/TanStack repo asking
  // for a records surface was handed a foreign-runtime reference: the two
  // candidates tied on score and the tie broke alphabetically. A cite the
  // consumer cannot build against is not a near-miss, it is the wrong answer, so
  // compatible kits form a preference tier rather than a score nudge. If nothing
  // compatible is eligible the tier is skipped and the mismatch is reported as a
  // gap — a thin corpus corner must not become "no template".
  //
  // The kits that made this defect reachable (MUI, Ant Design Pro, Carbon) were
  // deleted on 2026-08-31; this tier stays because the corpus still carries
  // Spectrum, Fluent, Mantine, HeroUI and MagicUI rows on their own runtimes.
  const installedKits = (Array.isArray(constraints.installedKits) ? constraints.installedKits : []).filter(Boolean);
  const kitGaps = [];
  let ranked = eligible;
  if (installedKits.length && eligible.length) {
    const buildable = (candidate) => installedKits.includes(candidate.template.kit);
    // Order, never eliminate. Page-scope coverage is thin and unevenly
    // distributed across kits, so filtering to the installed kit turns a thin
    // corner of the corpus into "no eligible template". Ordering fixed the real
    // defect (two candidates tied on score and the tie broke alphabetically,
    // handing a shadcn/TanStack repo a foreign-runtime reference) while keeping
    // the only reference for a screen reachable.
    ranked = [...eligible.filter(buildable), ...eligible.filter((candidate) => !buildable(candidate))]
      .map((candidate) => buildable(candidate)
        ? { ...candidate, matches: [...candidate.matches, "installedKit"], port: false }
        : { ...candidate, port: true, portNote: `${candidate.template.kit} carries its own runtime and theming; port the structure to ${installedKits[0]} rather than copying the source` });
    if (!eligible.some(buildable)) {
      kitGaps.push(`kit: no eligible candidate is built on ${installedKits.join(", ")} — the selected reference is a structure to port, not source to copy`);
    }
  }
  const limit = Number.isInteger(constraints.limit) && constraints.limit > 0 ? constraints.limit : 3;
  const selected = [];
  for (const candidate of ranked) {
    // Near-duplicate suppression stops the caller being offered three
    // interchangeable choices for one slot, so distance is measured only against
    // candidates competing for the SAME slot. A page and a component are not
    // interchangeable: measuring across scopes let a chart component suppress
    // the composed dashboard page it belongs inside (distance 1), which surfaced
    // as "no composed page reference" once the corpus carried many chart packs.
    const scope = candidate.template.scope || "page";
    const peers = selected.filter((prior) => (prior.template.scope || "page") === scope);
    const distance = peers.length ? Math.min(...peers.map((prior) => axisDistance(prior.axes, candidate.axes))) : 11;
    if (!peers.length || distance >= 3) selected.push({ ...candidate, distance });
    else exclusions.push({ ...candidate, reasons:[`near-duplicate: semantic distance ${distance} < 3 within ${scope} scope`] });
    if (selected.length === limit) break;
  }
  const represented = new Set(selected.flatMap((item) => constrainedAxes.map((axis) => `${axis}:${item.axes[axis]}`)));
  const gaps = [...kitGaps, ...constrainedAxes.filter((axis) => brief[axis] !== "unspecified" && !represented.has(`${axis}:${brief[axis]}`)).map((axis) => `${axis}: no eligible candidate matches ${brief[axis]}`)];
  if (!selected.length) gaps.unshift(`job: no source-usable catalog row matches ${JSON.stringify(text)}`);
  else if (selected.length < limit) gaps.push(`diversity: catalog has ${selected.length} materially distinct source-usable candidate${selected.length === 1 ? "" : "s"} for this brief`);
  if (brief.job === "unspecified" && selected.length) brief.job = selected[0].template.screen;
  return { brief, selected, exclusions: exclusions.sort((a,b) => b.score-a.score || a.template.id.localeCompare(b.template.id)), gaps };
}
