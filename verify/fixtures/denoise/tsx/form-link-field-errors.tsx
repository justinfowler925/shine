/* shine-lint: off — denoise link-field-errors fixture */
export function FormLinkFieldErrors() {
  return (
    <main data-cite="shadcn-form-invite" data-shine-main data-region="form-app">
      <h1>Invite</h1>
      <label>
        Work email
        <input id="email" aria-invalid="true" defaultValue="nope" />
      </label>
      <label>
        Display name
        <input id="name" aria-invalid="true" defaultValue="" />
      </label>
      <button type="submit">Send invite</button>
    </main>
  );
}
