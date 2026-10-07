/* shine-lint: off — D10 XOR recipe shape (agent-applied; not AST auto-delete) */
/**
 * Shared DataGrid + XOR filter chips after collapsing peer grids.
 * Peer title ("David's 10 today") becomes a chip; one role=grid remains.
 * Product code: TanStack filters / saved-views URL state on the same row model.
 */
export function QueueXorWorklist() {
  return (
    <main data-cite="shadcn-queue" data-shine-main>
      <div
        className="grid-wrap"
        data-product-pattern="paged-notice-queue"
        data-region="focal"
        data-shine-shared-grid
      >
        <h2 data-grid-title>Queue</h2>
        <div className="scope" data-shine-xor-views role="group" aria-label="Worklist views">
          <button type="button" aria-pressed={true}>
            Queue
          </button>
          <button type="button" aria-pressed={false} data-shine-xor-from-peer="David's 10 today">
            David's 10 today
          </button>
        </div>
        <DataGrid role="grid">{/* shared row model — chip XOR filters, never a second grid */}</DataGrid>
      </div>
    </main>
  );
}
