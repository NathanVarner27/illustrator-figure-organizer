/*
figure-schema.example.jsx
Reference configuration pattern for adapting the organizer to another figure set.
*/

var FIGURE_ORGANIZER_CONFIG = {
    topLayers: [
        "10 — EXPORT NOTES — NONPRINTING",
        "09 — BRAND MARK — OPTIONAL",
        "08 — SOURCE / QUALIFIER — OPTIONAL",
        "07 — TAKEAWAY — OPTIONAL",
        "06 — EXAMPLES — OPTIONAL",
        "05 — SECONDARY EXPLANATION",
        "04 — PRIMARY LABELS",
        "03 — CORE DIAGRAM",
        "02 — TITLE — VARIANT",
        "01 — BACKGROUND — OPTIONAL",
        "00 — GUIDES / SAFE AREAS"
    ],

    figures: {
        "F01": {
            "07 — TAKEAWAY — OPTIONAL": ["07.01 — KEY TAKEAWAY"],
            "05 — SECONDARY EXPLANATION": ["05.01 — SUPPORTING EXPLANATION"],
            "04 — PRIMARY LABELS": ["04.01 — PRIMARY LABEL"],
            "03 — CORE DIAGRAM": [
                "03.01 — MAIN GEOMETRY",
                "03.02 — CONNECTORS",
                "03.03 — ICONS"
            ]
        }
    }
};
