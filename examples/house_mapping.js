// Example: generate a shield chart and show which figure occupies each astrological house.

import { generateShieldChart } from '../src/js/shield-chart.js';
import { HOUSE_NAMES } from '../src/js/houses.js';

const chart = generateShieldChart();

chart.all.slice(0, 12).forEach((fig, idx) => {
  const house = idx + 1;
  const name = fig.name || 'Unknown';
  console.log(`House ${house} (${HOUSE_NAMES[house - 1]}): ${name}`);
});
