/* shine-lint: off — denoise N8 KPI soup fixture (literal metric JSX) */
export function QueueKpiSoup() {
  return (
    <main data-cite="shadcn-queue" data-shine-main>
      <div data-product-pattern="paged-notice-queue" data-region="focal">
        <DataGrid role="grid" />
      </div>
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
          <div className="metric" data-kpi="Decisions 7">
            <span>Decisions 7d</span>
            <strong>48</strong>
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
