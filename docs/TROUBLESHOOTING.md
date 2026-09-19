# Troubleshooting

## Script refuses the selected folder

Use the original master folder for the batch organizer, not an earlier `_ORGANIZED`, `_ORG3`, or `_FINAL_REVIEWED` output folder.

## Windows cannot write a report

Long nested paths can hit Windows path-length limits. Keep working folders reasonably short; the stable scripts also use short report names.

## An object remains in `.99 — REVIEW / UNCLASSIFIED`

Run the review inventory, approve a destination in the TSV, then run the migration script.

## Migration cannot find an item

The source file may have changed since inventory. Regenerate the inventory from the exact source set you intend to migrate.

## Leaf-artwork count changed

Do not promote the output until the discrepancy is understood.

## Structure passes but artwork looks different

Check stacking order inside the destination group and perform a before/after visual comparison.

## Garbled em dashes or arrows in TXT reports

This is usually a text-encoding display issue and does not by itself indicate Illustrator artwork damage.
