# Real consumer fixture

`app.tsx` imports the six published registry blocks. The browser runner resolves block imports from generated `site/r/*.json` content, not a separately maintained demo implementation.

`ui/` and `utils.ts` are upstream shadcn source from the locally acquired registry, under the shadcn MIT license (https://github.com/shadcn-ui/ui/blob/main/LICENSE.md). Only registry-local import aliases were normalized to consumer aliases. Interactive primitives use the declared `radix-ui` package. Fixture controls simulate deterministic loading/errors/success without accessing business services.

The fixture theme is neutral sample data, never an instruction to overwrite consumer tokens.
