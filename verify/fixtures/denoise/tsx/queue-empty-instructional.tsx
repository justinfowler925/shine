/* shine-lint: off — denoise empty-instructional fixture */
export function QueueEmptyInstructional() {
  return (
    <main data-cite="shadcn-queue" data-shine-main>
      <h1>Queue</h1>
      <div className="empty" data-shine-empty></div>
      <p className="empty-state" data-empty-state>
        No data
      </p>
      <div role="status" data-empty>
        N/A
      </div>
      <button type="button">Pursue</button>
    </main>
  );
}
