/* shine-lint: off — denoise dual-focal AST harden fixture (regex-unsafe forms) */
export function QueueDualGridAst() {
  return (
    <main data-cite="shadcn-queue" data-shine-main>
      {/* className={"grid-wrap"} + data-grid-title={"…"} — expression forms regex misses */}
      <div
        className={"grid-wrap"}
        data-product-pattern="paged-notice-queue"
      >
        <h2
          data-grid-title={"David's 10 today"}
        >
          David's 10 today
        </h2>
        <p className="kicker">Ranked · peer worklist</p>
        <DataGrid
          role={"grid"}
          aria-label="David ranked"
        >
          {/* peer rows */}
        </DataGrid>
      </div>
      <div
        className={"grid-wrap"}
        data-product-pattern={"paged-notice-queue"}
      >
        <h2 data-grid-title="Queue">Queue</h2>
        <p className="kicker">Published queue</p>
        {/* table role={"grid"} — also a worklist peer */}
        <table
          role={"grid"}
          data-shine-datagrid
        >
          <thead>
            <tr>
              <th>Notice</th>
              <th>Decision</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>CO DOC screening SOW</td>
              <td>Open</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}
