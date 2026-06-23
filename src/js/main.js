// Entry point for the geomantic figure renderer using WebGL2.

import { generateShieldChart } from './shield-chart.js';
import { figureColor } from './figures.js';
import { houseForIndex, HOUSE_NAMES } from './houses.js';

const canvas = document.getElementById('gl');
const gl = canvas.getContext('webgl2');
if (!gl) {
  alert('WebGL2 not supported in this browser');
}

// Resize canvas to fill the window.
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);
}
window.addEventListener('resize', resize);
resize();

// Embed simple vertex and fragment shaders for point rendering.
const vertexSource = `#version 300 es
in vec2 a_position;
in vec3 a_color;
out vec3 v_color;
uniform float u_pointSize;
void main() {
  v_color = a_color;
  gl_PointSize = u_pointSize;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const fragmentSource = `#version 300 es
precision highp float;
in vec3 v_color;
out vec4 outColor;
void main() {
  float dist = distance(gl_PointCoord, vec2(0.5));
  if (dist > 0.5) {
    discard;
  }
  outColor = vec4(v_color, 1.0);
}`;

function createShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    throw new Error('Shader compile error');
  }
  return shader;
}

function createProgram(vsSource, fsSource) {
  const vs = createShader(gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    throw new Error('Program link error');
  }
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  return program;
}

const program = createProgram(vertexSource, fragmentSource);
gl.useProgram(program);

const positionLoc = gl.getAttribLocation(program, 'a_position');
const colorLoc    = gl.getAttribLocation(program, 'a_color');
const pointSizeLoc = gl.getUniformLocation(program, 'u_pointSize');

const positionBuffer = gl.createBuffer();
const colorBuffer    = gl.createBuffer();

let chart = null;
let positions = [];
let colors = [];
let highlightFamilies = false;
let elementalMode = true;
let houseMode = false;
let selectedIndex = -1;

function lighten(color, factor) {
  return color.map(c => Math.min(1, c * factor));
}

function generateBuffers() {
  positions = [];
  colors = [];
  if (!chart) return;

  const cellCols = 4;
  const cellRows = 4;
  const cellWidth  = 2.0 / cellCols;
  const cellHeight = 2.0 / cellRows;
  const rowSpacing = cellHeight / 5;
  const colSpacing = cellWidth / 3;

  chart.all.forEach((fig, idx) => {
    const bits = fig.bits;
    let baseColor = elementalMode ? figureColor(bits) : [1, 1, 1];
    if (highlightFamilies) {
      let factor;
      if (idx < 4) factor = 1.6;
      else if (idx < 8) factor = 1.4;
      else if (idx < 12) factor = 1.3;
      else if (idx === 12) factor = 1.8;
      else if (idx === 13) factor = 1.8;
      else if (idx === 14) factor = 2.0;
      else factor = 1.5;
      baseColor = lighten(baseColor, factor);
    }
    if (selectedIndex >= 0 && idx !== selectedIndex) {
      baseColor = baseColor.map(c => c * 0.3);
    }
    let originX, originY;
    if (houseMode && idx < 12) {
      const house = idx;
      const angle = (Math.PI * 2 * house) / 12 - Math.PI / 2;
      const radius = 0.7;
      originX = Math.cos(angle) * radius;
      originY = Math.sin(angle) * radius;
    } else {
      const col = idx % cellCols;
      const row = Math.floor(idx / cellCols);
      originX = -1 + col * cellWidth;
      originY = 1 - row * cellHeight;
    }
    for (let line = 0; line < 4; line++) {
      const active = bits[line] === 1;
      let y;
      if (houseMode && idx < 12) {
        const localOffsetY = (1.5 - line) * 0.05;
        y = originY + localOffsetY;
      } else {
        const yTopOfCell = originY;
        y = yTopOfCell - ((line + 0.5) * rowSpacing);
      }
      if (active) {
        let x;
        if (houseMode && idx < 12) {
          x = originX;
        } else {
          x = originX + cellWidth / 2;
        }
        positions.push(x, y);
        colors.push(...baseColor);
      } else {
        let x1, x2;
        if (houseMode && idx < 12) {
          x1 = originX - 0.03;
          x2 = originX + 0.03;
        } else {
          x1 = originX + colSpacing;
          x2 = originX + cellWidth - colSpacing;
        }
        positions.push(x1, y);
        colors.push(...baseColor);
        positions.push(x2, y);
        colors.push(...baseColor);
      }
    }
  });
  const posArray = new Float32Array(positions);
  const colArray = new Float32Array(colors);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, posArray, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionLoc);
  gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, colArray, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(colorLoc);
  gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);
}

function newChart() {
  chart = generateShieldChart();
  generateBuffers();
  updateInfo();
}

function render() {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);
  const pointSize = Math.min(canvas.width, canvas.height) * 0.01;
  gl.uniform1f(pointSizeLoc, pointSize);
  const count = positions.length / 2;
  gl.drawArrays(gl.POINTS, 0, count);
  requestAnimationFrame(render);
}

// Overlay for selected figure details.
const infoDiv = document.createElement('div');
infoDiv.style.position = 'absolute';
infoDiv.style.left = '10px';
infoDiv.style.top = '10px';
infoDiv.style.padding = '8px';
infoDiv.style.background = 'rgba(0,0,0,0.7)';
infoDiv.style.color = 'white';
infoDiv.style.fontFamily = 'monospace';
infoDiv.style.fontSize = '14px';
infoDiv.style.maxWidth = '300px';
infoDiv.style.display = 'none';
document.body.appendChild(infoDiv);

function updateInfo() {
  if (selectedIndex >= 0 && chart) {
    const fig = chart.all[selectedIndex];
    const name = fig.name || '(unnamed)';
    const bitsStr = fig.bits.map(b => (b ? '\u2022' : '\u2022\u202f\u202f\u2022')).join(' ');
    let role;
    if (selectedIndex < 4) role = `Mother ${selectedIndex + 1}`;
    else if (selectedIndex < 8) role = `Daughter ${selectedIndex - 3}`;
    else if (selectedIndex < 12) role = `Niece ${selectedIndex - 7}`;
    else if (selectedIndex === 12) role = 'Right Witness';
    else if (selectedIndex === 13) role = 'Left Witness';
    else if (selectedIndex === 14) role = 'Judge';
    else role = 'Super Judge';
    let houseInfo = '';
    const house = houseForIndex(selectedIndex);
    if (house) {
      houseInfo = `\nHouse ${house}: ${HOUSE_NAMES[house - 1]}`;
    }
    infoDiv.textContent = `${role}\n${name}\n${bitsStr}${houseInfo}`;
    infoDiv.style.display = 'block';
  } else {
    infoDiv.style.display = 'none';
  }
}

window.addEventListener('keydown', (ev) => {
  const key = ev.key;
  if (key === ' ') {
    newChart();
  } else if (key === 'h' || key === 'H') {
    houseMode = !houseMode;
    selectedIndex = -1;
    generateBuffers();
    updateInfo();
  } else if (key === 'e' || key === 'E') {
    elementalMode = !elementalMode;
    generateBuffers();
  } else if (key === 'f' || key === 'F') {
    highlightFamilies = !highlightFamilies;
    generateBuffers();
  } else if (/^[1-9]$/.test(key) || key === '0' || key === '-' || key === '=') {
    const mapping = { '-': 10, '=': 11, '0': 9 };
    let idx;
    if (key in mapping) idx = mapping[key];
    else idx = parseInt(key, 10) - 1;
    if (idx < chart.all.length) {
      selectedIndex = idx;
      generateBuffers();
      updateInfo();
    }
  } else if (key === 'Escape') {
    selectedIndex = -1;
    generateBuffers();
    updateInfo();
  }
});

newChart();
requestAnimationFrame(render);
