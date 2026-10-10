/**
 * Page-true Blog source floor for heroui-blog.
 * Live reference: https://www.heroui.com/blog (unique shot; not homepage clone).
 */
export default function BlogPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1>Blog</h1>
      <p>
        HeroUI blog — product updates and design-system notes. Pack shot is
        harvested from the live Blog index, not the marketing homepage.
      </p>
      <article>
        <h2>Latest</h2>
        <p>Release notes, migration tips, and component announcements.</p>
      </article>
      <article>
        <h2>Archive</h2>
        <p>Older posts remain linked from the public Blog page.</p>
      </article>
      <footer>
        <p>Cite this pack for blog / article jobs under the heroui kit.</p>
      </footer>
    </main>
  );
}
