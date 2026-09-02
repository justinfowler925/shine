# Usability proof — references become working objects

Visual similarity and accessibility are necessary but do not establish that a person can
complete a job. Every existing or new product surface therefore carries a small
`shine-usability.json` beside its design diagnosis/spec, and the flows in it are proved
in a real browser.

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

- `cite` is the selected `templates.md` reference. Structural resemblance proves the page
  shape; this contract proves the selected reference objects exist and work for this
  product's job.
- Each object has a stable selector, the reference role it implements, and a user-facing
  purpose. All required roles from the reference template must be present.
- Each flow has at least three observable steps and at least one real user action
  (`click`, `fill`, or `press`). Screenshot-only, assertion-only, and invented-object
  flows fail.
- Valid actions: `click`, `fill`, `press`, `visible`, `hidden`, `text`, and `value`.

## Proving it in Cowork

Execute the contract yourself in the browser, after the visual pass and before calling
the work done:

1. Render the page (open the file, or run the app and navigate to the surface).
2. For each object: confirm the selector resolves and the element is present **at page
   load** — hover-only objects fail.
3. For each flow: perform the steps in order — click/fill/press for real, then verify
   the assertion steps (`text`, `visible`, `value`) against the live DOM, not the source.
4. Screenshot the end state and report which flows passed, step by step.

A static dashboard, a decorative capture control, or a flow that does not change
observable state fails. Do not claim a screen is usable because it passes contrast, an
accessibility scan, or a visual comparison. If the product cannot declare its primary
job in executable steps, do not polish it. Resolve the workflow first.
