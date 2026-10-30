import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('textarea placeholder meets 4.5:1 contrast on its authored solid background', () => {
  const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
  const foreground = css.match(/textarea::placeholder\{color:#([0-9a-f]{6})\}/)[1];
  const background = css.match(/textarea\{[^}]*background:#([0-9a-f]{6})/)[1];
  const luminance = hex => hex.match(/../g).map(v => parseInt(v,16)/255).map(v => v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4).reduce((sum, v, i) => sum + v*[.2126,.7152,.0722][i], 0);
  const a = luminance(foreground), b = luminance(background);
  const ratio = (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
  assert.ok(ratio >= 4.5, `Actual CSS placeholder contrast ${ratio.toFixed(2)}:1 is too low`);
});
