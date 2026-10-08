/* shine-lint: off — denoise filter-clearable AST harden */
export function QueueIrreversibleFiltersAst() {
  return (
    <main data-cite="shadcn-queue" data-shine-main>
      <h1>Queue</h1>
      <div className={"filter-pills"} data-shine-filter-stack aria-label="Filters">
        <button
          type="button"
          className={"pill"}
          data-shine-filter-pill
          aria-pressed={true}
          data-filter-active={"true"}
        >
          Status: Open
        </button>
        <button type="button" className="pill" data-shine-filter-pill aria-pressed={true} data-filter-active="true">
          Owner: Me
        </button>
        <Badge className="pill" data-shine-filter-pill aria-pressed={true} data-filter-active="true">
          Region: West
        </Badge>
      </div>
      <div data-product-pattern="paged-notice-queue" data-region="focal">
        <DataGrid role="grid" />
      </div>
    </main>
  );
}
