// definitions and helpers for the sixteen geomantic figures.

/*
 * Each geomantic figure consists of four lines.  A single dot on a line is
 * considered an "active" element and encoded as a 1.  Two dots on a line
 * represent a "passive" element and are encoded as a 0.  When reading a
 * figure from top to bottom you obtain a four-bit binary number where the
 * most significant bit corresponds to Fire, followed by Air, Water and Earth.
 */

export const FIGURE_DEFINITIONS = [
  { name: 'Populus',        bits: [0, 0, 0, 0] },
  { name: 'Via',            bits: [1, 1, 1, 1] },
  { name: 'Puer',           bits: [1, 1, 0, 1] },
  { name: 'Albus',          bits: [0, 0, 1, 0] },
  { name: 'Puella',         bits: [1, 0, 1, 1] },
  { name: 'Rubeus',         bits: [0, 1, 0, 0] },
  { name: 'Laetitia',       bits: [1, 0, 0, 0] },
  { name: 'Caput Draconis', bits: [0, 1, 1, 1] },
  { name: 'Tristitia',      bits: [0, 0, 0, 1] },
  { name: 'Cauda Draconis', bits: [1, 1, 1, 0] },
  { name: 'Amissio',        bits: [1, 0, 1, 0] },
  { name: 'Acquisitio',     bits: [0, 1, 0, 1] },
  { name: 'Carcer',         bits: [1, 0, 0, 1] },
  { name: 'Conjunctio',     bits: [0, 1, 1, 0] },
  { name: 'Fortuna Maior',  bits: [0, 0, 1, 1] },
  { name: 'Fortuna Minor',  bits: [1, 1, 0, 0] },
];

// Look up a figure by its bit pattern.
export function lookupFigure(bits) {
  return FIGURE_DEFINITIONS.find(fig =>
    fig.bits.length === bits.length && fig.bits.every((b, i) => b === bits[i])
  ) || null;
}

// Compute the colour of a figure based on its active lines.  When multiple
// elements are active, colours are averaged.  When no lines are active a dark
// grey is returned.
export function figureColor(bits) {
  const colours = [
    [1.0, 0.2, 0.2], // Fire (red)
    [1.0, 1.0, 0.2], // Air (yellow)
    [0.2, 0.4, 1.0], // Water (blue)
    [0.5, 0.3, 0.2], // Earth (brown)
  ];
  let sum = [0, 0, 0];
  let count = 0;
  for (let i = 0; i < 4; i++) {
    if (bits[i] === 1) {
      sum[0] += colours[i][0];
      sum[1] += colours[i][1];
      sum[2] += colours[i][2];
      count++;
    }
  }
  if (count === 0) return [0.3, 0.3, 0.3];
  return sum.map(c => c / count);
}

// Convert a figure name to its bit pattern.
export function nameToBits(name) {
  const entry = FIGURE_DEFINITIONS.find(
    f => f.name.toLowerCase() === name.toLowerCase()
  );
  return entry ? entry.bits.slice() : null;
}

// Convert a bit pattern into a string like "1101".
export function bitsToString(bits) {
  return bits.map(b => (b ? '1' : '0')).join('');
}

// Convert a string like "1101" into a bit array.  Returns null on invalid input.
export function stringToBits(str) {
  if (!/^[01]{4}$/.test(str)) return null;
  return str.split('').map(ch => (ch === '1' ? 1 : 0));
}
