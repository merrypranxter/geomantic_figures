// Placeholder fragment shader for house mode.  Currently unused.

#version 300 es
precision highp float;
in vec3 v_color;
out vec4 outColor;
void main() {
  float dist = distance(gl_PointCoord, vec2(0.5));
  if (dist > 0.5) discard;
  outColor = vec4(v_color, 1.0);
}
