/* shine-lint: off — denoise dual-focal golden fixture (peer worklists) */
export function QueueDualGrid() {
  return (
    <main data-cite="shadcn-queue" data-shine-main>
      <div className="grid-wrap" data-product-pattern="paged-notice-queue">
        <h2 data-grid-title="David's 10 today">David's 10 today</h2>
        <p className="kicker">Ranked · peer worklist</p>
        <DataGrid role="grid">{/* David's ranked rows */}</DataGrid>
      </div>
      <div className="grid-wrap" data-product-pattern="paged-notice-queue">
        <h2 data-grid-title="Queue">Queue</h2>
        <p className="kicker">Published queue</p>
        <DataGrid role="grid">{/* shared triage rows */}</DataGrid>
      </div>
    </main>
  );
}
