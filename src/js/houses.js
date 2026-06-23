// Mapping between shield chart indices and astrological houses.

// Return the house index (1‑12) for a figure index; indices >= 12 return null.
export function houseForIndex(index) {
  return index < 12 ? index + 1 : null;
}

// Names for the twelve houses.
export const HOUSE_NAMES = [
  'Self',        // House I
  'Wealth',      // House II
  'Siblings',    // House III
  'Home',        // House IV
  'Children',    // House V
  'Health',      // House VI
  'Partners',    // House VII
  'Death',       // House VIII
  'Travel',      // House IX
  'Career',      // House X
  'Friends',     // House XI
  'Sorrows',     // House XII
];
