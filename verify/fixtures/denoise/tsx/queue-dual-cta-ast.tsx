/* shine-lint: off — denoise CTA pressure AST harden fixture (N8 deepen) */
export function QueueActionsAst() {
  return (
    <main data-cite="shadcn-queue" data-shine-main>
      <div data-product-pattern="paged-notice-queue">
        <DataGrid role="grid">
          <Button
            variant={"default"}
            className="job-primary"
          >
            <span>Pursue</span>
          </Button>
          <Button
            variant="default"
            type="button"
          >
            Assign lead
          </Button>
          {/* missing variant ⇒ shadcn filled primary */}
          <Button className="peer-action">Open queue</Button>
          <Button variant="outline">Review</Button>
        </DataGrid>
      </div>
    </main>
  );
}
