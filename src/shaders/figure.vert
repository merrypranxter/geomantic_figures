#version 300 es

// Vertex shader for geomantic figures.  Each point corresponds to a
// single dot in the figure pattern.  We use normalised clip‑space
// coordinates in the range [‑1,1] for both axes, so no projection
// matrices are required.  A constant point size is set here but can
// be adjusted from JavaScript by modifying `gl_PointSize` before
// linking the program.

precision mediump float;

layout(location = 0) in vec2 a_position;
layout(location = 1) in vec3 a_color;

// Pass the colour through to the fragment shader.
out vec3 v_color;

void main() {
  v_color = a_color;
  gl_PointSize = 12.0;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
