# Usability proof — references become working objects

Visual similarity and accessibility are necessary but do not establish that a person can complete a job. Every existing or new product surface therefore carries a small `shine-usability.json` beside its design diagnosis/spec and proves it in a real browser.

## Operate SaaS screens — fail closed on prove

For Operate-lane page cites whose `screen` is one of `dashboard`, `settings`, `form`, `queue`, `record`, `wizard`, `app-shell`, `lex-record`, `lex-queue`, `onboarding`, `checkout`, or `command-palette`, `verify/prove.mjs` treats missing or invalid usability as **`interactions: failed`** (not `not_tested`). Shallow contracts fail the same way: every flow needs ≥3 steps, a real user action (`click` / `fill` / `press` / `select`), and an observable state outcome. Marketing, charts, blog, and other non-allowlisted screens keep the softer `not_tested` → incomplete path when no contract is supplied.

Do not ship an Operate SaaS surface on craft-green alone. Write the contract before claiming completion.

```json
{
  "version": 1,
  "cite": "untitled-table",
  "objects": [
    {"id":"queue","selector":"[data-testid=queue]","referenceRole":"table","purpose":"See work needing a decision"},
    {"id":"capture","selector":"[data-testid=capture]","referenceRole":"command","purpose":"Add work without leaving the queue"}
  ],
  "flows": [{"id":"capture-work","userJob":"Capture work and see it enter the queue","steps":[
    {"action":"fill","selector":"[data-testid=capture]","value":"Call Acme"},
    {"action":"press","selector":"[data-testid=capture]","value":"Enter"},
    {"action":"text","selector":"[data-testid=queue]","value":"Call Acme"}
  ]}]
}
```

- `cite` is the selected Shadcn, Untitled UI, or other corpus reference. `compare` proves its page structure; this contract proves the selected reference objects exist and work for this product’s job.
- Each object has a stable selector, the reference role it implements, and a user-facing purpose. All required roles from the reference template must be present.
- Each flow has at least three observable steps and at least one real user action (`click`, `fill`, `select`, or `press`). Screenshot-only, assertion-only, and invented-object flows fail.
- Valid actions: `click`, `fill`, `press`, `select`, `visible`, `hidden`, `text`, `value`, `checked`, `count`, `enabled`, `disabled`, and `focused`. Every flow needs an observable assertion.
- Controls revealed later declare `appearsIn: "flow-id"`; that flow must exercise the real selector. Other objects are checked at initial load. Do not add fake visible markers for hidden dialogs or panels.
- A flow may set `path: "/accounts?view=history"` to navigate within the target origin, or `reset: true` to reload. Flows otherwise continue from the previous flow for compatibility.
- A `click` or `press` step may include `dialog: {"accept": false, "message": "Discard"}` to exercise a real browser confirmation. Missing or unexpected dialogs fail.

Run this after measure and before compare:

```sh
node verify/usability.mjs http://127.0.0.1:3000 --contract shine-usability.json --cite untitled-table
```

If the product cannot declare its primary job in executable steps, do not polish it. Resolve the workflow first.
