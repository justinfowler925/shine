/* shine-lint: off — denoise wrong-cite AST harden fixture (N8 deepen) */
export function SourcesSettingsAst() {
  return (
    <main
      data-cite={"shadcn-queue"}
      data-shine-main
    >
      <h1>Sources & recipes</h1>
      <p dataCite="shadcn-queue">Settings job stamped with a queue cite</p>
      <section className={"grid-wrap"}>
        <h2>Source directory</h2>
        <Button variant="default">Add source</Button>
      </section>
    </main>
  );
}
