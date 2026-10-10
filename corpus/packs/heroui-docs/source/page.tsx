/**
 * Page-true Docs shell source floor for heroui-docs.
 * Live reference: https://www.heroui.com/docs → getting-started (unique shot).
 */
export default function DocsPage() {
  return (
    <main className="docs-shell flex min-h-screen">
      <aside className="w-64 border-r p-4" aria-label="Docs navigation">
        <nav>
          <a href="/docs">Introduction</a>
          <a href="/docs/components">Components</a>
          <a href="/docs/guides">Guides</a>
        </nav>
      </aside>
      <article className="flex-1 p-8">
        <h1>Introduction</h1>
        <p>
          HeroUI documentation — getting started with the React UI library.
          This pack binds a local docs shell source for health while the shot
          is harvested from the live Introduction page.
        </p>
        <section>
          <h2>Install</h2>
          <pre><code>npm install @heroui/react</code></pre>
        </section>
        <section>
          <h2>Next steps</h2>
          <p>Browse components, theming, and migration guides.</p>
        </section>
      </article>
    </main>
  );
}
