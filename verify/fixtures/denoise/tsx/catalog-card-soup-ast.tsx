/* shine-lint: off — denoise collapse-card-soup AST harden */
export function CatalogCardSoupAst() {
  return (
    <main data-cite="shadcn-catalog" data-shine-main>
      <h1>Tools</h1>
      <section className={"cards"} data-shine-card-stack>
        <Card className={"card"} data-slot="card" data-shine-card>
          <h2>Capture</h2>
        </Card>
        <article className="card" data-slot="card" data-shine-card>
          <h2>Sources</h2>
        </article>
        <div className="card" data-shine-card>
          <h2>Recipes</h2>
        </div>
        <Card className="card rounded-lg" data-slot={"card"}>
          <h2>Reports</h2>
        </Card>
        <article className="card" data-shine-card>
          <h2>Alerts</h2>
        </article>
      </section>
    </main>
  );
}
