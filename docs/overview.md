---
# Copilot Custom Agent for the geomantic_figures repository
# https://gh.io/customagents/config

name: geomantic_figures
description: |
  A creative coding shader project: 16 geomantic figures (Via, Populus, Conjunctio...) rendered as dot-pattern grids. Shield chart casting with house allocation. Elemental composition (fire/air/water/earth lines) drives color. Mother-daughter-nephew-court family generation via line extraction.
  Archetype: GPGPU_GRID_SIM
  Batch: D
---

# My Agent

## What this project does

16 geomantic figures (Via, Populus, Conjunctio...) rendered as dot-pattern grids. Shield chart casting with house allocation. Elemental composition (fire/air/water/earth lines) drives color. Mother-daughter-nephew-court family generation via line extraction.

## Tech stack

- WebGL2 (no frameworks)
- Vanilla JS modules
- GLSL shaders (fragment + vertex)
- FBO ping-pong for feedback effects (where applicable)
- Archetype: GPGPU_GRID_SIM

## How to run

Open `index.html` in any modern browser. No build step required.

## Files of note

- `index.html` — entry point
- `src/js/main.js` — renderer loop
- `src/shaders/*.glsl` — GPU programs
- `docs/` — design notes and references

## Design constraints

- 60 fps on mid-range hardware
- Mobile-friendly touch controls where applicable
- Self-contained, no external dependencies
