#version 300 es
precision highp float;
in vec2 a_position;
in vec3 a_color;
uniform float u_pointSize;
out vec3 v_color;
void main() {
  v_color = a_color;
  gl_PointSize = u_pointSize;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
