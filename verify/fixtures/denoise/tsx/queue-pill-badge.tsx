/* shine-lint: off — denoise pill-filter badge/chip deepen fixture */
export function QueuePillBadge() {
  return (
    <main data-cite="shadcn-queue" data-shine-main>
      <h1>Queue</h1>
      <div className="filter-pills" data-shine-filter-stack aria-label="Filters">
        <span className="chip" data-slot="badge" data-filter="status">
          Status
        </span>
        <span className="chip" data-slot="badge" data-filter="owner">
          Owner
        </span>
        <span className="chip" data-slot="badge" data-filter="score">
          Score
        </span>
        <span className="chip" data-slot="badge" data-filter="source">
          Source
        </span>
        <span className="chip" data-slot="badge" data-filter="region">
          Region
        </span>
        <span className="chip" data-slot="badge" data-filter="due">
          Due
        </span>
        <span className="chip" data-slot="badge" data-filter="tag">
          Tag
        </span>
      </div>
      <div data-product-pattern="paged-notice-queue" data-region="focal">
        <DataGrid role="grid" />
      </div>
    </main>
  );
}
