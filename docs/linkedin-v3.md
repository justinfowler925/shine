# The design skill that passed every test and still made bad design

LinkedIn-ready article for Shine V3. Suggested cover: the `costume` and `directed` renewal screens side by side from the public site.

---

## Short post

I spent months building a design skill for AI agents. At one point it had a template catalog, visual “DNA,” lint hooks, accessibility checks, screenshots, and a likeness score.

It also gave a one-button page a perfect 10/10 for looking like an IBM Carbon data table.

That was the moment I stopped asking, “How many checks do we have?” and started asking, “What can each check actually prove?”

Shine V3 is the result of several uncomfortable rebuilds:

- generated template stubs replaced with real source and real pixels;
- self-awarded likeness scores replaced with measured facts and side-by-side comparison;
- hooks that merely existed replaced with hooks the doctor actually executes;
- “looks usable” replaced with a browser completing the primary job;
- unsupported component runtimes deleted instead of cosmetically imitated;
- missing proof reported as missing proof—not quietly converted into a pass.

The canonical skill is now available as one plain Markdown file. No GitHub knowledge required: copy it into persistent instructions or download `SKILL.md` for an AI that supports skills.

https://shine-blond.vercel.app/skill

---

## Article

I kept adding gates and calling it taste.

That is the shortest version of what went wrong while I was building Shine, a design skill meant to stop AI agents from producing the same gray canvas, rounded cards, blue button, and Inter typography for every product on earth.

The original premise was sound: an agent should not improvise a design system on every turn. Give it tokens. Make it render the page. Check contrast and accessibility. Block invented colors. Force it to cite a real design pattern before it builds.

So I built all of that.

Then I watched the system cite IBM Carbon and produce a zinc dashboard.

Every check passed.

### The first uncomfortable lesson: compliance is not design

Shine’s first useful version was a very good compliance officer. It could catch raw hex values, weak contrast, missing focus states, empty regions, and a surprising amount of structural slop.

What it could not answer was the question users actually cared about: does this look and behave like the designed product you claimed to use as a reference?

I had confused “on-token” with “well designed.”

A page can use every approved token and still be a generic costume. A table can be accessible and still bury the decision. A dashboard can have perfect spacing and no reason to exist.

That distinction sounds obvious now. It was not obvious inside a system where every automated check printed PASS.

### Then I built visual proof—and accidentally built theater

My next answer was more reference material: a larger catalog, “DNA packs,” screenshots, and a critic that returned a likeness score.

It looked rigorous from the outside.

An audit showed that the DNA packs were generated placeholders. The real component source was packed into unreadable registry JSON. The supposed vision workflow pointed at images that did not exist. Voice files described kit colors without actually carrying the colors.

The worst part was the critic.

It did not compare pixels. It searched the page source for labels such as `data-cite` and `data-dna-family`. A page with one button and the right attributes received 10/10 for likeness to a Carbon data table. A visually accurate page without the labels could fail.

I had built a machine that trained the agent to stamp the answer on its own homework.

That version had 141 catalog rows. Seventy-one were chart demos. Settings, checkout, chat, and ordinary operational work were barely represented. The catalog indexed what was easy to collect, not what people needed to build.

More inventory had not produced more judgment. It had produced more ceremony.

### The rebuild started by deleting impressive-sounding things

The fix was not another prompt.

I deleted the critic. I deleted generated DNA specimens. I deleted the ritual where the agent claimed it had looked at images. I removed self-citing rows and replaced inaccessible registry blobs with readable source excerpts.

The new comparison tool does not return a vibes score. It renders the artifact, measures facts, and places it beside the harvested reference. If the reference has no pixels, comparison exits with “unprovable.” That is not a failure of messaging. It is the honest state of the evidence.

This became important with `shadcn-weekly-board`.

People kept reporting it as a missing component. The truth was stranger: shadcn/ui does not publish a weekly-board block. Shine had a blueprint row with no harvested screenshot, so comparison exited 2 by design. Some reports treated that as a failed check. Others wanted it called a pass.

Neither was right.

The right fix was to finish the evidence: author a real shadcn-based weekly board, give it owner and outcome interactions, add readable source, tokens, provenance, a captured reference, and a positive comparison fixture. Only then could it become provable.

“We have no proof” is a valid result. It should never be renamed “pass” to make a dashboard green.

### All the hooks were wired. None of them ran.

The most humbling bug was not visual.

Shine had edit hooks and stop hooks for Codex and Cursor. The doctor checked the configuration files, found the commands, and reported that enforcement was installed.

But every hook resolved its path through a symlink incorrectly. At runtime it looked for the verifier in a directory that did not exist. Every editor integration was dead.

The doctor had proven that wiring was present, not that wiring worked.

That changed the rule for the whole project: a gate does not exist until a seeded violation makes it fail and a valid fixture makes it pass.

Today the doctor executes the same hook command the editor executes. It proves both the blocking path and the success path. Shine V3 runs 113 browser-free checks and 158 checks in the full browser/runtime lane, but the count is not the point. The point is that the checks bite.

### A pixel-perfect workflow can still be useless

After the visual system improved, another problem survived.

A page could be accessible, structurally related to its reference, and visually coherent—and still not let someone finish the job.

A weekly board could display owners without letting anyone update an outcome. A dashboard could show metrics without supporting a decision. A capture control could be decorative. Visual proof was not usability proof.

So V3 added an executable usability contract. Every surface declares its user-facing objects, maps them to roles in the selected reference, and describes the primary job as browser steps. The browser has to click, fill, or press something and observe a real result.

This is deliberately modest. An automated flow cannot prove that a product is delightful. It can prove that the primary action is not decorative.

### Narrower became better

At another point Shine carried MUI, Ant Design Pro, and IBM Carbon references while the products actually consuming Shine were shadcn/Tailwind applications.

That sounded like range. In practice, it taught the agent to copy the costume of a runtime it could not install or preserve.

I deleted those kits from the active corpus: source clones, packs, voice sheets, catalog rows, and integration recipes. Where that left a genuine hole, Shine says so. Marketing, checkout, and wizard flows can be honest region maps without pretending to have rendered proof.

The supported build path is smaller now: use the consumer’s installed component system, prefer shadcn/TanStack for component applications, and use native semantic contracts when no framework is present.

Constraint produced more faithful work than variety theater did.

### What I believe now

After all of this, my rules for AI design systems are much less glamorous:

1. A reference must contain transferable structure, not just a name.
2. A verifier must exercise its failure path, not merely find its configuration.
3. Accessibility, visual similarity, and usability are separate claims. Prove them separately.
4. Missing evidence is “unprovable,” never “pass.”
5. Preserve the component system already installed in the product.
6. Delete a dishonest capability before adding another abstraction around it.
7. Give people the smallest useful entry point.

That last lesson is why Shine now publishes the canonical skill as one plain Markdown file.

Someone who knows what a repository is can install the full system: corpus, browser proof, hooks, immutable releases, and doctor checks. Someone who does not can copy the skill into persistent project instructions or download `SKILL.md` for an AI that supports skills.

No clone command. No terminal. No pretending every assistant has the same enforcement surface.

The full machinery is still there for teams that need it. The first experience is finally the actual thing rather than a GitHub navigation exercise.

Shine V3 is MIT and live here:

https://shine-blond.vercel.app/skill

Repository and full release:

https://github.com/justinfowler925/shine

https://github.com/justinfowler925/shine/releases/tag/v3.0.0

Shine’s shadcn catalog and registry work stands on shadcn/ui, created by shadcn. I am deeply grateful for the design and engineering work they made available as open code:

https://github.com/shadcn

https://github.com/shadcn-ui/ui
