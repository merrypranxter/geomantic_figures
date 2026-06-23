// Example: programmatically generate and inspect a geomantic shield chart.
//
// This script can be run with `node` from the repository root.  It will
// generate a random chart, print each figure's name and bit pattern, and
// show how the daughters, nieces and court figures are derived.  Use this
// as a template for building your own command‑line tools or unit tests.

import { generateShieldChart } from '../src/js/shield-chart.js';
import { FIGURE_DEFINITIONS, bitsToString } from '../src/js/figures.js';

function printFigure(label, fig) {
  const name = fig.name || '(unnamed)';
  const bits = bitsToString(fig.bits);
  console.log(`${label}: ${name.padEnd(15)} ${bits}`);
}

function main() {
  const chart = generateShieldChart();
  console.log('Mothers:');
  chart.mothers.forEach((f, i) => printFigure(`  M${i + 1}`, f));
  console.log('\nDaughters:');
  chart.daughters.forEach((f, i) => printFigure(`  D${i + 1}`, f));
  console.log('\nNieces:');
  chart.nieces.forEach((f, i) => printFigure(`  N${i + 1}`, f));
  console.log('\nCourt:');
  printFigure('  Right Witness', chart.rightWitness);
  printFigure('  Left Witness ', chart.leftWitness);
  printFigure('  Judge        ', chart.judge);
  printFigure('  Super Judge  ', chart.superJudge);
}

main();
