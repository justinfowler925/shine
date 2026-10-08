/* shine-lint: off — denoise pill-filter badge/chip AST harden */
export function QueuePillBadgeAst() {
  return (
    <main data-cite={"shadcn-queue"} data-shine-main>
      <h1>Queue</h1>
      <div className={"filter-pills"} data-shine-filter-stack aria-label={"Filters"}>
        <Badge data-slot="badge" data-filter="status">
          Status
        </Badge>
        <Badge data-slot={"badge"} data-filter={"owner"}>
          Owner
        </Badge>
        <span className="chip" data-slot="badge" data-filter="score">
          Score
        </span>
        <Chip data-filter="source">Source</Chip>
        <Chip data-filter={"region"}>Region</Chip>
        <span className={"chip"} data-slot={"badge"} data-filter={"due"}>
          Due
        </span>
        <Badge data-filter="tag">Tag</Badge>
      </div>
      <div data-product-pattern="paged-notice-queue" data-region="focal">
        <DataGrid role={"grid"} />
      </div>
    </main>
  );
}
