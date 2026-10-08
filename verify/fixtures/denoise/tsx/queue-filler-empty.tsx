/* shine-lint: off — denoise filler-empty-copy fixture */
export function QueueFillerEmpty() {
  return (
    <main data-cite="shadcn-queue" data-shine-main>
      <h1>Queue</h1>
      <div className="empty" data-empty data-shine-empty>
        Welcome to your dashboard
      </div>
      <div data-product-pattern="paged-notice-queue" data-region="focal">
        <DataGrid role="grid" />
      </div>
    </main>
  );
}
