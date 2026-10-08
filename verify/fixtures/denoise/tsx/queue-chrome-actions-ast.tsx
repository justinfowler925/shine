/* shine-lint: off — denoise chrome-budget AST harden (expression variant + nav) */
export function QueueChromeActionsAst() {
  return (
    <>
      <header data-shine-chrome data-region={"chrome"} role="banner">
        <strong>Capture</strong>
        <Button variant={"default"} data-shine-chrome-filled>
          Export
        </Button>
        <Button variant="default" data-shine-chrome-filled className="peer-action">
          <span>New</span>
        </Button>
      </header>
      <nav data-slot="sidebar" aria-label="Shell">
        <Button variant={"default"} data-shine-chrome-filled>
          Save
        </Button>
      </nav>
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
