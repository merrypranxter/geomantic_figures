"""
Ascii Visualiser
=================

This script provides a quick way to visualise geomantic figures in the
terminal.  It reads definitions from `src/js/figures.js` (duplicated here
for convenience) and prints each figure as four lines of dots.  An
active line (bit=1) is shown as a single `*` centred within a 3‑column
field; a passive line (bit=0) is shown as two `*` separated by a space.

Run this file with Python 3::

    python examples/ascii_visualizer.py

You can modify the `FIGURES` list or the `print_figure` function to
experiment with different layouts or glyphs.
"""

from textwrap import dedent

# Define the figures and their bit patterns (1 = active / single dot)
FIGURES = [
    ('Populus',        [0, 0, 0, 0]),
    ('Via',            [1, 1, 1, 1]),
    ('Puer',           [1, 1, 0, 1]),
    ('Albus',          [0, 0, 1, 0]),
    ('Puella',         [1, 0, 1, 1]),
    ('Rubeus',         [0, 1, 0, 0]),
    ('Laetitia',       [1, 0, 0, 0]),
    ('Caput Draconis', [0, 1, 1, 1]),
    ('Tristitia',      [0, 0, 0, 1]),
    ('Cauda Draconis', [1, 1, 1, 0]),
    ('Amissio',        [1, 0, 1, 0]),
    ('Acquisitio',     [0, 1, 0, 1]),
    ('Carcer',         [1, 0, 0, 1]),
    ('Conjunctio',     [0, 1, 1, 0]),
    ('Fortuna Maior',  [0, 0, 1, 1]),
    ('Fortuna Minor',  [1, 1, 0, 0]),
]


def print_figure(name, bits):
    lines = []
    for bit in bits:
        if bit:
            lines.append('  *  ')
        else:
            lines.append('*   *')
    print(name)
    for line in lines:
        print(line)
    print()


def main():
    for name, bits in FIGURES:
        print_figure(name, bits)


if __name__ == '__main__':
    main()
