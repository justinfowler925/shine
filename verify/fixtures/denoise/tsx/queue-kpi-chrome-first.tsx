/* shine-lint: off — denoise N9 worklist-first composition fixture (KPI chrome before worklist) */
export function QueueKpiChromeFirst() {
  return (
    <main data-cite="shadcn-queue" data-shine-main>
      <section data-sled-kpis aria-labelledby="kpi-h">
        <h2 id="kpi-h">Summary</h2>
        <div className="metrics" aria-label="SLED Capture key figures">
          <div className="metric" data-kpi="Open queue">
            <span>Open queue</span>
            <strong>214</strong>
          </div>
          <div className="metric" data-kpi="New">
            <span>New</span>
            <strong>12 / 41</strong>
          </div>
          <div className="metric" data-kpi="High score">
            <span>High score</span>
            <strong>33</strong>
          </div>
          <div className="metric" data-kpi="Due soon">
            <span>Due soon</span>
            <strong>27</strong>
          </div>
        </div>
      </section>
      <div className="grid-wrap" data-product-pattern="paged-notice-queue" data-grid-title="Queue">
        <h1>Queue</h1>
        <DataGrid role="grid" />
      </div>
    </main>
  );
}
