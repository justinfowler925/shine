/* shine-lint: off — denoise link-field-errors AST harden */
export function FormLinkFieldErrorsAst() {
  return (
    <main data-cite={"shadcn-form-invite"} data-shine-main data-region={"form-app"}>
      <h1>Invite</h1>
      <label>
        Work email
        <input id={"email"} aria-invalid={"true"} defaultValue={"nope"} />
      </label>
      <label>
        Display name
        <input id="name" aria-invalid="true" defaultValue="" />
      </label>
      <input id="phone" aria-invalid="true" defaultValue="x" />
      <textarea id="notes" aria-invalid="true" defaultValue="bad" />
      <button type="submit">Send invite</button>
    </main>
  );
}
