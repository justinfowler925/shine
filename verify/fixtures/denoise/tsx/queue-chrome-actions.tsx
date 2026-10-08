/* shine-lint: off — denoise dual-chrome-actions fixture (filled chrome peers) */
export function QueueChromeActions() {
  return (
    <>
      <header data-shine-chrome data-region="chrome" role="banner">
        <strong>Capture</strong>
        <Button variant="default" data-shine-chrome-filled>
          Export
        </Button>
        <Button variant="default" data-shine-chrome-filled>
          New
        </Button>
      </header>
      <main data-cite="shadcn-queue" data-shine-main>
        <h1>Queue</h1>
        <div data-product-pattern="paged-notice-queue" data-region="focal">
          <DataGrid role="grid" />
          <Button variant="default">Pursue</Button>
        </div>
      </main>
    </>
  );
}
