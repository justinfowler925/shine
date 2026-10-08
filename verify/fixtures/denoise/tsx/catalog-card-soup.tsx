/* shine-lint: off — denoise card-soup fixture */
export function CatalogCardSoup() {
  return (
    <main data-cite="shadcn-catalog" data-shine-main>
      <h1>Tools</h1>
      <section className="cards" data-shine-card-stack>
        <article className="card" data-slot="card" data-shine-card>
          <h2>Capture</h2>
          <p>Queue triage</p>
        </article>
        <article className="card" data-slot="card" data-shine-card>
          <h2>Sources</h2>
          <p>Ingest feeds</p>
        </article>
        <article className="card" data-slot="card" data-shine-card>
          <h2>Recipes</h2>
          <p>Automations</p>
        </article>
        <article className="card" data-slot="card" data-shine-card>
          <h2>Reports</h2>
          <p>Exports</p>
        </article>
      </section>
    </main>
  );
}
