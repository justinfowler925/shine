/* shine-lint: off — denoise N8 fixture */
export function QueueActions() {
  return (
    <main data-cite="shadcn-queue" data-shine-main>
      <div data-product-pattern="paged-notice-queue">
        <DataGrid role="grid">
          <Button variant="default">Pursue</Button>
          <Button variant="default">Assign lead</Button>
          <Button variant="outline">Review</Button>
        </DataGrid>
      </div>
      <div data-product-pattern="paged-notice-queue">
        <DataGrid role="grid">
          <Button variant="default">Open queue</Button>
        </DataGrid>
      </div>
    </main>
  );
}
