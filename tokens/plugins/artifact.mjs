import { cssTransforms, HEADER } from './lib.mjs';

// Self-contained token block for CSP-locked, single-file artifacts:
// no imports, no font-face, literals only. Paste into <style>.
export default function artifact({ filename, lane, modes = [] }) {
  return {
    name: 'shine:artifact',
    enforce: 'post',
    async build({ getTransforms, outputFile }) {
      const block = (transforms) =>
        transforms.map((t) => `  ${t.localID}: ${t.value};`).join('\n');
      let out = `${HEADER(`@shine/${lane} — inline artifact tokens`)}\n:root {\n${block(cssTransforms(getTransforms))}\n}\n`;
      for (const { mode, selectors } of modes) {
        const overrides = cssTransforms(getTransforms, mode);
        if (overrides.length) {
          out += `${selectors.join(', ')} {\n${block(overrides)}\n}\n`;
        }
      }
      outputFile(filename, out);
    },
  };
}
