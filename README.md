# Illustrator Figure Organizer

A conservative Adobe Illustrator ExtendScript toolkit for batch auditing, semantic grouping, review, and deterministic migration of complex figure layer systems.

## What it does

- Batch-processes Illustrator master files.
- Preserves an approved top-level layer architecture.
- Creates semantic subgroup structures.
- Routes clearly identifiable artwork into named groups.
- Sends ambiguous material to `XX.99 — REVIEW / UNCLASSIFIED`.
- Inventories unresolved items without modifying artwork.
- Supports human-reviewed, deterministic migration.
- Checks artwork leaf counts before and after organization.
- Saves new output copies instead of overwriting source files.

## Included scripts

### `scripts/figure-batch-organizer.jsx`

Batch organizer based on the stable v3 production workflow.

### `scripts/figure-review-inventory.jsx`

Read-only review inventory that exports TSV/TXT reports.

### `scripts/figure-review-migrate.jsx`

Deterministic human-approved migration using item fingerprints and explicit destinations.

## Workflow

```text
ORIGINAL MASTER
      |
      v
Batch Organizer
      |
      v
_ORG3
      |
      v
Review Inventory
      |
      v
REVIEW_INVENTORY.tsv
      |
      v
Human Approval
      |
      v
Reviewed TSV
      |
      v
Review Migrator
      |
      v
_FINAL_REVIEWED
      |
      v
Visual QA
```

See [`docs/WORKFLOW.md`](docs/WORKFLOW.md) for details.

## Installation

In Adobe Illustrator:

1. Open Illustrator.
2. Choose **File > Scripts > Other Script...**
3. Select the `.jsx` script you want to run.

## Safety

The scripts do not intentionally redesign artwork, change coordinates, typography, fills, strokes, effects, or clipping masks. They save new output copies instead of intentionally overwriting source masters. Ambiguous items are surfaced for review rather than silently deleted.

See [`docs/SAFETY.md`](docs/SAFETY.md).

## Repository layout

```text
illustrator-figure-organizer/
├─ README.md
├─ LICENSE
├─ CHANGELOG.md
├─ .gitignore
├─ scripts/
│  ├─ figure-batch-organizer.jsx
│  ├─ figure-review-inventory.jsx
│  └─ figure-review-migrate.jsx
├─ config/
│  ├─ figure-schema.example.jsx
│  └─ pitch-companion-schema.jsx
├─ docs/
│  ├─ WORKFLOW.md
│  ├─ SAFETY.md
│  ├─ NAMING-STANDARD.md
│  └─ TROUBLESHOOTING.md
└─ examples/
   ├─ sample-review-inventory.tsv
   ├─ sample-batch-summary.txt
   └─ sample-final-summary.txt
```

## Versioning

This cleaned repository package starts at **v1.0.0**. Use Git tags and GitHub Releases instead of adding `_v2`, `_v3`, or `_FINAL` to working filenames.

## License

MIT. See [`LICENSE`](LICENSE).
