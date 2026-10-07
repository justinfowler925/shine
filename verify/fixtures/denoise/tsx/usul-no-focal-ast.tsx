/* shine-lint: off — denoise set-focal AST harden (regex-unsafe expression forms) */
export function UsulNoFocalAst() {
  return (
    <main data-cite={"shadcn-dashboard-01"} data-shine-main>
      <h1>Usul &amp; coverage</h1>
      {/* Equal Card soup — className={"card"} misses /className="card"/ regex */}
      <section
        className={"card"}
        data-tsx-card="pipeline"
        data-product-pattern={"usul-pipeline"}
      >
        <h2>Usul pipeline</h2>
        <div
          className={"grid-wrap"}
          data-shine-records
          role={"grid"}
        >
          <table data-shine-datagrid>
            <thead>
              <tr>
                <th>Record</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>NV DPS</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section className={"card"} data-tsx-card="week">
        <h2>By week</h2>
        <p>Equal panel</p>
      </section>
      <Card className={"card"} data-tsx-card="coverage">
        <h2>Coverage lift</h2>
        <p>equal panel</p>
      </Card>
    </main>
  );
}
