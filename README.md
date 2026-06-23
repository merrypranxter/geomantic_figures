# geomantic_figures

> 16 figures. 4 lines. earth divination by dot pattern.

A complete geomancy divination system rendered as interactive grid patterns. The 16 geomantic figures (Via, Populus, Conjunctio, Puella, etc.) are 4-line dot patterns with elemental composition. Shield chart casting generates figures from random mothers through daughter/nephew/court derivation. House allocation maps figures to 12 astrological houses.

## Live Controls

| Key | Action |
|-----|--------|
| `Space` | Cast new shield chart (4 random mothers) |
| `H` | Toggle house chart view |
| `E` | Show elemental composition |
| `F` | Highlight figure family (mother/daughter/nephew/court) |
| `1–16` | Display specific figure info |

## Named Regimes

- **Shield Chart** — Standard 16-figure generational layout
- **House Chart** — 12 astrological houses with figure allocation
- **Elemental Mode** — Color by fire/air/water/earth composition
- **Figure Families** — Trace mother→daughter→nephew→court lines
- **Daily Figure** — Planetary hour ruler determines figure

## The Math

Each figure is a 4-bit code (0=1 dot, 1=2 dots per line). Lines are read top to bottom.

Figure generation from 4 mothers:
- Daughters: invert mother lines (line 1 becomes line 4, etc.)
- Nephews: add (mod 2) pairs of mothers
- Court: add nephews to get witnesses, then add witnesses for judge

Elemental composition: count 2-dot lines per element:
- Fire: line 1
- Air: line 2
- Water: line 3
- Earth: line 4

## Acknowledgments

Medieval geomantic tradition, *The Art and Practice of Geomancy* by John Michael Greer, Agrippa's *De Occulta Philosophia*.
