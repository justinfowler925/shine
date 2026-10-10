import { title } from "@/components/primitives";

/**
 * Page-true About source floor for heroui-about.
 * Live reference: https://www.heroui.com/about (unique shot; not homepage clone).
 */
export default function AboutPage() {
  return (
    <main className="flex flex-col gap-6 px-6 py-12">
      <h1 className={title()}>About HeroUI</h1>
      <p>
        HeroUI is an open-source React UI library — beautiful by default,
        customizable by design. This pack cites the public About page.
      </p>
      <p>
        Use this source as the local bind for referenceHealth; pixels come from
        the harvested About screenshot, not the marketing homepage clone.
      </p>
      <ul>
        <li>Accessible components by default</li>
        <li>Theme tokens and variants</li>
        <li>Docs-first product surface</li>
      </ul>
    </main>
  );
}
