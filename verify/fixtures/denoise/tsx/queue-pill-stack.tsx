/* shine-lint: off — denoise N8 pill-filter-stack fixture (literal pill JSX) */
export function QueuePillStack() {
  return (
    <main data-cite="shadcn-queue" data-shine-main>
      <h1>Queue</h1>
      <div className="filter-pills" data-shine-filter-stack aria-label="Filters">
        <button type="button" className="pill" data-shine-filter-pill data-filter="status">
          Status
        </button>
        <button type="button" className="pill" data-shine-filter-pill data-filter="owner">
          Owner
        </button>
        <button type="button" className="pill" data-shine-filter-pill data-filter="score">
          Score
        </button>
        <button type="button" className="pill" data-shine-filter-pill data-filter="source">
          Source
        </button>
        <button type="button" className="pill" data-shine-filter-pill data-filter="region">
          Region
        </button>
        <button type="button" className="pill" data-shine-filter-pill data-filter="due">
          Due
        </button>
        <button type="button" className="pill" data-shine-filter-pill data-filter="tag">
          Tag
        </button>
      </div>
      <div data-product-pattern="paged-notice-queue" data-region="focal">
        <DataGrid role="grid" />
      </div>
    </main>
  );
}
