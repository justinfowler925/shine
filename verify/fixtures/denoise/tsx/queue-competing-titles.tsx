/* shine-lint: off — denoise competing-page-titles fixture (literal titles) */
export function QueueCompetingTitles() {
  return (
    <main data-cite="shadcn-queue" data-shine-main>
      <h1>Queue</h1>
      <h1 data-page-title>Triage inbox</h1>
      <div className="page-title" data-shine-page-title>
        Notice worklist
      </div>
      <div data-product-pattern="paged-notice-queue" data-region="focal">
        <DataGrid role="grid" />
      </div>
    </main>
  );
}
