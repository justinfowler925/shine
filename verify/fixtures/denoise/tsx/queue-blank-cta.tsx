/* shine-lint: off — denoise blank-cta fixture */
export function QueueBlankCta() {
  return (
    <main data-cite="shadcn-queue" data-shine-main>
      <h1>Queue</h1>
      <button type="button" className="primary cta" id="pursue"></button>
      <button type="submit" className="save" id="save"></button>
      <a className="btn next" href="/queue/next" id="next"></a>
    </main>
  );
}
