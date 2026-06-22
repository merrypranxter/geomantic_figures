#version 300 es

// Fragment shader for geomantic figures.  It shades each point with
// the interpolated colour passed from the vertex stage.  We discard
// fragments outside a circular area within the point sprite to give a
// rounded dot appearance.

precision mediump float;

in vec3 v_color;
out vec4 outColor;

void main() {
  // Compute the distance from the fragment coordinate to the centre
  // of the point.  gl_PointCoord ranges from 0 to 1 across the
  // current point sprite.
  float dist = length(gl_PointCoord - vec2(0.5));
  if (dist > 0.5) {
    discard;
  }
  outColor = vec4(v_color, 1.0);
}
