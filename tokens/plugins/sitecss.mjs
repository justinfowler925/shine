import { cssTransforms, HEADER } from './lib.mjs';
import { variableName } from '../config.base.mjs';

// personal-site emit: the canonical token layer plus legacy
// variable names (--ink, --paper, --accent …) aliased onto it. Legacy names
// are the compatibility surface for the shipped pages; new work on the site
// should use the --shine-* names or the semantic layer.
export default function sitecss({ filename, aliases }) {
  return {
    name: 'shine:sitecss',
    enforce: 'post',
    async build({ getTransforms, outputFile }) {
      const tokens = cssTransforms(getTransforms);
      const canonical = tokens.map((t) => `  ${t.localID}: ${t.value};`).join('\n');
      const legacy = Object.entries(aliases)
        .map(([name, id]) => {
          if (!tokens.some((t) => t.id === id)) {
            throw new Error(`sitecss: alias --${name} points at unknown token "${id}"`);
          }
          return `  --${name}: var(${variableName(id)});`;
        })
        .join('\n');
      outputFile(
        filename,
        `${HEADER('personal-site tokens — canonical layer + legacy aliases')}
:root {
${canonical}

  /* legacy aliases (shipped page compatibility) */
${legacy}
}
`,
      );
    },
  };
}
