/* shine-lint: off — denoise pill-collapse AST harden (expression className + Badge) */
export function QueuePillStackAst() {
  return (
    <main data-cite="shadcn-queue" data-shine-main>
      <h1>Queue</h1>
      <div className={"filter-pills"} data-shine-filter-stack aria-label="Filters">
        <button type="button" className={"pill"} data-shine-filter-pill data-filter="status">
          Status
        </button>
        <button type="button" className="pill" data-shine-filter-pill data-filter="owner">
          Owner
        </button>
        <Badge className="pill rounded-full" data-shine-filter-pill data-filter="score">
          Score
        </Badge>
        <button type="button" className={"pill"} data-shine-filter-pill data-filter="source">
          Source
        </button>
        <button type="button" className="pill" data-shine-filter-pill data-filter="region">
          Region
        </button>
        <Badge className={"pill"} data-shine-pill data-filter="due">
          Due
        </Badge>
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
