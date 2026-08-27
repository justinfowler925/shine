#!/usr/bin/env node
// Index and search every public Untitled UI React example export.
// Source stays in ~/design-corpus/untitled-ui-react; the generated catalog ships
// with Shine so the installed skill can route to exact examples without guessing.

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const SHINE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CORPUS = resolve(process.env.DESIGN_CORPUS || join(homedir(), "design-corpus"));
const KIT = "untitled-ui-react";
const SOURCE = join(CORPUS, KIT);
const OUTPUT = join(SHINE, "corpus/untitledui-examples.json");
const EXPORT = /^export const ([A-Za-z_$][\w$]*)/gm;
const STOP = new Set(["a", "an", "and", "demo", "example", "the", "ui", "fix", "make", "improve", "design", "ux", "problems", "templates", "components", "shadcn", "untitled"]);

const words = (value) => String(value || "")
  .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
  .toLowerCase()
  .split(/[^a-z0-9]+/)
  .filter((word) => word && !STOP.has(word));

const title = (name) => words(name).map((word) => word[0].toUpperCase() + word.slice(1)).join(" ");

const walk = (dir, suffix, out = []) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, suffix, out);
    else if (entry.isFile() && entry.name.endsWith(suffix)) out.push(path);
  }
  return out.sort();
};

const exported = (path) => [...readFileSync(path, "utf8").matchAll(EXPORT)].map((match) => match[1]);

const sourceExcerpt = (path, name) => {
  const source = readFileSync(path, "utf8");
  const start = source.indexOf(`export const ${name}`);
  const next = source.indexOf("\nexport const ", start + 1);
  const imports = source.slice(0, 1200).trim();
  const implementation = source.slice(start, next < 0 ? start + 2800 : Math.min(next, start + 2800)).trim();
  return `${imports}\n\n/* ${name} */\n${implementation}`.slice(0, 4000);
};

const storyMetadata = (path) => {
  const source = readFileSync(path, "utf8");
  const result = new Map();
  for (const name of exported(path)) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const storyName = source.match(new RegExp(`${escaped}\\.storyName\\s*=\\s*["']([^"']+)["']`))?.[1] || title(name);
    const tail = source.slice(source.indexOf(`export const ${name}`), source.indexOf(`export const ${name}`) + 700);
    const design = Object.fromEntries([...tail.matchAll(/(desktop|mobile):\s*["']([^"']+)["']/g)].map((match) => [match[1], match[2]]));
    result.set(name, { storyName, design });
  }
  return result;
};

const route = (path) => {
  const rel = relative(SOURCE, path).replaceAll("\\", "/");
  if (rel.includes("application/app-navigation/")) return { screen: "app-shell", jobs: ["app-shell", "navigation", "sidebar"] };
  if (rel.includes("application/table/")) return { screen: "queue", jobs: ["queue", "crud", "table", "records"] };
  if (rel.includes("application/charts/")) return { screen: "dashboard", jobs: ["dashboard", "analytics", "charts", "dataviz"] };
  if (rel.includes("application/date-picker/") || rel.includes("application/file-upload/")) return { screen: "form", jobs: ["form", "input"] };
  return { screen: "component", jobs: words(rel.replace(/\.(demo|story)\.tsx$/, "")) };
};

const pin = () => {
  const line = readFileSync(join(SHINE, "corpus/corpus.lock"), "utf8")
    .split(/\r?\n/)
    .find((row) => row.startsWith(`${KIT}\t`));
  if (!line) throw new Error(`${KIT} is not pinned in corpus/corpus.lock`);
  const [name, mode, url, branch, sha, paths] = line.split("\t");
  return { name, mode, url, branch, sha, paths };
};

const cliVersion = () => {
  const path = join(SHINE, "node_modules/untitledui/package.json");
  if (existsSync(path)) return JSON.parse(readFileSync(path, "utf8")).version;
  const lock = JSON.parse(readFileSync(join(SHINE, "package-lock.json"), "utf8"));
  return lock.packages?.["node_modules/untitledui"]?.version || "unknown";
};

export function validateUntitledCatalog(catalog) {
  const errors = [];
  const examples = catalog?.examples || [];
  const ids = new Set(examples.map((item) => item.id));
  if (!examples.length) errors.push("zero examples");
  if (ids.size !== examples.length) errors.push(`duplicate ids: ${examples.length - ids.size}`);
  if (catalog?.counts?.examples !== examples.length) errors.push(`count mismatch: ${catalog?.counts?.examples} != ${examples.length}`);
  if (catalog?.counts?.renderableStories !== examples.filter((item) => item.renderable).length) errors.push("renderable story count mismatch");
  const outside = examples.filter((item) => !item.sourceFile?.startsWith(`${KIT}/components/`) || !item.sourceFile.endsWith(".demo.tsx"));
  if (outside.length) errors.push(`${outside.length} examples escape the pinned public demo tree`);
  const licensed = examples.filter((item) => item.license !== "MIT");
  if (licensed.length) errors.push(`${licensed.length} non-MIT examples in the public catalog`);
  return errors;
}

export function buildUntitledCatalog() {
  const components = join(SOURCE, "components");
  if (!existsSync(components) || !statSync(components).isDirectory()) {
    throw new Error(`missing ${components}; run corpus/acquire.sh ${CORPUS}`);
  }
  const demos = walk(components, ".demo.tsx");
  const stories = walk(components, ".story.tsx");
  const storiesByDemo = new Map(stories.map((path) => [path.replace(/\.story\.tsx$/, ".demo.tsx"), { path, exports: storyMetadata(path) }]));
  const examples = [];
  for (const demo of demos) {
    const story = storiesByDemo.get(demo);
    const routed = route(demo);
    for (const name of exported(demo)) {
      const storyData = story?.exports.get(name);
      examples.push({
        id: `untitledui-${words(name).join("-")}`,
        title: storyData?.storyName || title(name),
        export: name,
        screen: routed.screen,
        jobs: [...new Set([...routed.jobs, ...words(name)])],
        sourceFile: `${KIT}/${relative(SOURCE, demo).replaceAll("\\", "/")}`,
        storyFile: storyData ? `${KIT}/${relative(SOURCE, story.path).replaceAll("\\", "/")}` : null,
        renderable: Boolean(storyData),
        design: storyData?.design || {},
        sourceExcerpt: sourceExcerpt(demo, name),
        license: "MIT",
      });
    }
  }
  examples.sort((a, b) => a.sourceFile.localeCompare(b.sourceFile) || a.export.localeCompare(b.export));
  const ids = new Map();
  for (const item of examples) {
    const base = item.id;
    const seen = ids.get(base) || 0;
    ids.set(base, seen + 1);
    if (seen) item.id = `${base}-${seen + 1}`;
  }
  const catalog = {
    version: 1,
    generated: new Date().toISOString().slice(0, 10),
    cli: { package: "untitledui", version: cliVersion(), command: "npx untitledui@latest" },
    upstream: pin(),
    license: "MIT (public repository only; PRO page examples are excluded)",
    counts: { demoFiles: demos.length, storyFiles: stories.length, examples: examples.length, renderableStories: examples.filter((item) => item.renderable).length },
    examples,
  };
  const errors = validateUntitledCatalog(catalog);
  if (errors.length) throw new Error(errors.join("; "));
  writeFileSync(OUTPUT, JSON.stringify(catalog, null, 2) + "\n");
  return catalog;
}

export function findUntitledExamples(query, limit = 8, catalog = null) {
  const value = catalog || JSON.parse(readFileSync(OUTPUT, "utf8"));
  const queryWords = words(query);
  return value.examples
    .map((item) => {
      const bag = new Set(words([item.title, item.export, item.screen, ...(item.jobs || [])].join(" ")));
      const score = queryWords.reduce((sum, word) => sum + (bag.has(word) ? 10 : [...bag].some((candidate) => candidate.includes(word)) ? 3 : 0), 0) + (item.renderable ? 1 : 0);
      return { ...item, score };
    })
    .filter((item) => item.score >= 10)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  try {
    if (args.includes("--index")) {
      const catalog = buildUntitledCatalog();
      console.log(`untitledui: ${catalog.counts.examples} examples from ${catalog.counts.demoFiles} demos; ${catalog.counts.renderableStories} renderable stories`);
    } else {
      const limitIndex = args.indexOf("--limit");
      const limit = limitIndex >= 0 ? Number(args[limitIndex + 1]) : 8;
      const query = args.filter((value, index) => !value.startsWith("--") && args[index - 1] !== "--limit").join(" ").trim();
      if (!query) throw new Error("usage: node corpus/untitledui.mjs --index | <query> [--limit N]");
      const hits = findUntitledExamples(query, limit);
      if (!hits.length) throw new Error(`no Untitled UI example matches ${JSON.stringify(query)}`);
      for (const item of hits) console.log(`${item.id}\t${item.title}\t${item.sourceFile}#${item.export}${item.renderable ? "\tstory" : ""}`);
    }
  } catch (error) {
    console.error(`untitledui: ${error.message}`);
    process.exit(1);
  }
}
