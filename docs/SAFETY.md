# Safety

## Source preservation

Organizer and migration scripts save new copies rather than intentionally overwriting source masters.

## No silent semantic deletion

Ambiguous artwork is placed into `XX.99 — REVIEW / UNCLASSIFIED` rather than deleted.

## Leaf-artwork checks

The scripts count leaf artwork before and after organization. A changed count should be investigated before promoting output.

## Human-reviewed migration

Final migration is driven by explicit approvals and item fingerprints based on type, name, text preview, and geometric bounds.

## What the scripts should not intentionally change

- coordinates
- scale or rotation
- fills or strokes
- opacity
- typography
- effects
- clipping masks
- placed-image content

## Final visual QA is still required

Moving artwork between groups can affect stacking order even when the object itself is unchanged.
