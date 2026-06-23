# Visual Targets: geomantic_figures

This document outlines the high‑level visual design for the *Geomantic Figures* project.  The goal is to create a dynamic yet legible presentation of the sixteen geomantic figures along with their derived chart positions.  The implementation uses WebGL2 to draw each dot as a fragment‑shaded circle for crisp rendering on high‑DPI screens.

## Grid Mode

In the default mode the sixteen figures are arranged in a 4×4 grid.  Each figure occupies its own cell and is drawn using four horizontal lines.  An **active line** (represented by a single dot in the traditional art) is encoded as a single point at the centre of the line.  A **passive line** (two dots) is drawn as two equally spaced points.  The grid fills the entire viewport and scales with the browser window.

Elemental colouring is calculated from the binary pattern of the figure.  Active lines contribute to the colour mix: fire (red) for the first line, air (yellow) for the second, water (blue) for the third and earth (brown) for the fourth.  Passive lines do not add to the colour.  When no lines are active the figure is rendered as dark grey.  Families of figures (mothers, daughters, nieces, witnesses, judge and super judge) can be highlighted by increasing brightness for each group.

## House Mode

Toggling house mode (`H`) places the first twelve figures around a circle centred on the canvas.  The twelve positions correspond to the astrological houses, with the first mother at the top (House 1) and subsequent figures proceeding clockwise.  Each figure is rendered much smaller than in grid mode so that the circle remains uncluttered.  The remaining court figures (witnesses, judge and super judge) are not displayed in house mode.

## Animation and Interaction

Although the current implementation draws static points, the underlying framework supports animation.  You could, for example, animate the transition between grid and house modes by interpolating positions over a few hundred milliseconds.  Likewise, casting a new chart (`Space`) could fade out old points and fade in the new ones, and toggling elemental mode (`E`) could interpolate colours.  These behaviours can be implemented by updating the position and colour buffers over time rather than instantly.

## Colour Palette

- **Fire:** `#E74C3C` (red)
- **Air:** `#F1C40F` (yellow)
- **Water:** `#3498DB` (blue)
- **Earth:** `#8E5E3B` (brown)

Feel free to adjust these hues for different moods.  When families are highlighted (`F`), their colours are brightened relative to the base palette to draw the eye to the generational structure of the shield chart.
