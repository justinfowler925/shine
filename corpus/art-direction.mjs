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
  brand: { "brand-locked":["brand","branded","clearspeed","slds"], "kit-faithful":["material","mui","carbon","ant","spectrum","fluent"], neutral:["neutral","unbranded"] },
  interaction: { "data-operations":["table","grid","queue","crud","triage"], analysis:["analytics","chart","dashboard"], form:["form","settings","wizard","checkout"], conversation:["chat","assistant"], conversion:["marketing","landing","signup"], navigation:["shell","sidebar"] },
  tone: { serious:["serious","institutional","enterprise"], editorial:["editorial","magazine"], expressive:["expressive","bold","playful"], technical:["technical","precise"], restrained:["restrained","quiet","minimal"] },
  type: { display:["display","editorial"], numeric:["numeric","metrics"], humanist:["humanist","friendly"], ui:["ui","interface"] },
  image: { none:["no-image","imageless"], editorial:["photo","editorial-image","photography"], product:["product-image","screenshot"], illustration:["illustration"] },
  framework: { mui:["mui","material"], ant:["ant","antd"], carbon:["carbon"], "shadcn-tanstack":["shadcn","tanstack"], lex:["lex","lwc","lightning","salesforce","slds"], native:["native","html"] }
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
    framework: constraints.framework || detect(tokens, AXIS_WORDS.framework),
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
  const selected = [];
  for (const candidate of eligible) {
    const distance = selected.length ? Math.min(...selected.map((prior) => axisDistance(prior.axes, candidate.axes))) : 11;
    if (!selected.length || distance >= 3) selected.push({ ...candidate, distance });
    else exclusions.push({ ...candidate, reasons:[`near-duplicate: semantic distance ${distance} < 3`] });
    if (selected.length === 3) break;
  }
  const represented = new Set(selected.flatMap((item) => constrainedAxes.map((axis) => `${axis}:${item.axes[axis]}`)));
  const gaps = constrainedAxes.filter((axis) => brief[axis] !== "unspecified" && !represented.has(`${axis}:${brief[axis]}`)).map((axis) => `${axis}: no eligible candidate matches ${brief[axis]}`);
  if (!selected.length) gaps.unshift(`job: no source-usable catalog row matches ${JSON.stringify(text)}`);
  else if (selected.length < 3) gaps.push(`diversity: catalog has ${selected.length} materially distinct source-usable candidate${selected.length === 1 ? "" : "s"} for this brief`);
  if (brief.job === "unspecified" && selected.length) brief.job = selected[0].template.screen;
  return { brief, selected, exclusions: exclusions.sort((a,b) => b.score-a.score || a.template.id.localeCompare(b.template.id)), gaps };
}
