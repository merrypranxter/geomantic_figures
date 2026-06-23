// Example: list each geomantic figure with its bit pattern and computed colour.

import { FIGURE_DEFINITIONS, figureColor } from '../src/js/figures.js';

function toHex(color) {
  const rgb = color.map(c => Math.round(c * 255));
  return '#' + rgb.map(x => x.toString(16).padStart(2, '0')).join('');
}

FIGURE_DEFINITIONS.forEach(fig => {
  const color = figureColor(fig.bits);
  console.log(`${fig.name.padEnd(15)} bits: ${fig.bits.join('')} colour: ${toHex(color)}`);
});
