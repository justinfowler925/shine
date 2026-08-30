# Shine V3: visual proof was not usability proof

Shine got better at detecting visual defects and still let a bad operational surface through. The failure was simple: contrast, accessibility, component structure, and a reference screenshot can prove that a page is coherent. They cannot prove that someone can capture work, understand priority, make a decision, and see the result.

V3 keeps the visual bar and adds an executable usability bar. Every surface now declares the user-facing objects it implements, binds those objects to its selected reference pattern, and exercises the primary job in a real browser. A decorative control, a static dashboard, or a flow with no observable result fails.

The reference corpus remains the source of taste: Shadcn and Untitled UI establish proven structures and interaction vocabulary. Shine now treats them as more than a screenshot target. The selected pattern must be present as working objects in the product, and the product must prove its own job end to end.

The active integration path is deliberately narrower: Shadcn/TanStack for component applications and native, Untitled-shaped contracts where a framework is not present. MUI, Carbon, and Ant are no longer active routing choices.

Run the proof between measurement and visual comparison:

```sh
node verify/usability.mjs <url-or-page> --contract shine-usability.json --cite <selected-template>
```

This is not a claim that an automated browser test can replace human judgment. It makes the minimum judgment falsifiable: if the primary workflow is vague, decorative, or broken, Shine cannot call the screen done.
