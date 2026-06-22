// Main entry point for the geomantic figures demo.  This module wires
// up the UI, populates the figure selector, and contains routines to
// render individual figures as dot grids and to display a full
// geomantic shield chart.
//
// The application now supports two renderers:
//
//  * WebGL2 for the primary figure display.  When the page loads it
//    attempts to initialise a WebGL2 context on the main canvas and
//    compiles simple shaders from the `src/shaders` directory.  The
//    selected figure is drawn as a set of coloured points on a
//    rectangular grid.  If WebGL2 is unavailable the code falls back
//    to the 2D canvas implementation used by the mini chart tiles.
//
//  * Canvas2D for drawing the small charts and as a fallback for the
//    main figure.  The helper `renderFigureToCanvas()` remains
//    unchanged and is exported for reuse by third‑party code.

import { FIGURES, getFigureByName, randomFigure, castShieldChart } from './figures.js';

// Colour palette for the four classical elements (fire, air, water, earth).
// These colours are used for both the 2D canvas renderer and the WebGL
// renderer.  You can modify this array to customise the palette.  The
// ordering is top (row 0) to bottom (row 3).
const elementColors = ['#e74c3c', '#f1c40f', '#3498db', '#2ecc71'];

// --- WebGL infrastructure ---

// Module‑level variables for the WebGL context, program and buffers.
let gl = null;
let glProgram = null;
let positionBuffer = null;
let colorBuffer = null;

// Default shader source strings.  These are used when shader files
// cannot be fetched from disk (e.g. when running from the `file://`
// protocol where fetch may be blocked).  They mirror the contents
// of `src/shaders/figure.vert` and `src/shaders/figure.frag`.
const defaultVertexShaderSource = `#version 300 es
precision mediump float;
layout(location = 0) in vec2 a_position;
layout(location = 1) in vec3 a_color;
out vec3 v_color;
void main() {
  v_color = a_color;
  gl_PointSize = 12.0;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const defaultFragmentShaderSource = `#version 300 es
precision mediump float;
in vec3 v_color;
out vec4 outColor;
void main() {
  float dist = length(gl_PointCoord - vec2(0.5));
  if (dist > 0.5) {
    discard;
  }
  outColor = vec4(v_color, 1.0);
}`;

// Utility to load a shader file from the `src/shaders` directory.  It
// fetches the source code as a string so that it can be compiled at
// runtime.  When running from a local file (e.g. `file://`), fetch
// still works because the resources live relative to the HTML page.
async function loadShaderSource(relativePath) {
  const response = await fetch(relativePath);
  if (!response.ok) {
    throw new Error(`Failed to load shader: ${relativePath}`);
  }
  return await response.text();
}

// Compile a shader of the given type (vertex or fragment).  If
// compilation fails an exception is thrown with the compiler log.
function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile error: ${log}`);
  }
  return shader;
}

// Link a WebGL program from separate vertex and fragment shaders.
function linkProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.bindAttribLocation(program, 0, 'a_position');
  gl.bindAttribLocation(program, 1, 'a_color');
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program link error: ${log}`);
  }
  return program;
}

// Initialise the WebGL context on the given canvas.  This function
// loads shader source code from the shaders directory, compiles it
// and sets up buffers.  It must be called before any WebGL drawing.
async function initWebGL(canvas) {
  gl = canvas.getContext('webgl2');
  if (!gl) {
    console.warn('WebGL2 not supported; falling back to canvas2D');
    return;
  }
  // Load shader source.  Paths are relative to index.html; since
  // this script is imported from `src/js/main.js`, we step up one
  // directory to reach `src/shaders`.
  let vsSource;
  let fsSource;
  try {
    vsSource = await loadShaderSource('../shaders/figure.vert');
    fsSource = await loadShaderSource('../shaders/figure.frag');
  } catch (err) {
    console.warn('Failed to fetch shaders from disk; using built‑in sources.', err);
    vsSource = defaultVertexShaderSource;
    fsSource = defaultFragmentShaderSource;
  }
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
  glProgram = linkProgram(gl, vertexShader, fragmentShader);

  // Create buffers for positions and colours.  They will be
  // re‑initialised each time a new figure is drawn.
  positionBuffer = gl.createBuffer();
  colorBuffer = gl.createBuffer();

  // Enable the attribute arrays in advance.  We'll bind
  // appropriate buffers and upload data each draw.
  gl.useProgram(glProgram);
  const posLoc = 0; // matched by bindAttribLocation above
  const colorLoc = 1;
  gl.enableVertexAttribArray(posLoc);
  gl.enableVertexAttribArray(colorLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);
}

// Convert a 4‑bit figure pattern into vertex positions and colours
// suitable for the WebGL program.  Each row of the figure is
// repeated across eight columns to form a band.  Positions are
// normalised to clip space [‑1,1]^2.  Colours are derived from
// `elementColors` and scaled by brightness based on whether a line
// is active (single dot) or passive (double dot).
function buildFigureGeometry(pattern, repeats = 8) {
  const positions = [];
  const colours = [];
  // Compute horizontal and vertical step sizes.  We add a small
  // margin around the band to keep the dots away from the edges.
  const colStep = 2.0 / repeats;
  const rowStep = 2.0 / 4;
  const xOffset = -1.0 + colStep / 2;
  const yOffset = 1.0 - rowStep / 2;
  for (let row = 0; row < 4; row++) {
    const active = pattern[row] === 1;
    // Derive base colour for this row.  Parse the hex string into
    // normalised RGB.
    const hex = elementColors[row];
    const r = parseInt(hex.substring(1, 3), 16) / 255;
    const g = parseInt(hex.substring(3, 5), 16) / 255;
    const b = parseInt(hex.substring(5, 7), 16) / 255;
    const brightness = active ? 1.0 : 0.5;
    for (let col = 0; col < repeats; col++) {
      const x = xOffset + col * colStep;
      const y = yOffset - row * rowStep;
      positions.push(x, y);
      colours.push(r * brightness, g * brightness, b * brightness);
    }
  }
  return {
    positions: new Float32Array(positions),
    colours: new Float32Array(colours)
  };
}

// Draw a figure using WebGL.  This function assumes that
// `initWebGL()` has already been called and the program/buffers have
// been prepared.  It accepts a pattern array and draws it in the
// current canvas.
function renderFigureWebGL(pattern) {
  if (!gl || !glProgram) {
    return;
  }
  const { positions, colours } = buildFigureGeometry(pattern, 8);
  const vertexCount = positions.length / 2;
  // Upload positions
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  // Upload colours
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, colours, gl.STATIC_DRAW);

  // Resize viewport to match canvas dimensions
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(glProgram);
  // The attribute pointers were configured in initWebGL().  We now
  // associate the buffers with the correct attributes again.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
  // Draw points
  gl.drawArrays(gl.POINTS, 0, vertexCount);
}

// Export WebGL helper functions so that other scripts (or examples in
// docs) can initialise the renderer and draw figures.  The 2D
// rendering helpers remain exported via their individual function
// declarations above.
export { initWebGL, renderFigureWebGL };

// Draw a filled circle on the canvas context.  This helper is used by
// renderFigureToCanvas() and exported for completeness, though
// consumers rarely need to call it directly.
export function drawCircle(ctx, cx, cy, r) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Render an entire figure pattern to the provided canvas context.  The
 * figure is tiled horizontally to produce a continuous dotted band.
 *
 * @param {CanvasRenderingContext2D} ctx - 2D drawing context
 * @param {number} width - width of drawing area in pixels
 * @param {number} height - height of drawing area in pixels
 * @param {number[]} pattern - array of four 0/1 bits representing the figure
 * @param {number} repeats - number of pattern repeats across the width
 */
export function renderFigureToCanvas(ctx, width, height, pattern, repeats = 32) {
  // Clear the canvas.
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);
  const rowHeight = height / 4;
  const colWidth = width / repeats;
  const radius = Math.min(rowHeight, colWidth) * 0.35;
  const offset = colWidth * 0.15;
  for (let row = 0; row < 4; row++) {
    const y = row * rowHeight + rowHeight / 2;
    for (let col = 0; col < repeats; col++) {
      const x = col * colWidth + colWidth / 2;
      ctx.fillStyle = elementColors[row];
      if (pattern[row] === 1) {
        // Active line: draw a single dot
        drawCircle(ctx, x, y, radius);
      } else {
        // Passive line: draw two smaller dots
        drawCircle(ctx, x - offset, y, radius * 0.7);
        drawCircle(ctx, x + offset, y, radius * 0.7);
      }
    }
  }
}

// Once the DOM is loaded, set up the controls and initial state.  We
// declare the handler function as async so that we can await shader
// loading when initialising WebGL.
window.addEventListener('DOMContentLoaded', async () => {
  const figureSelect = document.getElementById('figureSelect');
  const renderButton = document.getElementById('renderFigure');
  const castButton = document.getElementById('castChart');
  const glCanvas = document.getElementById('glCanvas');
  // 2D context fallback for main canvas (only used if WebGL fails)
  const fallbackCtx = glCanvas.getContext('2d');
  const chartContainer = document.getElementById('chartContainer');

  // Populate the figure selector with the 16 canonical names.
  for (const fig of FIGURES) {
    const option = document.createElement('option');
    option.value = fig.name;
    option.textContent = fig.name;
    figureSelect.appendChild(option);
  }

  // Attempt to initialise WebGL on the main canvas.  If this fails the
  // global `gl` remains null and the fallback 2D renderer will be used.
  try {
    await initWebGL(glCanvas);
  } catch (err) {
    console.error(err);
  }

  // Helper to render a single figure on the main display.  It will use
  // WebGL when available; otherwise it falls back to the 2D canvas
  // implementation.  The selected pattern is determined from the
  // selector value.
  function renderSelectedFigure() {
    const selectedName = figureSelect.value;
    const fig = getFigureByName(selectedName);
    if (!fig) return;
    if (gl && glProgram) {
      renderFigureWebGL(fig.pattern);
    } else {
      // fallback
      renderFigureToCanvas(fallbackCtx, glCanvas.width, glCanvas.height, fig.pattern);
    }
  }

  // Event listeners for buttons.
  renderButton.addEventListener('click', () => {
    renderSelectedFigure();
  });

  castButton.addEventListener('click', () => {
    const chart = castShieldChart();
    renderShieldChart(chart);
  });

  // Draw the first figure by default.
  renderSelectedFigure();

  /**
   * Render a full shield chart in the chart container.  Each figure is
   * displayed in a small canvas along with its name and house index.
   *
   * @param {object} chart - result returned from castShieldChart()
   */
  function renderShieldChart(chart) {
    // Clear previous output.
    chartContainer.innerHTML = '';

    // Flatten the chart into a single array of 16 figures.  The order
    // corresponds to houses 1–12 followed by the two witnesses,
    // judge and super judge.
    const figures = [];
    figures.push(...chart.mothers);
    figures.push(...chart.daughters);
    figures.push(...chart.nieces);
    figures.push(...chart.witnesses);
    figures.push(chart.judge);
    figures.push(chart.superJudge);

    figures.forEach((fig, index) => {
      const figDiv = document.createElement('div');
      figDiv.classList.add('chart-figure');
      // Label: house number and name
      const houseNumber = index + 1;
      const label = document.createElement('div');
      label.textContent = `House ${houseNumber}: ${fig.name}`;
      label.style.marginBottom = '0.25rem';
      figDiv.appendChild(label);
      // Create a canvas for each figure
      const smallCanvas = document.createElement('canvas');
      smallCanvas.width = 160;
      smallCanvas.height = 80;
      const smallCtx = smallCanvas.getContext('2d');
      renderFigureToCanvas(smallCtx, smallCanvas.width, smallCanvas.height, fig.pattern, 8);
      figDiv.appendChild(smallCanvas);
      chartContainer.appendChild(figDiv);
    });
  }
});
