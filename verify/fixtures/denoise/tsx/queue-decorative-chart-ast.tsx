/* shine-lint: off — denoise stamp-chart-units AST harden */
export function QueueDecorativeChartAst() {
  return (
    <main data-cite="shadcn-queue" data-shine-main>
      <h1>Queue</h1>
      <svg className={"chart"} data-chart viewBox={"0 0 320 120"} role={"img"} aria-label={"Activity chart"}>
        <polyline fill="none" stroke="#18181b" strokeWidth={3} points="0,90 40,70 80,95 120,40 160,55 200,30 240,50 280,20 320,35" />
      </svg>
      <canvas className="chart" data-chart aria-label="Trend chart" width={320} height={120} />
      <button type="button">Pursue</button>
    </main>
  );
}
