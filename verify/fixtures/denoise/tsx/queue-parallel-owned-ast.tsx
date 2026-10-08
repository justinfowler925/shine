/* shine-lint: off — denoise bind-product-owner AST harden */
export function QueueParallelOwnedAst() {
  return (
    <main data-cite={"shadcn-queue"} data-shine-main data-owner-expected={"nucleus-datagrid"}>
      <h1>Queue</h1>
      <div
        role={"grid"}
        data-shine-owner={"nucleus-datagrid"}
        data-product-pattern={"worklist"}
        data-region={"focal"}
        aria-label={"Notices"}
      >
        <div role={"row"}>
          <div role={"columnheader"}>Notice</div>
          <div role={"gridcell"}>Acme renewal</div>
        </div>
      </div>
      <table className={"homemade-grid"} aria-label={"Alternate notices table"}>
        <thead>
          <tr>
            <th>Notice</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Acme renewal</td>
            <td>Open</td>
          </tr>
        </tbody>
      </table>
      <div role="grid" className="homemade-grid" aria-label="Second parallel grid">
        <div role="row">
          <div role="gridcell">Extra</div>
        </div>
      </div>
      <button type="button">Pursue</button>
    </main>
  );
}
