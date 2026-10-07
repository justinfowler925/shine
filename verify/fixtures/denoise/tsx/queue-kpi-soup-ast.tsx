/* shine-lint: off — denoise KPI soup AST harden fixture (regex-unsafe forms) */
export function QueueKpiSoupAst() {
  return (
    <main data-cite="shadcn-queue" data-shine-main>
      <div data-product-pattern="paged-notice-queue" data-region="focal">
        <DataGrid role="grid" />
      </div>
      <section data-sled-kpis>
        {/* className={"metrics"} — expression form regex /className="metrics"/ misses */}
        <div
          className={"metrics"}
          aria-label="SLED Capture key figures"
        >
          <div className="metric" data-kpi="Open queue">
            <span>Open queue</span>
            <strong>214</strong>
          </div>
          {/* className={"metric"} expression */}
          <div
            className={"metric"}
            data-kpi="New"
          >
            <span>New</span>
            <strong>12 / 41</strong>
          </div>
          {/* data-shine-kpi without className — attr marker only */}
          <div
            data-shine-kpi
            data-unit="count"
            data-baseline="0"
            data-kpi="High score"
          >
            <span>High score</span>
            <strong>33</strong>
          </div>
          <div className="metric" data-kpi="Due soon">
            <span>Due soon</span>
            <strong>27</strong>
          </div>
          <div className={"metric"} data-kpi="Decisions 7">
            <span>
              Decisions 7d
            </span>
            <strong>48</strong>
          </div>
          <div className="metric" data-kpi="Coverage">
            <span>Coverage</span>
            <strong>31 / 50</strong>
          </div>
          <div data-shine-kpi data-kpi="Usul">
            <span>Usul</span>
            <strong>22</strong>
          </div>
          <div className="metric" data-kpi="Missed">
            <span>Missed</span>
            <strong>9</strong>
          </div>
        </div>
      </section>
    </main>
  );
}
