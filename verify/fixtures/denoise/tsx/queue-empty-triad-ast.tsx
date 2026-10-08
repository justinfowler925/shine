/* shine-lint: off — denoise split-empty-triad AST harden */
export function QueueEmptyTriadAst() {
  return (
    <main data-cite="shadcn-queue" data-shine-main>
      <h1>Queue</h1>
      <div className={"filter-pills"} data-shine-filter-stack aria-label={"Filters"}>
        <button type="button" className="pill" data-shine-filter-pill aria-pressed={"true"} data-filter-active="true">
          Status: Open
        </button>
        <button type="button" className={"pill"} data-shine-filter-pill aria-pressed="true">
          Owner: Me
        </button>
      </div>
      <div className="empty" data-empty data-shine-empty role={"alert"}>
        No data
      </div>
      <p data-empty-state role="alert">
        No data
      </p>
    </main>
  );
}
