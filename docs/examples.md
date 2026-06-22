# Geomantic Figures: Examples and Usage

This document collects a few self‑contained examples demonstrating how to use
the geomantic figures library found in this repository.  The core API
lives in `src/js/figures.js`; it defines a set of sixteen canonical
figures, exposes helper functions to look up patterns by name and
generate random figures, and implements the logic for casting a full
shield chart.  The examples below show how to import these utilities
and employ them in both browser and JavaScript contexts.

## Importing the library

The geomantic figures library is written using ES modules.  If you
load it in a browser environment, make sure your `<script>` tag
includes `type="module"`:

```html
<!-- index.html -->
<script type="module">
  import { FIGURES, getFigureByName, randomFigure, castShieldChart } from './src/js/figures.js';
  // your code here
</script>
```

In a bundler or Node.js environment with native ESM support you can
import the same API:

```js
// example.js
import { FIGURES, getFigureByName, randomFigure, castShieldChart } from './src/js/figures.js';

console.log(FIGURES.map(f => f.name)); // prints the 16 figure names
```

## Generating random figures

To create a single random figure you can call `randomFigure()`:

```js
const { pattern, name } = randomFigure();
console.log(`Random figure ${name} has pattern`, pattern);
// pattern is an array like [1, 0, 1, 1]
```

The returned `pattern` array contains four elements (top–bottom).  A
value of `1` indicates an **active** line (single dot) and `0`
indicates a **passive** line (double dot).  The `name` property
matches the canonical figure name when the pattern corresponds to one
of the sixteen definitions; otherwise it will be `"Custom"`.

## Looking up figures by name

If you want to fetch the pattern associated with a particular figure,
use `getFigureByName(name)`:

```js
const via = getFigureByName('Via');
console.log(via.pattern); // [1, 1, 1, 1]

const rubeus = getFigureByName('Rubeus');
console.log(rubeus.pattern); // [0, 1, 0, 0]

// Names are case‑insensitive
console.log(getFigureByName('fortuna major').pattern);
```

## Casting a shield chart

The shield chart is a traditional method of arranging sixteen
figures.  It starts with four randomly generated **mothers** and
derives the **daughters**, **nieces**, **witnesses** and **judge** via
simple parity operations (exclusive‑or on the dot parities).  A
sixteenth figure, sometimes called the *super judge*, is computed by
adding the first mother to the judge.  The entire process is
encapsulated in `castShieldChart()`:

```js
const chart = castShieldChart();

// Access the mothers, daughters, nieces, witnesses, judge and super judge
console.log(chart.mothers);   // array of 4 random figures
console.log(chart.daughters); // 4 derived figures
console.log(chart.nieces);    // 4 figures
console.log(chart.witnesses); // 2 figures
console.log(chart.judge);     // single figure
console.log(chart.superJudge);// single figure

// Each entry has a `pattern` and a computed `name`
console.log(chart.mothers[0].pattern); // e.g. [0,1,0,1]
console.log(chart.mothers[0].name);    // e.g. "Carcer"
```

### House allocation

The sixteen figures of the shield chart are traditionally laid out
across twelve astrological houses with the remaining four forming the
court (two witnesses, the judge and the super judge).  The helper
function does not arrange the figures visually, but you can assign
house numbers by the order they appear:

```js
const houses = [];
houses.push(...chart.mothers);    // Houses 1–4
houses.push(...chart.daughters);  // Houses 5–8
houses.push(...chart.nieces);     // Houses 9–12
houses.push(...chart.witnesses);  // Houses 13‑14
houses.push(chart.judge);         // House 15
houses.push(chart.superJudge);    // House 16

houses.forEach((fig, idx) => {
  console.log(`House ${idx + 1}: ${fig.name} ->`, fig.pattern);
});
```

## Rendering figures as dot grids

The front‑end included in this repository demonstrates how to draw
figures as dot patterns using the HTML5 canvas.  The key routine is
`renderFigureToCanvas(ctx, width, height, pattern, repeats)` defined
in `src/js/main.js`.  It tiles a figure horizontally to create a
continuous band of dots:

```js
import { getFigureByName } from './src/js/figures.js';
import { renderFigureToCanvas } from './src/js/main.js';

const canvas = document.createElement('canvas');
canvas.width = 400;
canvas.height = 200;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

const puer = getFigureByName('Puer');
renderFigureToCanvas(ctx, canvas.width, canvas.height, puer.pattern);
```

By default the pattern repeats 32 times across the width; you can
pass a different `repeats` value for more or fewer repetitions.

## Extending the library

Although this project began as a shader experiment, all of the logic
is written in modular JavaScript and can be adapted for different
renderers (WebGL, SVG, ASCII art) or incorporated into your own
applications.  Here are some ideas for extensions:

* **Custom colour palettes** — change the `elementColors` array in
  `src/js/main.js` to use your favourite colour scheme.
* **Different dot styles** — replace the 2D canvas drawing code
  (`drawCircle()`) with textured sprites or shader‑driven point
  rendering.
* **Interactive casting** — prompt the user to enter a question,
  generate mothers based on keystrokes or touch counts instead of
  random bits, and present interpretive text alongside each house.
* **Animation** — animate the dots fading in or sliding into place
  using `requestAnimationFrame()` for an engaging user experience.

Feel free to open pull requests or issues with improvements—this
repository is meant to be a playground for creative experiments with
geomancy and graphics programming.

## Rendering with WebGL

The demo application uses WebGL2 to draw the large figure on the main
canvas.  When the page loads it attempts to compile the shaders in
`src/shaders/figure.vert` and `src/shaders/figure.frag`, initialising
a simple point‑sprite renderer.  The points are positioned and
coloured in JavaScript and drawn with a single `drawArrays` call.

If you wish to render figures yourself via WebGL, you can call the
`renderFigureWebGL(pattern)` function exposed in `src/js/main.js` once
`initWebGL()` has completed.  For example:

```js
import { getFigureByName } from './src/js/figures.js';
import { initWebGL, renderFigureWebGL } from './src/js/main.js';

const canvas = document.getElementById('myCanvas');
await initWebGL(canvas);
const puer = getFigureByName('Puer');
renderFigureWebGL(puer.pattern);
```

The WebGL renderer generates vertex positions and colours on the fly
based on the figure pattern and uses the shaders to draw circular
points.  You can adjust the point size by editing `gl_PointSize` in
`figure.vert` or by scaling the generated geometry.  Should WebGL2
not be available, the code gracefully falls back to the 2D canvas
renderer.
