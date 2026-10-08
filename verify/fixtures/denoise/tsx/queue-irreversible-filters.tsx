/* shine-lint: off — denoise irreversible-filters fixture */
export function QueueIrreversibleFilters() {
  return (
    <main data-cite="shadcn-queue" data-shine-main>
      <h1>Queue</h1>
      <div className="filter-pills" data-shine-filter-stack aria-label="Filters">
        <button type="button" className="pill" data-shine-filter-pill aria-pressed={true} data-filter-active="true">
          Status: Open
        </button>
        <button type="button" className="pill" data-shine-filter-pill aria-pressed={true} data-filter-active="true">
          Owner: Me
        </button>
        <button type="button" className="pill" data-shine-filter-pill aria-pressed={false}>
          Score
        </button>
      </div>
      <div data-product-pattern="paged-notice-queue" data-region="focal">
        <DataGrid role="grid" />
      </div>
    </main>
  );
}
