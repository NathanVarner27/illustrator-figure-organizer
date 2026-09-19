/*
Figure_System_Batch_Organizer_v3.jsx
Adobe Illustrator / ExtendScript

BATCH ORGANIZER v3 FOR THE PITCH DEVELOPMENT TECHNICAL COMPANION

WHAT THIS VERSION DOES
----------------------
- Processes every supported F01-F16 MASTER .ai file in one selected folder.
- Detects F01-F16, including F03A/F03B, from each filename.
- Normalizes the locked 11-layer 10->00 top-level architecture.
- Creates the figure-specific subgroup skeleton inside those layers.
- Renames obvious semantic aliases.
- Attempts conservative keyword routing for clearly identifiable text/groups.
- Routes ambiguous DIRECT children into "XX.99 — REVIEW / UNCLASSIFIED"
  inside the SAME top-level layer.
- Never changes coordinates, fills, strokes, typography, opacity, effects,
  clipping masks, or internal grouping of artwork.
- Saves ORGANIZED COPIES to a new timestamped folder.
- Leaves every source .ai file untouched.
- Writes one batch summary and one detailed report per figure.

IMPORTANT
---------
This is intentionally aggressive about ORGANIZATION, not about artwork.
It does not attempt to redesign or semantically guess ambiguous material.
Anything uncertain is preserved in a REVIEW group.

Run:
Illustrator > File > Scripts > Other Script...
*/

#target illustrator

(function () {
    if (app.name.toLowerCase().indexOf("illustrator") < 0) {
        alert("This script must be run from Adobe Illustrator.");
        return;
    }

    // =====================================================================
    // LOCKED TOP-LEVEL SYSTEM
    // =====================================================================

    var TOP_LAYERS = [
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
    ];

    var COMMON = {
        "10 — EXPORT NOTES — NONPRINTING": [
            "10.01 — MASTER EXPORT",
            "10.02 — VARIANT NOTES",
            "10.03 — PRODUCTION WARNINGS"
        ],
        "09 — BRAND MARK — OPTIONAL": [
            "09.01 — BRAND MARK"
        ],
        "08 — SOURCE / QUALIFIER — OPTIONAL": [
            "08.01 — SOURCES",
            "08.02 — QUALIFIERS",
            "08.03 — ATTRIBUTION / NOTES"
        ],
        "02 — TITLE — VARIANT": [
            "02.01 — FIGURE NUMBER",
            "02.02 — TITLE",
            "02.03 — SUBTITLE"
        ],
    };

    // =====================================================================
    // FIGURE-SPECIFIC SUBGROUP SCHEMAS
    // =====================================================================

    var FIGURES = {
        "F01": {
            "07 — TAKEAWAY — OPTIONAL": ["07.01 — CLASSIFICATION TAKEAWAY"],
            "06 — EXAMPLES — OPTIONAL": ["06.01 — EXAMPLE CALLOUTS"],
            "05 — SECONDARY EXPLANATION": [
                "05.01 — MEDIUM — EXPLANATION",
                "05.02 — DURATION — EXPLANATION",
                "05.03 — FORM — EXPLANATION",
                "05.04 — DEMOGRAPHIC — EXPLANATION",
                "05.05 — GENRE — EXPLANATION",
                "05.06 — TECHNIQUE — EXPLANATION",
                "05.07 — STRUCTURE — EXPLANATION",
                "05.08 — RATING — EXPLANATION",
                "05.09 — SOURCE / ADAPTATION — EXPLANATION"
            ],
            "04 — PRIMARY LABELS": [
                "04.01 — MEDIUM",
                "04.02 — DURATION",
                "04.03 — FORM",
                "04.04 — DEMOGRAPHIC",
                "04.05 — GENRE",
                "04.06 — TECHNIQUE",
                "04.07 — STRUCTURE",
                "04.08 — RATING",
                "04.09 — SOURCE / ADAPTATION"
            ],
            "03 — CORE DIAGRAM": [
                "03.01 — DIMENSION GRID",
                "03.02 — DIMENSION CONTAINERS",
                "03.03 — DIMENSION ICONS",
                "03.04 — DIVIDERS / CONNECTORS"
            ]
        },

        "F02": {
            "07 — TAKEAWAY — OPTIONAL": ["07.01 — STORY-SUSTAIN TAKEAWAY"],
            "06 — EXAMPLES — OPTIONAL": [
                "06.01 — SHORT — EXAMPLES",
                "06.02 — FEATURE — EXAMPLES",
                "06.03 — LIMITED SERIES — EXAMPLES",
                "06.04 — ONGOING SERIES — EXAMPLES"
            ],
            "05 — SECONDARY EXPLANATION": [
                "05.01 — SHORT — EXPLANATION",
                "05.02 — FEATURE — EXPLANATION",
                "05.03 — LIMITED SERIES — EXPLANATION",
                "05.04 — ONGOING SERIES — EXPLANATION"
            ],
            "04 — PRIMARY LABELS": [
                "04.01 — SHORT",
                "04.02 — FEATURE",
                "04.03 — LIMITED SERIES",
                "04.04 — ONGOING SERIES"
            ],
            "03 — CORE DIAGRAM": [
                "03.01 — CONTINUUM AXIS",
                "03.02 — FORMAT NODES",
                "03.03 — PROGRESSION ARROWS",
                "03.04 — NODE ICONS"
            ]
        },

        "F03A": {
            "07 — TAKEAWAY — OPTIONAL": ["07.01 — WHY THIS MATTERS"],
            "06 — EXAMPLES — OPTIONAL": [
                "06.01 — PRESCHOOL — EXAMPLE",
                "06.02 — CHILDREN — EXAMPLE",
                "06.03 — TEEN / YA — EXAMPLE",
                "06.04 — FAMILY — EXAMPLE",
                "06.05 — ADULT — EXAMPLE"
            ],
            "05 — SECONDARY EXPLANATION": [
                "05.01 — PRESCHOOL — EXPLANATION",
                "05.02 — CHILDREN — EXPLANATION",
                "05.03 — TEEN / YA — EXPLANATION",
                "05.04 — FAMILY — EXPLANATION",
                "05.05 — ADULT — EXPLANATION",
                "05.06 — SHARED ELEMENTS"
            ],
            "04 — PRIMARY LABELS": [
                "04.01 — PRESCHOOL",
                "04.02 — CHILDREN",
                "04.03 — TEEN / YA",
                "04.04 — FAMILY",
                "04.05 — ADULT",
                "04.06 — CORE PREMISE",
                "04.07 — PORTABLE CORE / PITCH SHIFT"
            ],
            "03 — CORE DIAGRAM": [
                "03.01 — DEMOGRAPHIC REGIONS",
                "03.02 — OVERLAP REGIONS",
                "03.03 — SHARED PREMISE CORE",
                "03.04 — DEMOGRAPHIC ICONS",
                "03.05 — SUPPORTING GEOMETRY"
            ]
        },

        "F03B": {
            "07 — TAKEAWAY — OPTIONAL": ["07.01 — OVERLAP TAKEAWAY"],
            "06 — EXAMPLES — OPTIONAL": ["06.01 — DEMOGRAPHIC / OVERLAP EXAMPLES"],
            "05 — SECONDARY EXPLANATION": [
                "05.01 — DEMOGRAPHIC DESCRIPTIONS",
                "05.02 — SHARED ELEMENTS",
                "05.03 — CORE EXPLANATION"
            ],
            "04 — PRIMARY LABELS": [
                "04.01 — PRESCHOOL",
                "04.02 — CHILDREN",
                "04.03 — TEEN / YA",
                "04.04 — FAMILY",
                "04.05 — ADULT"
            ],
            "03 — CORE DIAGRAM": [
                "03.01 — DEMOGRAPHIC CIRCLES",
                "03.02 — OVERLAP REGIONS",
                "03.03 — SHARED CORE",
                "03.04 — ICONS"
            ]
        },

        "F04": {
            "07 — TAKEAWAY — OPTIONAL": ["07.01 — TERMINOLOGY TAKEAWAY"],
            "06 — EXAMPLES — OPTIONAL": [
                "06.01 — ANIME — EXAMPLES",
                "06.02 — AMERICAN ANIMATION — EXAMPLES",
                "06.03 — TRANSNATIONAL — EXAMPLES"
            ],
            "05 — SECONDARY EXPLANATION": [
                "05.01 — ANIME — DEFINITION",
                "05.02 — AMERICAN ANIMATION — DEFINITION",
                "05.03 — TRANSNATIONAL PRODUCTION — EXPLANATION"
            ],
            "04 — PRIMARY LABELS": [
                "04.01 — ANIME",
                "04.02 — AMERICAN ANIMATION",
                "04.03 — TRANSNATIONAL PRODUCTION"
            ],
            "03 — CORE DIAGRAM": [
                "03.01 — CATEGORY REGIONS",
                "03.02 — RELATIONSHIP GEOMETRY",
                "03.03 — ICONS",
                "03.04 — DIVIDERS"
            ]
        },

        "F05": {
            "07 — TAKEAWAY — OPTIONAL": ["07.01 — TECHNIQUE TAKEAWAY"],
            "06 — EXAMPLES — OPTIONAL": [
                "06.01 — LIVE ACTION — EXAMPLES",
                "06.02 — ANIMATION — EXAMPLES",
                "06.03 — HYBRID — EXAMPLES"
            ],
            "05 — SECONDARY EXPLANATION": [
                "05.01 — SOURCE — EXPLANATION",
                "05.02 — LIVE ACTION — EXPLANATION",
                "05.03 — ANIMATION — EXPLANATION",
                "05.04 — HYBRID — EXPLANATION"
            ],
            "04 — PRIMARY LABELS": [
                "04.01 — SOURCE",
                "04.02 — LIVE ACTION",
                "04.03 — ANIMATION",
                "04.04 — HYBRID"
            ],
            "03 — CORE DIAGRAM": [
                "03.01 — SOURCE / STARTING WORK",
                "03.02 — LIVE-ACTION PATH",
                "03.03 — ANIMATION PATH",
                "03.04 — HYBRID PATH",
                "03.05 — CONNECTORS",
                "03.06 — ICONS"
            ]
        },

        "F06": {
            "07 — TAKEAWAY — OPTIONAL": ["07.01 — RHETORIC TAKEAWAY"],
            "06 — EXAMPLES — OPTIONAL": [
                "06.01 — NARRATIVE — EXAMPLES",
                "06.02 — DOCUMENTARY — EXAMPLES",
                "06.03 — BOUNDARY — EXAMPLES"
            ],
            "05 — SECONDARY EXPLANATION": [
                "05.01 — NARRATIVE PITCH LANGUAGE",
                "05.02 — DOCUMENTARY PITCH LANGUAGE",
                "05.03 — HYBRID / BOUNDARY EXPLANATION"
            ],
            "04 — PRIMARY LABELS": [
                "04.01 — NARRATIVE",
                "04.02 — DOCUMENTARY",
                "04.03 — WHEN METHODS BLUR"
            ],
            "03 — CORE DIAGRAM": [
                "03.01 — NARRATIVE REGION",
                "03.02 — DOCUMENTARY REGION",
                "03.03 — BLURRED METHODS REGION",
                "03.04 — CONNECTORS / DIVIDERS",
                "03.05 — ICONS"
            ]
        },

        "F07": {
            "07 — TAKEAWAY — OPTIONAL": ["07.01 — FORMAT ADAPTATION TAKEAWAY"],
            "06 — EXAMPLES — OPTIONAL": [
                "06.01 — CONAN — EXAMPLE",
                "06.02 — JACKASS — EXAMPLE",
                "06.03 — AUDIO / PODCAST — EXAMPLES",
                "06.04 — OTHER PROPERTY — EXAMPLES"
            ],
            "05 — SECONDARY EXPLANATION": [
                "05.01 — ENGINE 1 — EXPLANATION",
                "05.02 — ENGINE 2 — EXPLANATION",
                "05.03 — ENGINE 3 — EXPLANATION"
            ],
            "04 — PRIMARY LABELS": [
                "04.01 — SOURCE / BRAND",
                "04.02 — ENGINE 1",
                "04.03 — ENGINE 2",
                "04.04 — ENGINE 3",
                "04.05 — DESTINATION FORMATS"
            ],
            "03 — CORE DIAGRAM": [
                "03.01 — SOURCE / BRAND",
                "03.02 — ENGINE 1",
                "03.03 — ENGINE 2",
                "03.04 — ENGINE 3",
                "03.05 — FORMAT DESTINATIONS",
                "03.06 — CONNECTORS",
                "03.07 — ICONS"
            ]
        },

        "F08": {
            "08 — SOURCE / QUALIFIER — OPTIONAL": [
                "08.01 — MPA SOURCE",
                "08.02 — TV GUIDELINES SOURCE",
                "08.03 — QUALIFIER"
            ],
            "07 — TAKEAWAY — OPTIONAL": ["07.01 — FILM / TV DISTINCTION"],
            "05 — SECONDARY EXPLANATION": [
                "05.01 — FILM SYSTEM — EXPLANATION",
                "05.02 — TV SYSTEM — EXPLANATION",
                "05.03 — DESCRIPTOR — EXPLANATION"
            ],
            "04 — PRIMARY LABELS": [
                "04.01 — MPA HEADING",
                "04.02 — FILM RATING LABELS",
                "04.03 — TV GUIDELINES HEADING",
                "04.04 — TV RATING LABELS",
                "04.05 — CONTENT DESCRIPTOR LABELS"
            ],
            "03 — CORE DIAGRAM": [
                "03.01 — FILM RATING LADDER",
                "03.02 — TV RATING LADDER",
                "03.03 — CONTENT DESCRIPTOR SYSTEM",
                "03.04 — DIVIDERS / STRUCTURE"
            ]
        },

        "F09": {
            "07 — TAKEAWAY — OPTIONAL": ["07.01 — RATING ≠ DEMOGRAPHIC TAKEAWAY"],
            "05 — SECONDARY EXPLANATION": [
                "05.01 — AUDIENCE — EXPLANATION",
                "05.02 — FILM POSITIONING — EXPLANATION",
                "05.03 — TV POSITIONING — EXPLANATION"
            ],
            "04 — PRIMARY LABELS": [
                "04.01 — COLUMN HEADINGS",
                "04.02 — DEMOGRAPHIC LABELS",
                "04.03 — FILM RATING LABELS",
                "04.04 — TV RATING LABELS"
            ],
            "03 — CORE DIAGRAM": [
                "03.01 — DEVELOPMENT AUDIENCE COLUMN",
                "03.02 — FILM POSITIONING COLUMN",
                "03.03 — TV POSITIONING COLUMN",
                "03.04 — RATING BANDS",
                "03.05 — DIVIDERS / EMPHASIS"
            ]
        },

        "F10": {
            "07 — TAKEAWAY — OPTIONAL": ["07.01 — CREATIVE CONSTRAINT TAKEAWAY"],
            "06 — EXAMPLES — OPTIONAL": ["06.01 — CASE EXAMPLES"],
            "05 — SECONDARY EXPLANATION": [
                "05.01 — TELEVISION — EXPLANATION",
                "05.02 — FILM — EXPLANATION",
                "05.03 — GAMES — EXPLANATION"
            ],
            "04 — PRIMARY LABELS": [
                "04.01 — MEDIA HEADINGS",
                "04.02 — CONSTRAINT LABELS"
            ],
            "03 — CORE DIAGRAM": [
                "03.01 — TELEVISION PANEL",
                "03.02 — FILM PANEL",
                "03.03 — GAMES PANEL",
                "03.04 — CONSTRAINT ICONS",
                "03.05 — EXAMPLE STRIP",
                "03.06 — DIVIDERS / CONNECTORS"
            ]
        },

        "F11": {
            "08 — SOURCE / QUALIFIER — OPTIONAL": [
                "08.01 — SOURCES",
                "08.02 — JURISDICTION QUALIFIERS",
                "08.03 — ATTRIBUTION / NOTES"
            ],
            "07 — TAKEAWAY — OPTIONAL": ["07.01 — CONSTRAINT / WORKAROUND TAKEAWAY"],
            "06 — EXAMPLES — OPTIONAL": ["06.01 — REAL EXAMPLES / WORKAROUNDS"],
            "05 — SECONDARY EXPLANATION": ["05.01 — CATEGORY EXPLANATIONS"],
            "04 — PRIMARY LABELS": ["04.01 — SECTION / CATEGORY HEADINGS"],
            "03 — CORE DIAGRAM": [
                "03.01 — CLASSIFICATION / LEGAL CONSTRAINTS",
                "03.02 — CULTURAL / TABOO CATEGORIES",
                "03.03 — CREATIVE WORKAROUNDS",
                "03.04 — CATEGORY ICONS",
                "03.05 — CONNECTORS / DIVIDERS"
            ]
        },

        "F12": {
            "07 — TAKEAWAY — OPTIONAL": ["07.01 — ADAPTATION TAKEAWAY"],
            "06 — EXAMPLES — OPTIONAL": ["06.01 — ADAPTATION EXAMPLES"],
            "05 — SECONDARY EXPLANATION": [
                "05.01 — PRESERVE — EXPLANATION",
                "05.02 — TRANSFORM — EXPLANATION",
                "05.03 — DESTINATION MEDIUM — EXPLANATION"
            ],
            "04 — PRIMARY LABELS": [
                "04.01 — PRESERVE",
                "04.02 — TRANSFORM",
                "04.03 — DESTINATION MEDIUM"
            ],
            "03 — CORE DIAGRAM": [
                "03.01 — TRIANGLE",
                "03.02 — THREE NODES",
                "03.03 — DIRECTIONAL RELATIONSHIPS",
                "03.04 — CENTER / OVERLAP"
            ]
        },

        "F13": {
            "08 — SOURCE / QUALIFIER — OPTIONAL": [
                "08.01 — MAP SOURCES",
                "08.02 — AUTHORITY SOURCES",
                "08.03 — QUALIFIERS"
            ],
            "07 — TAKEAWAY — OPTIONAL": ["07.01 — INTERNATIONAL CLASSIFICATION TAKEAWAY"],
            "05 — SECONDARY EXPLANATION": [
                "05.01 — GOVERNANCE GROUPING",
                "05.02 — MAP EXPLANATION",
                "05.03 — ORIENTATION NOTE"
            ],
            "04 — PRIMARY LABELS": [
                "04.01 — CA — CANADA",
                "04.02 — US — UNITED STATES",
                "04.03 — FR — FRANCE",
                "04.04 — IE — IRELAND",
                "04.05 — UK — UNITED KINGDOM",
                "04.06 — ZA — SOUTH AFRICA",
                "04.07 — LK — SRI LANKA",
                "04.08 — NL — NETHERLANDS",
                "04.09 — DE — GERMANY",
                "04.10 — SG — SINGAPORE",
                "04.11 — AU — AUSTRALIA",
                "04.12 — JP — JAPAN",
                "04.13 — KR — SOUTH KOREA",
                "04.14 — IN — INDIA",
                "04.15 — NZ — NEW ZEALAND"
            ],
            "03 — CORE DIAGRAM": [
                "03.01 — WORLD MAP",
                "03.02 — HIGHLIGHTED TERRITORIES",
                "03.03 — COUNTRY ANCHORS",
                "03.04 — LEADER LINES",
                "03.05 — MAP KEY / LEGEND",
                "03.06 — MAP SYMBOLS"
            ]
        },

        "F14": {
            "07 — TAKEAWAY — OPTIONAL": ["07.01 — INTERNATIONAL PROFILE TAKEAWAY"],
            "06 — EXAMPLES — OPTIONAL": ["06.01 — COUNTRY EXAMPLES / EXCEPTIONS"],
            "05 — SECONDARY EXPLANATION": ["05.01 — PROFILE EXPLANATIONS"],
            "04 — PRIMARY LABELS": ["04.01 — PROFILE / SYSTEM HEADINGS"],
            "03 — CORE DIAGRAM": [
                "03.01 — PROFILE CARDS",
                "03.02 — PROFILE ICONS",
                "03.03 — CARD DIVIDERS",
                "03.04 — SYSTEM KEY / LEGEND",
                "03.05 — SUPPORTING GEOMETRY"
            ]
        },

        "F15": {
            "08 — SOURCE / QUALIFIER — OPTIONAL": [
                "08.01 — F11 ICON PROVENANCE",
                "08.02 — F14 ICON PROVENANCE",
                "08.03 — EXTERNAL SOURCES"
            ],
            "07 — TAKEAWAY — OPTIONAL": ["07.01 — KEY TAKEAWAYS"],
            "05 — SECONDARY EXPLANATION": [
                "05.01 — FORMAL CLASSIFICATION — EXPLANATIONS",
                "05.02 — OVERLAP — EXPLANATIONS",
                "05.03 — CULTURAL / MARKET — EXPLANATIONS"
            ],
            "04 — PRIMARY LABELS": [
                "04.01 — FORMAL CLASSIFICATION",
                "04.02 — SIGNIFICANT OVERLAP",
                "04.03 — CULTURAL / MARKET SENSITIVITIES",
                "04.04 — CATEGORY LABELS"
            ],
            "03 — CORE DIAGRAM": [
                "03.01 — FORMAL CLASSIFICATION REGION",
                "03.02 — OVERLAP REGION",
                "03.03 — CULTURAL / MARKET REGION",
                "03.04 — FORMAL CLASSIFICATION ICONS",
                "03.05 — OVERLAP ICONS",
                "03.06 — CULTURAL / MARKET ICONS",
                "03.07 — RELATIONSHIP GEOMETRY"
            ]
        },

        "F16": {
            "07 — TAKEAWAY — OPTIONAL": ["07.01 — SCOPE BOUNDARY TAKEAWAY"],
            "05 — SECONDARY EXPLANATION": ["05.01 — RESOURCE / STAGE EXPLANATIONS"],
            "04 — PRIMARY LABELS": [
                "04.01 — COMPANION CORE",
                "04.02 — PITCH DOCUMENTS",
                "04.03 — RESEARCH",
                "04.04 — CRAFT / DESIGN",
                "04.05 — BUDGET / BUSINESS",
                "04.06 — PRODUCTION / RELEASE",
                "04.07 — SPECIALIST RESOURCES"
            ],
            "03 — CORE DIAGRAM": [
                "03.01 — COMPANION CORE",
                "03.02 — PITCH DOCUMENTS",
                "03.03 — RESEARCH",
                "03.04 — CRAFT / DESIGN",
                "03.05 — BUDGET / BUSINESS",
                "03.06 — PRODUCTION / RELEASE",
                "03.07 — SPECIALIST RESOURCES",
                "03.08 — CONNECTORS",
                "03.09 — ICONS"
            ]
        }
    };

    // =====================================================================
    // BATCH UI
    // =====================================================================

    var sourceFolder = Folder.selectDialog(
        "Select the ORIGINAL folder containing the current F01-F16 MASTER .ai files."
    );
    if (!sourceFolder) return;

    // v3 safeguard: never process output from an earlier organizer pass.
    var sourcePathUpper = sourceFolder.fsName.toUpperCase();
    if (sourcePathUpper.indexOf("_ORGANIZED") >= 0 ||
        sourcePathUpper.indexOf("_ORG3") >= 0) {
        alert(
            "STOP — select the ORIGINAL MASTER folder, not an organized-output folder.\n\n" +
            "Selected:\n" + sourceFolder.fsName + "\n\n" +
            "v3 intentionally refuses recursive/reprocessed organizer output."
        );
        return;
    }

    var aiFiles = sourceFolder.getFiles(function (f) {
        if (!(f instanceof File)) return false;
        var n = f.name;
        if (!/\.ai$/i.test(n)) return false;
        if (!/F(0[1-9]|1[0-6])([AB])?/i.test(n)) return false;
        if (n.toUpperCase().indexOf("MASTER") < 0) return false;
        if (n.toUpperCase().indexOf("ORGANIZED") >= 0) return false;
        return true;
    });

    if (!aiFiles || aiFiles.length === 0) {
        alert("No supported F01-F16 MASTER .ai files were found in:\n" + sourceFolder.fsName);
        return;
    }

    var dlg = new Window("dialog", "Batch Figure Organizer");
    dlg.orientation = "column";
    dlg.alignChildren = "fill";

    var msg = dlg.add("statictext", undefined,
        "Found " + aiFiles.length + " MASTER .ai file(s).\n\n" +
        "The script will create ORGANIZED COPIES in a new _ORG3 timestamped folder.\n" +
        "Your source .ai files will NOT be overwritten.",
        {multiline:true});
    msg.preferredSize.width = 530;

    var opts = dlg.add("panel", undefined, "Automation");
    opts.orientation = "column";
    opts.alignChildren = "left";

    var keywordRoute = opts.add("checkbox", undefined,
        "Route clear semantic matches using group names/text keywords");
    keywordRoute.value = true;

    var reviewRoute = opts.add("checkbox", undefined,
        "Move ambiguous direct items/groups into XX.99 — REVIEW / UNCLASSIFIED");
    reviewRoute.value = true;

    var normalizeTop = opts.add("checkbox", undefined,
        "Normalize exact top-level names and 10→00 order");
    normalizeTop.value = true;

    var makeAllGroups = opts.add("checkbox", undefined,
        "Create the complete subgroup skeleton, including empty optional groups");
    makeAllGroups.value = true;

    var buttons = dlg.add("group");
    buttons.alignment = "right";
    buttons.add("button", undefined, "Cancel", {name:"cancel"});
    buttons.add("button", undefined, "Organize All", {name:"ok"});

    if (dlg.show() !== 1) return;

    var stamp = compactStamp();
    var outputFolder = new Folder(sourceFolder.fsName + "/_ORG3_" + stamp);
    if (!outputFolder.exists && !outputFolder.create()) {
        alert("Could not create output folder:\n" + outputFolder.fsName);
        return;
    }

    var reportFolder = new Folder(outputFolder.fsName + "/_R");
    if (!reportFolder.exists) reportFolder.create();

    var batchReport = [];
    batchReport.push("FIGURE SYSTEM BATCH ORGANIZER v3");
    batchReport.push("==============================================");
    batchReport.push("Source folder: " + sourceFolder.fsName);
    batchReport.push("Output folder: " + outputFolder.fsName);
    batchReport.push("Files found: " + aiFiles.length);
    batchReport.push("Timestamp: " + nowStamp());
    batchReport.push("");
    batchReport.push("SOURCE FILES WERE NOT OVERWRITTEN.");
    batchReport.push("");

    var processed = 0;
    var failed = 0;
    var skipped = 0;

    for (var fi = 0; fi < aiFiles.length; fi++) {
        var sourceFile = aiFiles[fi];
        var fig = detectFigureId(sourceFile.name);

        if (!fig || !FIGURES[fig]) {
            skipped++;
            batchReport.push("SKIP — " + sourceFile.name + " — unsupported figure ID.");
            continue;
        }

        var per = [];
        per.push("FIGURE ORGANIZATION REPORT");
        per.push("==============================================");
        per.push("Source: " + sourceFile.fsName);
        per.push("Figure: " + fig);
        per.push("Timestamp: " + nowStamp());
        per.push("");

        var doc = null;

        try {
            doc = app.open(sourceFile);
            app.activeDocument = doc;

            // v3 processes only the clean original masters. If the exact locked
            // 10→00 source structure is not present, skip instead of compounding a prior pass.
            if (!topOrderIsExact(doc)) {
                per.push("SOURCE VALIDATION FAILED");
                per.push("----------------------------------------------");
                per.push("Expected exact original 10→00 top-level order.");
                per.push("Actual: " + getTopLayerSnapshot(doc).join(" | "));

                var skipReport = new File(
                    reportFolder.fsName + "/" + fig + "_SOURCE_REVIEW.txt"
                );
                writeTextFile(skipReport, per.join("\r\n"));

                batchReport.push("SKIP — " + sourceFile.name +
                                 " — source top-level order is not the locked original 10→00 structure.");
                skipped++;

                doc.close(SaveOptions.DONOTSAVECHANGES);
                doc = null;
                continue;
            }

            var beforeLeaves = countDocumentLeaves(doc);
            var beforeTop = getTopLayerSnapshot(doc);

            per.push("BEFORE");
            per.push("----------------------------------------------");
            per.push("Leaf artwork count: " + beforeLeaves);
            per.push("Top-level layers: " + beforeTop.join(" | "));
            per.push("");

            if (normalizeTop.value) {
                normalizeTopLayers(doc, per);
            }

            var schema = getSchema(fig);
            createCompleteSkeleton(doc, fig, schema, makeAllGroups.value, per);

            // First: rename direct semantic aliases inside correct top layers.
            renameSemanticAliases(doc, schema, per);

            // Second: route direct content.
            routeAllTopLayers(
                doc,
                fig,
                schema,
                keywordRoute.value,
                reviewRoute.value,
                per
            );

            // Keep expected semantic groups ordered within each top layer.
            orderExpectedGroups(doc, schema, per);

            var afterLeaves = countDocumentLeaves(doc);

            per.push("");
            per.push("AFTER");
            per.push("----------------------------------------------");
            per.push("Leaf artwork count: " + afterLeaves);

            if (beforeLeaves === afterLeaves) {
                per.push("SAFETY COUNT: PASS — leaf artwork count unchanged.");
            } else {
                per.push("SAFETY COUNT: WARNING — leaf artwork count changed from " +
                         beforeLeaves + " to " + afterLeaves + ".");
            }

            per.push("");
            validateOrganization(doc, fig, schema, per);

            var outFile = new File(outputFolder.fsName + "/" + sourceFile.name);
            saveOrganizedCopy(doc, outFile);

            per.push("");
            per.push("Saved organized copy:");
            per.push(outFile.fsName);

            var detailFile = new File(
                reportFolder.fsName + "/" + fig + "_REPORT.txt"
            );

            var reportWriteOK = true;
            try {
                writeTextFile(detailFile, per.join("\r\n"));
            } catch (reportErr) {
                reportWriteOK = false;
                batchReport.push("REPORT WARNING — " + sourceFile.name +
                                 " — organized AI copy saved, but report write failed: " + reportErr);
            }

            processed++;
            batchReport.push("PASS — " + sourceFile.name +
                             " → " + outFile.name +
                             " | leaves " + beforeLeaves + "→" + afterLeaves +
                             (reportWriteOK ? "" : " | REPORT WRITE WARNING"));

            doc.close(SaveOptions.DONOTSAVECHANGES);
            doc = null;
        }
        catch (err) {
            failed++;
            batchReport.push("ERROR — " + sourceFile.name + " — " + err);
            per.push("");
            per.push("ERROR");
            per.push("----------------------------------------------");
            per.push(String(err));

            try {
                var errFile = new File(reportFolder.fsName + "/" + fig + "_ERROR.txt");
                writeTextFile(errFile, per.join("\r\n"));
            } catch (e2) {}

            if (doc) {
                try { doc.close(SaveOptions.DONOTSAVECHANGES); } catch (e3) {}
                doc = null;
            }
        }
    }

    batchReport.push("");
    batchReport.push("SUMMARY");
    batchReport.push("----------------------------------------------");
    batchReport.push("Processed: " + processed);
    batchReport.push("Failed: " + failed);
    batchReport.push("Skipped: " + skipped);
    batchReport.push("Total discovered: " + aiFiles.length);
    batchReport.push("");
    batchReport.push("Review any XX.99 — REVIEW / UNCLASSIFIED groups in Illustrator. v3 preserves 01 BACKGROUND and 00 GUIDES internally as-is.");
    batchReport.push("Do not delete those groups until their contents are manually approved.");

    var batchFile = new File(outputFolder.fsName + "/BATCH_ORGANIZATION_SUMMARY.txt");
    writeTextFile(batchFile, batchReport.join("\r\n"));

    alert(
        "Batch organization complete.\n\n" +
        "Processed: " + processed + "\n" +
        "Failed: " + failed + "\n" +
        "Skipped: " + skipped + "\n\n" +
        "Organized copies:\n" + outputFolder.fsName + "\n\n" +
        "Your source .ai files were not overwritten."
    );

    try { outputFolder.execute(); } catch (e4) {}

    // =====================================================================
    // TOP-LAYER NORMALIZATION
    // =====================================================================

    function normalizeTopLayers(docRef, out) {
        out.push("TOP-LEVEL NORMALIZATION");
        out.push("----------------------------------------------");

        // Clean hidden CR/LF/outer whitespace when a normalized match exists.
        for (var i = 0; i < TOP_LAYERS.length; i++) {
            var exact = findTopLayerExact(docRef, TOP_LAYERS[i]);
            if (!exact) {
                var normalized = findTopLayerNormalized(docRef, TOP_LAYERS[i]);
                if (normalized) {
                    var old = normalized.name;
                    normalized.name = TOP_LAYERS[i];
                    out.push("RENAMED top layer: [" + old + "] → [" + TOP_LAYERS[i] + "]");
                }
            }
        }

        // Create a missing standard layer if necessary, but do NOT reorder existing
        // top-level layers. The source masters already use the approved 10→00 order,
        // and v1 showed that a forced move could reverse Illustrator's layer collection.
        for (i = 0; i < TOP_LAYERS.length; i++) {
            if (!findTopLayerExact(docRef, TOP_LAYERS[i])) {
                var l = docRef.layers.add();
                l.name = TOP_LAYERS[i];
                out.push("CREATED missing top layer: " + TOP_LAYERS[i]);
            }
        }

        if (topOrderIsExact(docRef)) {
            out.push("PASS — existing 10→00 top-level order preserved.");
        } else {
            out.push("REVIEW — top-level order is not exact. v2 intentionally leaves order unchanged rather than risk a stacking regression.");
        }

        out.push("Current top-level order: " + getTopLayerSnapshot(docRef).join(" | "));
    }

    function topOrderIsExact(docRef) {
        if (docRef.layers.length !== TOP_LAYERS.length) return false;
        for (var i = 0; i < TOP_LAYERS.length; i++) {
            if (docRef.layers[i].name !== TOP_LAYERS[i]) return false;
        }
        return true;
    }

    // =====================================================================
    // SKELETON
    // =====================================================================

    function createCompleteSkeleton(docRef, fig, schema, createEmptyOptional, out) {
        out.push("");
        out.push("SUBGROUP SKELETON");
        out.push("----------------------------------------------");

        for (var i = 0; i < TOP_LAYERS.length; i++) {
            var topName = TOP_LAYERS[i];
            var layer = findTopLayerExact(docRef, topName);
            if (!layer) continue;

            var expected = schema[topName] || [];
            if (expected.length === 0) continue;

            var priorLock = layer.locked;
            try { layer.locked = false; } catch (e0) {}

            for (var e = 0; e < expected.length; e++) {
                if (!findDirectGroupExact(layer, expected[e])) {
                    var alias = findDirectGroupSemantic(layer, expected[e]);
                    if (!alias) {
                        var g = layer.groupItems.add();
                        g.name = expected[e];
                        out.push("CREATED " + topName + " > " + expected[e]);
                    }
                }
            }

            try { layer.locked = priorLock; } catch (e1) {}
        }
    }

    // =====================================================================
    // SEMANTIC ALIAS RENAME
    // =====================================================================

    function renameSemanticAliases(docRef, schema, out) {
        out.push("");
        out.push("SEMANTIC RENAMES");
        out.push("----------------------------------------------");

        for (var i = 0; i < TOP_LAYERS.length; i++) {
            var topName = TOP_LAYERS[i];
            var layer = findTopLayerExact(docRef, topName);
            if (!layer) continue;

            var expected = schema[topName] || [];
            var priorLock = layer.locked;
            try { layer.locked = false; } catch (e0) {}

            for (var e = 0; e < expected.length; e++) {
                if (findDirectGroupExact(layer, expected[e])) continue;

                var alias = findDirectGroupSemantic(layer, expected[e]);
                if (alias && !isGenericName(alias.name)) {
                    var old = alias.name;
                    alias.name = expected[e];
                    out.push(topName + ": [" + old + "] → [" + expected[e] + "]");
                }
            }

            try { layer.locked = priorLock; } catch (e1) {}
        }
    }

    // =====================================================================
    // ROUTING
    // =====================================================================

    function routeAllTopLayers(docRef, fig, schema, useKeywords, useReview, out) {
        out.push("");
        out.push("DIRECT-CHILD ROUTING");
        out.push("----------------------------------------------");

        for (var i = 0; i < TOP_LAYERS.length; i++) {
            var topName = TOP_LAYERS[i];

            // Construction/background layers are intentionally left internally untouched.
            // They are already semantically clear at the top level and are commonly locked.
            if (topName === "01 — BACKGROUND — OPTIONAL" ||
                topName === "00 — GUIDES / SAFE AREAS") {
                out.push("SKIP protected construction layer: " + topName);
                continue;
            }

            var layer = findTopLayerExact(docRef, topName);
            if (!layer) continue;

            var expected = schema[topName] || [];
            if (expected.length === 0) continue;

            var priorLock = layer.locked;
            try { layer.locked = false; } catch (e0) {}

            var expectedMap = {};
            for (var e = 0; e < expected.length; e++) {
                expectedMap[expected[e]] = true;
            }

            // If one semantic destination exists, anything direct in this top layer
            // can safely be placed inside it because the top-layer role is already known.
            var soleTarget = null;
            if (expected.length === 1) {
                soleTarget = findDirectGroupExact(layer, expected[0]);
            }

            // Snapshot DIRECT groups before moving anything.
            var groups = getDirectGroups(layer);
            for (var g = 0; g < groups.length; g++) {
                var grp = groups[g];

                if (expectedMap[grp.name]) continue;
                if (isReviewGroup(grp.name)) continue;

                var target = null;

                if (soleTarget) {
                    target = soleTarget;
                } else if (useKeywords) {
                    target = bestTargetForItem(grp, layer, expected);
                }

                if (!target && useReview) {
                    target = getOrCreateReviewGroup(layer);
                }

                if (target) {
                    safeMoveItem(grp, target, out, topName);
                }
            }

            // Snapshot DIRECT pageItems after groups have been handled.
            var items = getDirectPageItems(layer);
            for (var p = 0; p < items.length; p++) {
                var item = items[p];

                // Direct GroupItems already handled above.
                if (item.typename === "GroupItem") continue;

                var itemTarget = null;

                if (soleTarget) {
                    itemTarget = soleTarget;
                } else if (useKeywords) {
                    itemTarget = bestTargetForItem(item, layer, expected);
                }
                if (!itemTarget && useReview) {
                    itemTarget = getOrCreateReviewGroup(layer);
                }

                if (itemTarget) {
                    safeMoveItem(item, itemTarget, out, topName);
                }
            }

            try { layer.locked = priorLock; } catch (e1) {}
        }
    }

    function bestTargetForItem(item, layer, expectedNames) {
        var haystack = itemSearchText(item);
        if (!haystack) return null;

        var bestScore = 0;
        var bestIndex = -1;
        var tie = false;

        for (var i = 0; i < expectedNames.length; i++) {
            var score = scoreExpectedName(expectedNames[i], haystack);

            if (score > bestScore) {
                bestScore = score;
                bestIndex = i;
                tie = false;
            } else if (score > 0 && score === bestScore) {
                tie = true;
            }
        }

        // Require a meaningful unique match.
        if (bestIndex >= 0 && bestScore >= 3 && !tie) {
            return findDirectGroupExact(layer, expectedNames[bestIndex]);
        }

        return null;
    }

    function itemSearchText(item) {
        var s = "";

        try {
            if (item.name) s += " " + item.name;
        } catch (e0) {}

        if (item.typename === "TextFrame") {
            try { s += " " + item.contents; } catch (e1) {}
        }

        if (item.typename === "GroupItem") {
            // Group name + text frames nested anywhere inside the existing group.
            try {
                for (var i = 0; i < item.textFrames.length; i++) {
                    s += " " + item.textFrames[i].contents;
                }
            } catch (e2) {}
        }

        return normalizeSearch(s);
    }

    function scoreExpectedName(expectedName, haystack) {
        var semantic = semanticName(expectedName);
        var tokens = semantic.split(/[^A-Z0-9≠]+/);
        var score = 0;

        var stop = {
            "EXPLANATION":true, "EXPLANATIONS":true, "EXAMPLE":true, "EXAMPLES":true,
            "HEADING":true, "HEADINGS":true, "LABEL":true, "LABELS":true,
            "REGION":true, "REGIONS":true, "PANEL":true, "PANELS":true,
            "SYSTEM":true, "STRUCTURE":true, "SUPPORTING":true,
            "PRIMARY":true, "SECONDARY":true, "CORE":false,
            "THE":true, "AND":true, "OR":true, "OF":true,
            "OPTIONAL":true
        };

        for (var i = 0; i < tokens.length; i++) {
            var t = tokens[i];
            if (!t || t.length < 3) continue;
            if (stop[t]) continue;

            if (haystack.indexOf(t) >= 0) {
                score += (t.length >= 7 ? 2 : 1);
            }
        }

        // Special useful distinctions.
        if (semantic.indexOf("TEEN / YA") >= 0 &&
            (haystack.indexOf("TEEN") >= 0 || haystack.indexOf("YA") >= 0)) score += 2;

        if (semantic.indexOf("UNITED STATES") >= 0 &&
            (haystack.indexOf("UNITED STATES") >= 0 || haystack.indexOf("MPA") >= 0 ||
             haystack.indexOf("CARA") >= 0 || haystack.indexOf(" US ") >= 0)) score += 2;

        if (semantic.indexOf("UNITED KINGDOM") >= 0 &&
            (haystack.indexOf("UNITED KINGDOM") >= 0 || haystack.indexOf("BBFC") >= 0 ||
             haystack.indexOf(" UK ") >= 0)) score += 2;

        if (semantic.indexOf("SOUTH KOREA") >= 0 &&
            (haystack.indexOf("SOUTH KOREA") >= 0 || haystack.indexOf("KMRB") >= 0 ||
             haystack.indexOf(" KR ") >= 0)) score += 2;

        return score;
    }

    // =====================================================================
    // ORDER INTERNAL EXPECTED GROUPS
    // =====================================================================

    function orderExpectedGroups(docRef, schema, out) {
        out.push("");
        out.push("SUBGROUP ORDERING");
        out.push("----------------------------------------------");

        for (var i = 0; i < TOP_LAYERS.length; i++) {
            var topName = TOP_LAYERS[i];
            var layer = findTopLayerExact(docRef, topName);
            if (!layer) continue;

            var expected = schema[topName] || [];
            if (expected.length === 0) continue;

            var priorLock = layer.locked;
            try { layer.locked = false; } catch (e0) {}

            // Review group should remain after semantic groups.
            // Move semantic groups in reverse to beginning.
            for (var e = expected.length - 1; e >= 0; e--) {
                var g = findDirectGroupExact(layer, expected[e]);
                if (g) {
                    try { g.move(layer, ElementPlacement.PLACEATBEGINNING); } catch (e1) {}
                }
            }

            try { layer.locked = priorLock; } catch (e2) {}
        }
    }

    // =====================================================================
    // VALIDATION
    // =====================================================================

    function validateOrganization(docRef, fig, schema, out) {
        out.push("");
        out.push("VALIDATION");
        out.push("----------------------------------------------");

        var topPass = topOrderIsExact(docRef);

        out.push("Exact 10→00 top-level system: " + (topPass ? "PASS" : "REVIEW"));
        out.push("Final top-level order: " + getTopLayerSnapshot(docRef).join(" | "));

        var reviewCount = 0;
        var looseCount = 0;
        var missing = 0;
        var genericDirect = 0;

        for (i = 0; i < TOP_LAYERS.length; i++) {
            var topName = TOP_LAYERS[i];
            var layer = findTopLayerExact(docRef, topName);
            if (!layer) continue;

            var expected = schema[topName] || [];
            for (var e = 0; e < expected.length; e++) {
                if (!findDirectGroupExact(layer, expected[e])) missing++;
            }

            var groups = getDirectGroups(layer);
            for (var g = 0; g < groups.length; g++) {
                if (isReviewGroup(groups[g].name)) reviewCount++;
                else if (isGenericName(groups[g].name)) genericDirect++;
            }

            // Direct artwork is allowed in the two protected construction layers.
            if (topName !== "01 — BACKGROUND — OPTIONAL" &&
                topName !== "00 — GUIDES / SAFE AREAS") {
                var items = getDirectPageItems(layer);
                for (var p = 0; p < items.length; p++) {
                    if (items[p].typename !== "GroupItem") looseCount++;
                }
            }
        }

        out.push("Missing expected semantic subgroups: " + missing);
        out.push("XX.99 REVIEW groups: " + reviewCount);
        out.push("Generic direct groups outside REVIEW: " + genericDirect);
        out.push("Loose direct non-group items: " + looseCount);

        if (topPass && missing === 0 && genericDirect === 0 && looseCount === 0) {
            out.push("STRUCTURAL ORGANIZATION: PASS");
            if (reviewCount > 0) {
                out.push("SEMANTIC REVIEW: REQUIRED — inspect XX.99 groups.");
            } else {
                out.push("SEMANTIC REVIEW: no REVIEW groups remain.");
            }
        } else {
            out.push("STRUCTURAL ORGANIZATION: REVIEW");
        }
    }

    // =====================================================================
    // SAVE COPY
    // =====================================================================

    function saveOrganizedCopy(docRef, outFile) {
        var opts = new IllustratorSaveOptions();
        opts.pdfCompatible = true;
        opts.compressed = true;
        opts.embedICCProfile = true;

        // saveAs changes the open document's path to the organized copy.
        // The source file on disk remains untouched.
        docRef.saveAs(outFile, opts);
    }

    // =====================================================================
    // SCHEMA / NAME HELPERS
    // =====================================================================

    function getSchema(fig) {
        var merged = {};
        var k;

        for (k in COMMON) {
            if (COMMON.hasOwnProperty(k)) merged[k] = cloneArray(COMMON[k]);
        }

        for (k in FIGURES[fig]) {
            if (FIGURES[fig].hasOwnProperty(k)) merged[k] = cloneArray(FIGURES[fig][k]);
        }

        return merged;
    }

    function cloneArray(a) {
        var b = [];
        for (var i = 0; i < a.length; i++) b.push(a[i]);
        return b;
    }

    function detectFigureId(name) {
        var m = name.match(/F(0[1-9]|1[0-6])([AB])?/i);
        if (!m) return null;
        var id = "F" + m[1];
        if (m[2]) id += m[2].toUpperCase();
        return id;
    }

    function cleanName(s) {
        return String(s).replace(/[\r\n]+/g, "").replace(/^\s+|\s+$/g, "");
    }

    function semanticName(s) {
        var x = cleanName(s);
        x = x.replace(/^\d{2}(?:\.\d{2})?\s*[—-]\s*/i, "");
        return x.toUpperCase();
    }

    function normalizeSearch(s) {
        var x = String(s).toUpperCase();
        x = x.replace(/[\r\n\t]+/g, " ");
        x = x.replace(/\s+/g, " ");
        return " " + x + " ";
    }

    function reviewNameForLayer(layerName) {
        var m = cleanName(layerName).match(/^(\d{2})/);
        var prefix = m ? m[1] : "XX";
        return prefix + ".99 — REVIEW / UNCLASSIFIED";
    }

    function isReviewGroup(name) {
        return cleanName(name).indexOf(".99 — REVIEW / UNCLASSIFIED") >= 0;
    }

    function isGenericName(name) {
        var n = cleanName(name).toLowerCase();
        if (!n) return true;

        return (
            n === "group" ||
            n === "<group>" ||
            n === "<layer>" ||
            n === "layer" ||
            /^layer\s*\d*$/.test(n) ||
            n === "text" ||
            n === "icon" ||
            n === "icons" ||
            n === "bubble" ||
            n === "bubbles" ||
            n === "bubles" ||
            n === "bullets" ||
            n === "line" ||
            n === "lines" ||
            n === "path"
        );
    }

    // =====================================================================
    // ILLUSTRATOR OBJECT HELPERS
    // =====================================================================

    function findTopLayerExact(docRef, name) {
        for (var i = 0; i < docRef.layers.length; i++) {
            if (docRef.layers[i].name === name) return docRef.layers[i];
        }
        return null;
    }

    function findTopLayerNormalized(docRef, name) {
        var target = cleanName(name);
        for (var i = 0; i < docRef.layers.length; i++) {
            if (cleanName(docRef.layers[i].name) === target) return docRef.layers[i];
        }
        return null;
    }

    function getDirectGroups(container) {
        var a = [];
        for (var i = 0; i < container.groupItems.length; i++) {
            try {
                if (container.groupItems[i].parent === container) a.push(container.groupItems[i]);
            } catch (e) {}
        }
        return a;
    }

    function findDirectGroupExact(container, name) {
        var groups = getDirectGroups(container);
        for (var i = 0; i < groups.length; i++) {
            if (groups[i].name === name) return groups[i];
        }
        return null;
    }

    function findDirectGroupSemantic(container, expectedName) {
        var target = semanticName(expectedName);
        var groups = getDirectGroups(container);

        for (var i = 0; i < groups.length; i++) {
            if (semanticName(groups[i].name) === target) return groups[i];
        }

        return null;
    }

    function getDirectPageItems(container) {
        var a = [];
        for (var i = 0; i < container.pageItems.length; i++) {
            try {
                if (container.pageItems[i].parent === container) a.push(container.pageItems[i]);
            } catch (e) {}
        }
        return a;
    }

    function getOrCreateReviewGroup(layer) {
        var nm = reviewNameForLayer(layer.name);
        var g = findDirectGroupExact(layer, nm);
        if (!g) {
            g = layer.groupItems.add();
            g.name = nm;
        }
        return g;
    }

    function safeMoveItem(item, targetGroup, out, topName) {
        var oldName = "";
        try { oldName = item.name || "(unnamed)"; } catch (e0) { oldName = "(unnamed)"; }

        var oldLocked = false;
        var canLock = true;

        try {
            oldLocked = item.locked;
            item.locked = false;
        } catch (e1) {
            canLock = false;
        }

        try {
            item.move(targetGroup, ElementPlacement.PLACEATEND);
            out.push("MOVED " + topName + ": " + item.typename +
                     " [" + oldName + "] → [" + targetGroup.name + "]");
        } catch (e2) {
            out.push("MOVE FAILED " + topName + ": " + item.typename +
                     " [" + oldName + "] — " + e2);
        }

        if (canLock) {
            try { item.locked = oldLocked; } catch (e3) {}
        }
    }

    function countLeaves(container) {
        var total = 0;
        var items = getDirectPageItems(container);

        for (var i = 0; i < items.length; i++) {
            if (items[i].typename === "GroupItem") {
                total += countLeaves(items[i]);
            } else {
                total++;
            }
        }

        return total;
    }

    function countDocumentLeaves(docRef) {
        var total = 0;
        for (var i = 0; i < docRef.layers.length; i++) {
            total += countLeaves(docRef.layers[i]);
        }
        return total;
    }

    function getTopLayerSnapshot(docRef) {
        var a = [];
        for (var i = 0; i < docRef.layers.length; i++) {
            a.push(docRef.layers[i].name);
        }
        return a;
    }

    // =====================================================================
    // FILE HELPERS
    // =====================================================================

    function writeTextFile(file, text) {
        file.encoding = "UTF-8";
        if (!file.open("w")) throw new Error("Could not write: " + file.fsName);
        file.write(text);
        file.close();
    }

    function stripExtension(name) {
        return String(name).replace(/\.[^\.]+$/, "");
    }

    function pad2(n) {
        return (n < 10 ? "0" : "") + n;
    }

    function nowStamp() {
        var d = new Date();
        return d.getFullYear() + "-" +
               pad2(d.getMonth()+1) + "-" +
               pad2(d.getDate()) + " " +
               pad2(d.getHours()) + ":" +
               pad2(d.getMinutes()) + ":" +
               pad2(d.getSeconds());
    }

    function compactStamp() {
        var d = new Date();
        return d.getFullYear() +
               pad2(d.getMonth()+1) +
               pad2(d.getDate()) + "-" +
               pad2(d.getHours()) +
               pad2(d.getMinutes()) +
               pad2(d.getSeconds());
    }

})();