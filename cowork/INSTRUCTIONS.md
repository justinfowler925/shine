# Shine for Claude Cowork — team instructions

Shine is our UI/UX design skill for Claude. Installed in Cowork, it makes Claude design
and build interfaces the way the full Shine system does: start from a real template,
ship complete components, follow measured craft rules, and prove the result in a
browser — instead of inventing a layout and calling it done.

## Install (one time, ~30 seconds)

1. Open the **Claude desktop app** and start a Cowork session.
2. **Drag `shine.plugin` into the chat** (or attach it with the paperclip).
3. A plugin preview card appears — you can browse the files inside it. Click
   **Install / Accept**.
4. That's it. The skill is now available in your sessions.

To confirm it's active, ask Claude: *"Do you have the shine skill?"* — or check your
installed plugins in the app's capabilities/settings.

## Use it

You don't need to invoke anything — the skill triggers automatically on UI/UX work:
design, build, dashboard, table, form, landing page, chart, wireframe, mockup, audit,
polish, review. To be explicit, say **"use shine"**.

| You want | Say something like |
|---|---|
| A new screen, from scratch | "Wireframe a renewal-risk dashboard for the CS team" |
| Build after the wireframe is locked | "Build it from the locked brief" |
| Improve an existing page | "Polish this page" / "Make this table production-grade" |
| A design review, no changes | "Audit this UI — don't change anything" |
| Better words, not pixels | "Review the copy on this landing page" |
| Internal-tool reality check | "Would anyone actually open this tool?" |

## What to expect (this is the skill working, not Claude stalling)

- **New screens start with a few discovery questions** — one per turn, each with 2–3
  cited options and a recommended default — then a gray-box wireframe and a locked
  brief before any paint. Say **"unlock structure"** if you want to change the layout
  after locking.
- **Every layout is cited.** Claude names the real template it cloned (a shadcn block,
  an Untitled UI demo, or a bundled blueprint) and stamps it on the artifact as
  `data-cite`. "I made up a nice layout" is treated as a defect.
- **Tables come complete.** Search, sort, filters, pagination, selection, row actions,
  and loading/empty/filtered-empty/error states — by contract, not on request.
- **It proves the work.** Claude renders the result in a browser, screenshots it, walks
  the primary workflow (click, fill, submit), and checks contrast before reporting done.
  Expect before/after screenshots on fixes.
- **Audits change nothing** — you get a scored report (Critical/Major/Minor) with a
  prioritized fix list.

## Tips

- **Work inside the project folder** when the UI lives in a repo — the skill detects the
  installed component system and uses it rather than introducing a new one.
- **Name your lane** if it isn't obvious: internal tool, SaaS product, marketing page,
  or Salesforce Lightning. The quality bar and the banned moves differ per lane.
- **Brand work:** give Claude the brand palette/kit file in the chat. The skill refuses
  to guess brand values from memory.
- **Salesforce:** it knows SLDS 2 — what's overridable, what isn't, and how Lightning
  hosts constrain component width. Just say the surface is Lightning/LWC.

## Versioning

This plugin is a snapshot of Shine v4.0 (https://github.com/justinfowler925/shine, MIT).
The plugin source lives in the repo under `cowork/plugin/`. When Shine changes, Justin
re-packages and re-shares the `.plugin` file; installing the new file replaces the old
version. The full repo's token pipeline, enforcement hooks, and pixel-measurement
harness are Codex/Cursor-side and are not part of the Cowork plugin — in Cowork, proof
runs through the built-in browser instead.
