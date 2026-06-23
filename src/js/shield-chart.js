// Functions to generate a full geomantic shield chart from four random mothers.

import { lookupFigure } from './figures.js';

// Generate a random figure with four bits.
function randomFigure() {
  const bits = [];
  for (let i = 0; i < 4; i++) {
    bits.push(Math.random() < 0.5 ? 0 : 1);
  }
  return bits;
}

// XOR two figures line by line.
function addFigures(a, b) {
  const out = [];
  for (let i = 0; i < 4; i++) {
    out.push((a[i] + b[i]) % 2);
  }
  return out;
}

// Derive daughters from mothers by transposing their bits.
function deriveDaughters(mothers) {
  const daughters = [];
  for (let i = 0; i < 4; i++) {
    const bits = [];
    for (let j = 0; j < 4; j++) {
      bits.push(mothers[j][i]);
    }
    daughters.push(bits);
  }
  return daughters;
}

// Compute nieces (nephews) by adding pairs of mothers and daughters.
function deriveNieces(mothers, daughters) {
  return [
    addFigures(mothers[0], mothers[1]),
    addFigures(mothers[2], mothers[3]),
    addFigures(daughters[0], daughters[1]),
    addFigures(daughters[2], daughters[3]),
  ];
}

// Compute witnesses and judge from nieces.
function deriveCourt(nieces) {
  const right = addFigures(nieces[0], nieces[1]);
  const left  = addFigures(nieces[2], nieces[3]);
  const judge = addFigures(right, left);
  return { right, left, judge };
}

// Compute the super judge by adding the first mother and judge.
function deriveSuperJudge(firstMother, judge) {
  return addFigures(firstMother, judge);
}

// Generate a complete shield chart with names where available.
export function generateShieldChart() {
  // Random mothers
  const mothers = [];
  for (let i = 0; i < 4; i++) {
    const bits = randomFigure();
    mothers.push({ bits, name: lookupFigure(bits)?.name || null });
  }
  // Daughters
  const daughterBits = deriveDaughters(mothers.map(m => m.bits));
  const daughters = daughterBits.map(bits => ({ bits, name: lookupFigure(bits)?.name || null }));
  // Nieces
  const nieceBits = deriveNieces(mothers.map(m => m.bits), daughterBits);
  const nieces = nieceBits.map(bits => ({ bits, name: lookupFigure(bits)?.name || null }));
  // Court
  const court = deriveCourt(nieceBits);
  const rightWitness = { bits: court.right, name: lookupFigure(court.right)?.name || null };
  const leftWitness  = { bits: court.left,  name: lookupFigure(court.left)?.name || null };
  const judge        = { bits: court.judge, name: lookupFigure(court.judge)?.name || null };
  // Super judge
  const superJudgeBits = deriveSuperJudge(mothers[0].bits, judge.bits);
  const superJudge = { bits: superJudgeBits, name: lookupFigure(superJudgeBits)?.name || null };
  // Combine
  const all = [
    ...mothers,
    ...daughters,
    ...nieces,
    rightWitness,
    leftWitness,
    judge,
    superJudge,
  ];
  return { mothers, daughters, nieces, rightWitness, leftWitness, judge, superJudge, all };
}
