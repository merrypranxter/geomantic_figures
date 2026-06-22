// Geomantic figure definitions and chart‑generation utilities.
//
// Each geomantic figure is represented as an object with a name and a
// `pattern` array of four integers.  A value of 1 indicates an
// active (single) dot for that row, while 0 indicates a passive
// (double) dot.  The rows are ordered from top (index 0) to bottom
// (index 3).  These definitions are not drawn from any specific
// tradition; rather, they provide a complete set of sixteen unique
// patterns and pair each figure with its complement.  Practitioners
// familiar with the canonical assignments can adjust the patterns
// accordingly or extend the list with additional aliases.

export const FIGURES = [
  { name: 'Via', pattern: [1, 1, 1, 1] },           // all active
  { name: 'Populus', pattern: [0, 0, 0, 0] },       // all passive
  { name: 'Tristitia', pattern: [1, 1, 1, 0] },     // top three active
  { name: 'Albus', pattern: [1, 0, 1, 1] },         // complement of Rubeus
  { name: 'Fortuna Major', pattern: [1, 1, 0, 0] }, // two active at top
  { name: 'Rubeus', pattern: [0, 1, 0, 0] },        // complement of Albus
  { name: 'Acquisitio', pattern: [0, 1, 1, 0] },    // complement of Amissio
  { name: 'Conjunctio', pattern: [1, 0, 1, 0] },    // alternating active/passive
  { name: 'Caput Draconis', pattern: [0, 0, 1, 0] },// complement of Cauda Draconis
  { name: 'Laetitia', pattern: [0, 0, 0, 1] },      // only bottom active
  { name: 'Carcer', pattern: [0, 1, 0, 1] },        // complement of Conjunctio
  { name: 'Amissio', pattern: [1, 0, 0, 1] },       // complement of Acquisitio
  { name: 'Puella', pattern: [0, 1, 1, 1] },        // complement of Puer
  { name: 'Fortuna Minor', pattern: [0, 0, 1, 1] }, // two active at bottom
  { name: 'Puer', pattern: [1, 0, 0, 0] },          // only top active
  { name: 'Cauda Draconis', pattern: [1, 1, 0, 1] } // complement of Caput Draconis
];

/**
 * Look up a figure definition by its name.
 *
 * @param {string} name - Latin name of the figure
 * @returns {object|null} the figure definition or null if not found
 */
export function getFigureByName(name) {
  return FIGURES.find((fig) => fig.name.toLowerCase() === name.toLowerCase()) || null;
}

/**
 * Return the display name for a given pattern.  If the pattern matches
 * one of the definitions exactly, its name is returned; otherwise
 * "Custom" is returned.  This helper allows charts generated from
 * random patterns to identify canonical figures when possible.
 *
 * @param {number[]} pattern - array of four 0/1 integers
 * @returns {string} the figure name or "Custom"
 */
export function getNameFromPattern(pattern) {
  for (const fig of FIGURES) {
    if (fig.pattern.length === pattern.length && fig.pattern.every((v, i) => v === pattern[i])) {
      return fig.name;
    }
  }
  return 'Custom';
}

/**
 * Generate a random figure pattern.  Each row is randomly chosen to
 * be active (1) or passive (0) with equal probability.
 *
 * @returns {object} an object containing the random pattern and its name
 */
export function randomFigure() {
  const pattern = new Array(4);
  for (let i = 0; i < 4; i++) {
    pattern[i] = Math.random() < 0.5 ? 0 : 1;
  }
  return { pattern, name: getNameFromPattern(pattern) };
}

/**
 * Compute the bitwise addition (XOR) of two figure patterns.  In
 * geomancy this is used to derive daughters, nieces and witnesses by
 * counting dots: two active lines produce a passive line (0), one
 * active and one passive produce an active line (1), and so on.
 *
 * @param {number[]} a - first pattern (length 4)
 * @param {number[]} b - second pattern (length 4)
 * @returns {number[]} new pattern resulting from XOR of the inputs
 */
export function addPatterns(a, b) {
  const result = new Array(4);
  for (let i = 0; i < 4; i++) {
    result[i] = (a[i] + b[i]) % 2;
  }
  return result;
}

/**
 * Cast a full geomantic shield chart.  Four mothers are generated
 * randomly; daughters, nieces, witnesses and the judge are derived
 * according to traditional geomantic rules.  A sixteenth figure
 * (super judge) is also computed by adding the first mother to the
 * judge for completeness.
 *
 * @returns {object} an object containing arrays of patterns and
 *          associated names for each stage of the chart
 */
export function castShieldChart() {
  // Generate the four mothers.
  const mothers = [];
  for (let i = 0; i < 4; i++) {
    mothers.push(randomFigure());
  }

  // Daughters: each row across the mothers becomes a new figure.
  const daughters = [];
  for (let row = 0; row < 4; row++) {
    const pattern = [];
    for (let m = 0; m < 4; m++) {
      pattern[m] = mothers[m].pattern[row];
    }
    daughters.push({ pattern, name: getNameFromPattern(pattern) });
  }

  // Nieces: combinations of pairs of mothers and daughters.
  const nieces = [];
  nieces.push({ pattern: addPatterns(mothers[0].pattern, mothers[1].pattern), name: '' });
  nieces.push({ pattern: addPatterns(mothers[2].pattern, mothers[3].pattern), name: '' });
  nieces.push({ pattern: addPatterns(daughters[0].pattern, daughters[1].pattern), name: '' });
  nieces.push({ pattern: addPatterns(daughters[2].pattern, daughters[3].pattern), name: '' });
  for (const niece of nieces) {
    niece.name = getNameFromPattern(niece.pattern);
  }

  // Witnesses: add nieces pairwise.
  const witnesses = [];
  witnesses.push({ pattern: addPatterns(nieces[0].pattern, nieces[1].pattern), name: '' });
  witnesses.push({ pattern: addPatterns(nieces[2].pattern, nieces[3].pattern), name: '' });
  for (const wit of witnesses) {
    wit.name = getNameFromPattern(wit.pattern);
  }

  // Judge: add the two witnesses.
  const judgePattern = addPatterns(witnesses[0].pattern, witnesses[1].pattern);
  const judge = { pattern: judgePattern, name: getNameFromPattern(judgePattern) };

  // Super judge (optional): add the first mother and the judge.
  const superJudgePattern = addPatterns(mothers[0].pattern, judge.pattern);
  const superJudge = { pattern: superJudgePattern, name: getNameFromPattern(superJudgePattern) };

  return {
    mothers,
    daughters,
    nieces,
    witnesses,
    judge,
    superJudge
  };
}
