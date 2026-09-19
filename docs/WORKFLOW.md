# Workflow

The toolkit separates mechanical organization from semantic judgment.

## 1. Prepare source masters

Keep current Illustrator masters in a source folder with the approved top-level architecture.

## 2. Batch organize

Run `figure-batch-organizer.jsx`.

Clearly identifiable items are organized into semantic subgroups. Ambiguous items are preserved in `XX.99 — REVIEW / UNCLASSIFIED`.

## 3. Inventory unresolved material

Run `figure-review-inventory.jsx` on the successful organized folder.

The inventory pass makes no artwork changes and exports TSV/TXT reports with object type, name, visible text, bounds, suggestions, and confidence.

## 4. Human approval

Review the TSV. Use the `Approved Target` field for exact destinations. Cross-top-layer targets can use:

`TOP LAYER > SUBGROUP`

## 5. Deterministic migration

Run `figure-review-migrate.jsx` with the reviewed TSV and the same organized source folder.

The migrator identifies objects by type, name, text preview, and geometric bounds instead of mutable item indexes.

## 6. Validation

Confirm unchanged leaf-artwork counts, zero migration errors, and no unresolved review items unless intentionally retained.

## 7. Visual QA

Compare original master to final reviewed output. Structural success does not prove that stacking order is visually identical.
