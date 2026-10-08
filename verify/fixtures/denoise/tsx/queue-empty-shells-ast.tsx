/* shine-lint: off — denoise empty-insight-shells AST harden fixture (regex-unsafe forms) */
export function QueueEmptyShellsAst() {
  return (
    <main data-cite="shadcn-queue" data-shine-main>
      <div
        className={"grid-wrap"}
        data-region="focal"
        data-product-pattern="paged-notice-queue"
        data-shine-records
      >
        <h2 data-grid-title="Queue">Queue</h2>
        <DataGrid role={"grid"}>{/* triage rows */}</DataGrid>
        <Button variant="default">Pursue</Button>
      </div>
      <div className="insights" data-shine-insight-band>
        <section className="card" aria-label="Needs attention">
          <h3>Needs attention</h3>
          <p className="kicker">4 nudges</p>
          <button type="button">Open card</button>
        </section>
        {/* className={"card"} expression + data-shine-insight — regex /className="card"/ misses */}
        <section
          className={"card"}
          aria-label="Active in Usul"
          data-shine-insight
          data-tsx-shell="expr"
        >
          <h3>Active in Usul</h3>
          <p className={"kicker"}>Matched pipeline rows competing with the queue focal</p>
        </section>
        <section
          className="card"
          aria-label="Missed awards"
          data-shine-insight
          data-tsx-shell="literal"
        >
          <h3>Missed awards &amp; recompetes</h3>
          <p className="kicker">Another equal card after ten KPIs</p>
        </section>
      </div>
    </main>
  );
}
