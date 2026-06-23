# Math Reference: geomantic_figures

This document outlines the mathematical foundations behind the *Geomantic Figures* implementation.  Understanding these rules is essential for both generating valid shield charts and interpreting them.

## Bit Encoding of Figures

Every geomantic figure consists of four horizontal lines.  Each line can be either **active** (represented by a single dot) or **passive** (represented by two dots).  We encode an active line as `1` and a passive line as `0`.  Reading from top to bottom yields a four‑bit binary number: the first bit corresponds to the element of fire, the second to air, the third to water and the fourth to earth.  For example:

- **Via** (`1111`): all lines are active, indicating motion and change.
- **Populus** (`0000`): all lines are passive, denoting inertia and collectivity.

The implementation stores figures as arrays of four integers (0 or 1) so that individual lines can be accessed directly.

## Generating the Shield Chart

A shield chart is generated from four **mothers**, which are chosen at random.  From these are derived a further twelve figures through simple binary operations.  Addition is performed line by line modulo 2 (i.e. exclusive‑or).  The sequence of derivation is as follows:

1. **Daughters:** For each daughter, take the same‑indexed line from each mother.  Daughter 1 uses the first lines of all mothers, Daughter 2 uses the second lines, and so on.  This step is equivalent to transposing the 4×4 matrix of mother bits.
2. **Nieces:** Also called nephews.  Add pairs of figures:
   - Niece 1 = Mother 1 ⊕ Mother 2
   - Niece 2 = Mother 3 ⊕ Mother 4
   - Niece 3 = Daughter 1 ⊕ Daughter 2
   - Niece 4 = Daughter 3 ⊕ Daughter 4
3. **Witnesses and Judge:** Compute the **right witness** as Niece 1 ⊕ Niece 2 and the **left witness** as Niece 3 ⊕ Niece 4.  The **judge** is the sum of the two witnesses.
4. **Super Judge (Sentence/Reconciler):** Finally, add the first mother to the judge.  This sixteenth figure is traditionally used to forecast longer‑term outcomes and is considered an integral part of the chart by many practitioners.

Because addition is performed modulo 2, these operations commute and associate naturally.  The rules guarantee that the judge will always have an even number of active lines, a useful sanity check when testing your implementation.

## House Allocation

The shield chart consists of sixteen figures, but only the first twelve occupy the astrological houses.  The mapping is straightforward: the first mother goes into House 1, the second mother into House 2 and so on through the four mothers, four daughters and four nieces.  The remaining figures (two witnesses, the judge and the super judge) form the court and do not occupy houses.  The twelve houses are interpreted similarly to those in astrology:

1. **Self** – the querent, their health and disposition.
2. **Wealth** – finances and resources.
3. **Siblings** – communication and close relations.
4. **Home** – foundations, family and property.
5. **Children** – creativity, pleasure and progeny.
6. **Health** – service, illness and labour.
7. **Partners** – marriage, contracts and opponents.
8. **Death** – endings, transformation and inheritance.
9. **Travel** – journeys, higher learning and spirituality.
10. **Career** – vocation, reputation and authority.
11. **Friends** – community, hopes and benefactors.
12. **Sorrows** – hidden enemies, imprisonment and the subconscious.

When the renderer is in *house mode*, these twelve figures are plotted around a circle in order, starting from the top (House 1) and moving clockwise.
