/* shine-lint: off — denoise name-controls fixture */
export function QueueNameControls() {
  return (
    <main data-cite="shadcn-queue" data-shine-main>
      <h1>Queue</h1>
      <button type="button" className="icon" id="more">
        <svg width={16} height={16} viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="8" cy="8" r="1.5" fill="currentColor" />
        </svg>
      </button>
      <input id="email" type="email" placeholder="Filter by email" />
      <button type="button">Pursue</button>
      <button type="button" className="danger" id="delete">
        Delete notice
      </button>
    </main>
  );
}
