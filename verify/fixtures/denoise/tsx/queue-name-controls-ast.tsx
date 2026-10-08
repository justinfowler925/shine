/* shine-lint: off — denoise name-controls AST harden */
export function QueueNameControlsAst() {
  return (
    <main data-cite={"shadcn-queue"} data-shine-main>
      <h1>Queue</h1>
      <button type={"button"} className={"icon"} id={"more"}>
        <svg width={16} height={16} viewBox={"0 0 16 16"} aria-hidden={"true"}>
          <circle cx="8" cy="8" r={1.5} fill="currentColor" />
        </svg>
      </button>
      <button type="button" className="icon" id="filter">
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M2 4h12M4 8h8M6 12h4" />
        </svg>
      </button>
      <input id={"email"} type={"email"} placeholder={"Filter by email"} />
      <input id="owner" type="text" placeholder="Owner" />
      <button type="button">Pursue</button>
      <button type={"button"} className={"danger"} id={"delete"}>
        Delete notice
      </button>
      <button type="button" className="danger">
        Purge queue
      </button>
    </main>
  );
}
