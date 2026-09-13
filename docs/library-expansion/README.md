# The complete Shine example suite

30 composed pages, built from the existing 26 workflow blocks, six page templates, installed shadcn controls and Tailwind theme. `blocks/examples.json` is the single inventory used by the gallery and implementation selector.

## Reuse a page

Run `node integrations/library-select.mjs --project /path/to/app --job "billing page"`. Inspect the returned example source and its imports. Keep the consuming application's components and approved sibling conventions. Install missing Shine blocks through their registry URLs, carry over the relevant shared styles, and supply real data callbacks.

Examples cover analytics, records, collaboration, planning, people, calendar, documents, onboarding, support, billing, knowledge, editing, marketing, pricing, contact, account entry/recovery and shopping through checkout. Every visible action either changes demo state or navigates to a real destination. Account, contact and checkout flows explicitly simulate their integrations; they do not send messages, authenticate users, charge cards or fulfill orders.

## Keep the suite consistent

`npm run library:build` verifies registry/source parity and builds the public bundle. `npm run showcase:test` checks every route at mobile and desktop widths and in dark mode. `node verify/suite-workflows.mjs` exercises the complete added workflows against the running preview or `SHINE_SHOWCASE_URL`. `npm run showcase:capture` regenerates previews from rendered pages; no hand-drawn thumbnails.

The source button distinguishes full compositions from installable registry blocks. Extend the shared block when fixing reusable behavior: the document editor exposed a form heading/input ID collision, now corrected in FormPanel itself.
