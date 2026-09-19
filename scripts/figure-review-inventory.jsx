/*
Figure_Review_Inventory.jsx
Adobe Illustrator / ExtendScript

Scans every F01-F16 MASTER .ai file in a selected _ORG3 folder.
MAKES NO CHANGES TO ARTWORK.

Outputs next to the selected folder:
  REVIEW_INVENTORY_<timestamp>.tsv
  REVIEW_INVENTORY_<timestamp>.txt

The TSV includes a blank "Approved Target" column. After review, fill that
column with an exact existing subgroup name, then use Figure_Review_Migrate.jsx.
*/

#target illustrator

(function () {
    var SCHEMA = {"F01":{"07 — TAKEAWAY — OPTIONAL":["07.01 — CLASSIFICATION TAKEAWAY"],"06 — EXAMPLES — OPTIONAL":["06.01 — EXAMPLE CALLOUTS"],"05 — SECONDARY EXPLANATION":["05.01 — MEDIUM — EXPLANATION","05.02 — DURATION — EXPLANATION","05.03 — FORM — EXPLANATION","05.04 — DEMOGRAPHIC — EXPLANATION","05.05 — GENRE — EXPLANATION","05.06 — TECHNIQUE — EXPLANATION","05.07 — STRUCTURE — EXPLANATION","05.08 — RATING — EXPLANATION","05.09 — SOURCE / ADAPTATION — EXPLANATION"],"04 — PRIMARY LABELS":["04.01 — MEDIUM","04.02 — DURATION","04.03 — FORM","04.04 — DEMOGRAPHIC","04.05 — GENRE","04.06 — TECHNIQUE","04.07 — STRUCTURE","04.08 — RATING","04.09 — SOURCE / ADAPTATION"],"03 — CORE DIAGRAM":["03.01 — DIMENSION GRID","03.02 — DIMENSION CONTAINERS","03.03 — DIMENSION ICONS","03.04 — DIVIDERS / CONNECTORS"]},"F02":{"07 — TAKEAWAY — OPTIONAL":["07.01 — STORY-SUSTAIN TAKEAWAY"],"06 — EXAMPLES — OPTIONAL":["06.01 — SHORT — EXAMPLES","06.02 — FEATURE — EXAMPLES","06.03 — LIMITED SERIES — EXAMPLES","06.04 — ONGOING SERIES — EXAMPLES"],"05 — SECONDARY EXPLANATION":["05.01 — SHORT — EXPLANATION","05.02 — FEATURE — EXPLANATION","05.03 — LIMITED SERIES — EXPLANATION","05.04 — ONGOING SERIES — EXPLANATION"],"04 — PRIMARY LABELS":["04.01 — SHORT","04.02 — FEATURE","04.03 — LIMITED SERIES","04.04 — ONGOING SERIES"],"03 — CORE DIAGRAM":["03.01 — CONTINUUM AXIS","03.02 — FORMAT NODES","03.03 — PROGRESSION ARROWS","03.04 — NODE ICONS"]},"F03A":{"07 — TAKEAWAY — OPTIONAL":["07.01 — WHY THIS MATTERS"],"06 — EXAMPLES — OPTIONAL":["06.01 — PRESCHOOL — EXAMPLE","06.02 — CHILDREN — EXAMPLE","06.03 — TEEN / YA — EXAMPLE","06.04 — FAMILY — EXAMPLE","06.05 — ADULT — EXAMPLE"],"05 — SECONDARY EXPLANATION":["05.01 — PRESCHOOL — EXPLANATION","05.02 — CHILDREN — EXPLANATION","05.03 — TEEN / YA — EXPLANATION","05.04 — FAMILY — EXPLANATION","05.05 — ADULT — EXPLANATION","05.06 — SHARED ELEMENTS"],"04 — PRIMARY LABELS":["04.01 — PRESCHOOL","04.02 — CHILDREN","04.03 — TEEN / YA","04.04 — FAMILY","04.05 — ADULT","04.06 — CORE PREMISE","04.07 — PORTABLE CORE / PITCH SHIFT"],"03 — CORE DIAGRAM":["03.01 — DEMOGRAPHIC REGIONS","03.02 — OVERLAP REGIONS","03.03 — SHARED PREMISE CORE","03.04 — DEMOGRAPHIC ICONS","03.05 — SUPPORTING GEOMETRY"]},"F03B":{"07 — TAKEAWAY — OPTIONAL":["07.01 — OVERLAP TAKEAWAY"],"06 — EXAMPLES — OPTIONAL":["06.01 — DEMOGRAPHIC / OVERLAP EXAMPLES"],"05 — SECONDARY EXPLANATION":["05.01 — DEMOGRAPHIC DESCRIPTIONS","05.02 — SHARED ELEMENTS","05.03 — CORE EXPLANATION"],"04 — PRIMARY LABELS":["04.01 — PRESCHOOL","04.02 — CHILDREN","04.03 — TEEN / YA","04.04 — FAMILY","04.05 — ADULT"],"03 — CORE DIAGRAM":["03.01 — DEMOGRAPHIC CIRCLES","03.02 — OVERLAP REGIONS","03.03 — SHARED CORE","03.04 — ICONS"]},"F04":{"07 — TAKEAWAY — OPTIONAL":["07.01 — TERMINOLOGY TAKEAWAY"],"06 — EXAMPLES — OPTIONAL":["06.01 — ANIME — EXAMPLES","06.02 — AMERICAN ANIMATION — EXAMPLES","06.03 — TRANSNATIONAL — EXAMPLES"],"05 — SECONDARY EXPLANATION":["05.01 — ANIME — DEFINITION","05.02 — AMERICAN ANIMATION — DEFINITION","05.03 — TRANSNATIONAL PRODUCTION — EXPLANATION"],"04 — PRIMARY LABELS":["04.01 — ANIME","04.02 — AMERICAN ANIMATION","04.03 — TRANSNATIONAL PRODUCTION"],"03 — CORE DIAGRAM":["03.01 — CATEGORY REGIONS","03.02 — RELATIONSHIP GEOMETRY","03.03 — ICONS","03.04 — DIVIDERS"]},"F05":{"07 — TAKEAWAY — OPTIONAL":["07.01 — TECHNIQUE TAKEAWAY"],"06 — EXAMPLES — OPTIONAL":["06.01 — LIVE ACTION — EXAMPLES","06.02 — ANIMATION — EXAMPLES","06.03 — HYBRID — EXAMPLES"],"05 — SECONDARY EXPLANATION":["05.01 — SOURCE — EXPLANATION","05.02 — LIVE ACTION — EXPLANATION","05.03 — ANIMATION — EXPLANATION","05.04 — HYBRID — EXPLANATION"],"04 — PRIMARY LABELS":["04.01 — SOURCE","04.02 — LIVE ACTION","04.03 — ANIMATION","04.04 — HYBRID"],"03 — CORE DIAGRAM":["03.01 — SOURCE / STARTING WORK","03.02 — LIVE-ACTION PATH","03.03 — ANIMATION PATH","03.04 — HYBRID PATH","03.05 — CONNECTORS","03.06 — ICONS"]},"F06":{"07 — TAKEAWAY — OPTIONAL":["07.01 — RHETORIC TAKEAWAY"],"06 — EXAMPLES — OPTIONAL":["06.01 — NARRATIVE — EXAMPLES","06.02 — DOCUMENTARY — EXAMPLES","06.03 — BOUNDARY — EXAMPLES"],"05 — SECONDARY EXPLANATION":["05.01 — NARRATIVE PITCH LANGUAGE","05.02 — DOCUMENTARY PITCH LANGUAGE","05.03 — HYBRID / BOUNDARY EXPLANATION"],"04 — PRIMARY LABELS":["04.01 — NARRATIVE","04.02 — DOCUMENTARY","04.03 — WHEN METHODS BLUR"],"03 — CORE DIAGRAM":["03.01 — NARRATIVE REGION","03.02 — DOCUMENTARY REGION","03.03 — BLURRED METHODS REGION","03.04 — CONNECTORS / DIVIDERS","03.05 — ICONS"]},"F07":{"07 — TAKEAWAY — OPTIONAL":["07.01 — FORMAT ADAPTATION TAKEAWAY"],"06 — EXAMPLES — OPTIONAL":["06.01 — CONAN — EXAMPLE","06.02 — JACKASS — EXAMPLE","06.03 — AUDIO / PODCAST — EXAMPLES","06.04 — OTHER PROPERTY — EXAMPLES"],"05 — SECONDARY EXPLANATION":["05.01 — ENGINE 1 — EXPLANATION","05.02 — ENGINE 2 — EXPLANATION","05.03 — ENGINE 3 — EXPLANATION"],"04 — PRIMARY LABELS":["04.01 — SOURCE / BRAND","04.02 — ENGINE 1","04.03 — ENGINE 2","04.04 — ENGINE 3","04.05 — DESTINATION FORMATS"],"03 — CORE DIAGRAM":["03.01 — SOURCE / BRAND","03.02 — ENGINE 1","03.03 — ENGINE 2","03.04 — ENGINE 3","03.05 — FORMAT DESTINATIONS","03.06 — CONNECTORS","03.07 — ICONS"]},"F08":{"08 — SOURCE / QUALIFIER — OPTIONAL":["08.01 — MPA SOURCE","08.02 — TV GUIDELINES SOURCE","08.03 — QUALIFIER"],"07 — TAKEAWAY — OPTIONAL":["07.01 — FILM / TV DISTINCTION"],"05 — SECONDARY EXPLANATION":["05.01 — FILM SYSTEM — EXPLANATION","05.02 — TV SYSTEM — EXPLANATION","05.03 — DESCRIPTOR — EXPLANATION"],"04 — PRIMARY LABELS":["04.01 — MPA HEADING","04.02 — FILM RATING LABELS","04.03 — TV GUIDELINES HEADING","04.04 — TV RATING LABELS","04.05 — CONTENT DESCRIPTOR LABELS"],"03 — CORE DIAGRAM":["03.01 — FILM RATING LADDER","03.02 — TV RATING LADDER","03.03 — CONTENT DESCRIPTOR SYSTEM","03.04 — DIVIDERS / STRUCTURE"]},"F09":{"07 — TAKEAWAY — OPTIONAL":["07.01 — RATING ≠ DEMOGRAPHIC TAKEAWAY"],"05 — SECONDARY EXPLANATION":["05.01 — AUDIENCE — EXPLANATION","05.02 — FILM POSITIONING — EXPLANATION","05.03 — TV POSITIONING — EXPLANATION"],"04 — PRIMARY LABELS":["04.01 — COLUMN HEADINGS","04.02 — DEMOGRAPHIC LABELS","04.03 — FILM RATING LABELS","04.04 — TV RATING LABELS"],"03 — CORE DIAGRAM":["03.01 — DEVELOPMENT AUDIENCE COLUMN","03.02 — FILM POSITIONING COLUMN","03.03 — TV POSITIONING COLUMN","03.04 — RATING BANDS","03.05 — DIVIDERS / EMPHASIS"]},"F10":{"07 — TAKEAWAY — OPTIONAL":["07.01 — CREATIVE CONSTRAINT TAKEAWAY"],"06 — EXAMPLES — OPTIONAL":["06.01 — CASE EXAMPLES"],"05 — SECONDARY EXPLANATION":["05.01 — TELEVISION — EXPLANATION","05.02 — FILM — EXPLANATION","05.03 — GAMES — EXPLANATION"],"04 — PRIMARY LABELS":["04.01 — MEDIA HEADINGS","04.02 — CONSTRAINT LABELS"],"03 — CORE DIAGRAM":["03.01 — TELEVISION PANEL","03.02 — FILM PANEL","03.03 — GAMES PANEL","03.04 — CONSTRAINT ICONS","03.05 — EXAMPLE STRIP","03.06 — DIVIDERS / CONNECTORS"]},"F11":{"08 — SOURCE / QUALIFIER — OPTIONAL":["08.01 — SOURCES","08.02 — JURISDICTION QUALIFIERS","08.03 — ATTRIBUTION / NOTES"],"07 — TAKEAWAY — OPTIONAL":["07.01 — CONSTRAINT / WORKAROUND TAKEAWAY"],"06 — EXAMPLES — OPTIONAL":["06.01 — REAL EXAMPLES / WORKAROUNDS"],"05 — SECONDARY EXPLANATION":["05.01 — CATEGORY EXPLANATIONS"],"04 — PRIMARY LABELS":["04.01 — SECTION / CATEGORY HEADINGS"],"03 — CORE DIAGRAM":["03.01 — CLASSIFICATION / LEGAL CONSTRAINTS","03.02 — CULTURAL / TABOO CATEGORIES","03.03 — CREATIVE WORKAROUNDS","03.04 — CATEGORY ICONS","03.05 — CONNECTORS / DIVIDERS"]},"F12":{"07 — TAKEAWAY — OPTIONAL":["07.01 — ADAPTATION TAKEAWAY"],"06 — EXAMPLES — OPTIONAL":["06.01 — ADAPTATION EXAMPLES"],"05 — SECONDARY EXPLANATION":["05.01 — PRESERVE — EXPLANATION","05.02 — TRANSFORM — EXPLANATION","05.03 — DESTINATION MEDIUM — EXPLANATION"],"04 — PRIMARY LABELS":["04.01 — PRESERVE","04.02 — TRANSFORM","04.03 — DESTINATION MEDIUM"],"03 — CORE DIAGRAM":["03.01 — TRIANGLE","03.02 — THREE NODES","03.03 — DIRECTIONAL RELATIONSHIPS","03.04 — CENTER / OVERLAP"]},"F13":{"08 — SOURCE / QUALIFIER — OPTIONAL":["08.01 — MAP SOURCES","08.02 — AUTHORITY SOURCES","08.03 — QUALIFIERS"],"07 — TAKEAWAY — OPTIONAL":["07.01 — INTERNATIONAL CLASSIFICATION TAKEAWAY"],"05 — SECONDARY EXPLANATION":["05.01 — GOVERNANCE GROUPING","05.02 — MAP EXPLANATION","05.03 — ORIENTATION NOTE"],"04 — PRIMARY LABELS":["04.01 — CA — CANADA","04.02 — US — UNITED STATES","04.03 — FR — FRANCE","04.04 — IE — IRELAND","04.05 — UK — UNITED KINGDOM","04.06 — ZA — SOUTH AFRICA","04.07 — LK — SRI LANKA","04.08 — NL — NETHERLANDS","04.09 — DE — GERMANY","04.10 — SG — SINGAPORE","04.11 — AU — AUSTRALIA","04.12 — JP — JAPAN","04.13 — KR — SOUTH KOREA","04.14 — IN — INDIA","04.15 — NZ — NEW ZEALAND"],"03 — CORE DIAGRAM":["03.01 — WORLD MAP","03.02 — HIGHLIGHTED TERRITORIES","03.03 — COUNTRY ANCHORS","03.04 — LEADER LINES","03.05 — MAP KEY / LEGEND","03.06 — MAP SYMBOLS"]},"F14":{"07 — TAKEAWAY — OPTIONAL":["07.01 — INTERNATIONAL PROFILE TAKEAWAY"],"06 — EXAMPLES — OPTIONAL":["06.01 — COUNTRY EXAMPLES / EXCEPTIONS"],"05 — SECONDARY EXPLANATION":["05.01 — PROFILE EXPLANATIONS"],"04 — PRIMARY LABELS":["04.01 — PROFILE / SYSTEM HEADINGS"],"03 — CORE DIAGRAM":["03.01 — PROFILE CARDS","03.02 — PROFILE ICONS","03.03 — CARD DIVIDERS","03.04 — SYSTEM KEY / LEGEND","03.05 — SUPPORTING GEOMETRY"]},"F15":{"08 — SOURCE / QUALIFIER — OPTIONAL":["08.01 — F11 ICON PROVENANCE","08.02 — F14 ICON PROVENANCE","08.03 — EXTERNAL SOURCES"],"07 — TAKEAWAY — OPTIONAL":["07.01 — KEY TAKEAWAYS"],"05 — SECONDARY EXPLANATION":["05.01 — FORMAL CLASSIFICATION — EXPLANATIONS","05.02 — OVERLAP — EXPLANATIONS","05.03 — CULTURAL / MARKET — EXPLANATIONS"],"04 — PRIMARY LABELS":["04.01 — FORMAL CLASSIFICATION","04.02 — SIGNIFICANT OVERLAP","04.03 — CULTURAL / MARKET SENSITIVITIES","04.04 — CATEGORY LABELS"],"03 — CORE DIAGRAM":["03.01 — FORMAL CLASSIFICATION REGION","03.02 — OVERLAP REGION","03.03 — CULTURAL / MARKET REGION","03.04 — FORMAL CLASSIFICATION ICONS","03.05 — OVERLAP ICONS","03.06 — CULTURAL / MARKET ICONS","03.07 — RELATIONSHIP GEOMETRY"]},"F16":{"07 — TAKEAWAY — OPTIONAL":["07.01 — SCOPE BOUNDARY TAKEAWAY"],"05 — SECONDARY EXPLANATION":["05.01 — RESOURCE / STAGE EXPLANATIONS"],"04 — PRIMARY LABELS":["04.01 — COMPANION CORE","04.02 — PITCH DOCUMENTS","04.03 — RESEARCH","04.04 — CRAFT / DESIGN","04.05 — BUDGET / BUSINESS","04.06 — PRODUCTION / RELEASE","04.07 — SPECIALIST RESOURCES"],"03 — CORE DIAGRAM":["03.01 — COMPANION CORE","03.02 — PITCH DOCUMENTS","03.03 — RESEARCH","03.04 — CRAFT / DESIGN","03.05 — BUDGET / BUSINESS","03.06 — PRODUCTION / RELEASE","03.07 — SPECIALIST RESOURCES","03.08 — CONNECTORS","03.09 — ICONS"]}};

    var folder = Folder.selectDialog("Select the successful _ORG3 folder containing the 17 organized MASTER .ai files.");
    if (!folder) return;

    if (folder.fsName.toUpperCase().indexOf("_ORG3_") < 0) {
        var proceed = confirm("The selected folder name does not contain _ORG3_.\n\nContinue anyway?");
        if (!proceed) return;
    }

    var files = folder.getFiles(function (f) {
        return (f instanceof File) &&
               /\.ai$/i.test(f.name) &&
               /F(0[1-9]|1[0-6])([AB])?/i.test(f.name) &&
               /MASTER/i.test(f.name);
    });

    if (!files || files.length === 0) {
        alert("No supported MASTER .ai files found.");
        return;
    }

    var rows = [];
    var textReport = [];
    var totalReviewGroups = 0;
    var totalReviewItems = 0;

    rows.push([
        "Figure","File","Top Layer","Review Group","Item Key","Item Type","Item Name",
        "Text Preview","Leaf Count","Left","Top","Right","Bottom",
        "Suggested Target","Confidence","Score","Second Candidate","Second Score",
        "Approved Target","Reviewer Notes"
    ]);

    textReport.push("FIGURE REVIEW INVENTORY");
    textReport.push("==============================================");
    textReport.push("Folder: " + folder.fsName);
    textReport.push("Files found: " + files.length);
    textReport.push("");

    for (var fi = 0; fi < files.length; fi++) {
        var doc = null;
        try {
            doc = app.open(files[fi]);
            var fig = detectFigureId(files[fi].name);
            var schema = SCHEMA[fig] || {};
            var fileReviewGroups = 0;
            var fileReviewItems = 0;

            textReport.push(fig + " — " + files[fi].name);
            textReport.push("----------------------------------------------");

            for (var li = 0; li < doc.layers.length; li++) {
                var layer = doc.layers[li];
                var groups = directGroups(layer);

                for (var gi = 0; gi < groups.length; gi++) {
                    var reviewGroup = groups[gi];
                    if (!isReviewGroup(reviewGroup.name)) continue;

                    fileReviewGroups++;
                    totalReviewGroups++;

                    var items = directPageItems(reviewGroup);
                    textReport.push("  " + layer.name + " > " + reviewGroup.name +
                                    " (" + items.length + " direct item(s))");

                    for (var ii = 0; ii < items.length; ii++) {
                        var item = items[ii];
                        var key = "I" + pad3(ii + 1);
                        var name = safeName(item);
                        var preview = textPreview(item, 180);
                        var leaves = countLeavesItem(item);
                        var b = safeBounds(item);
                        var suggestions = rankTargets(item, schema[layer.name] || []);
                        var best = suggestions.length ? suggestions[0] : null;
                        var second = suggestions.length > 1 ? suggestions[1] : null;
                        var confidence = confidenceFor(best, second);

                        rows.push([
                            fig,
                            files[fi].name,
                            layer.name,
                            reviewGroup.name,
                            key,
                            item.typename,
                            name,
                            preview,
                            String(leaves),
                            b[0], b[1], b[2], b[3],
                            best ? best.name : "",
                            confidence,
                            best ? String(best.score) : "0",
                            second ? second.name : "",
                            second ? String(second.score) : "0",
                            "",
                            ""
                        ]);

                        textReport.push(
                            "    " + key + " | " + item.typename +
                            " | " + (name || "(unnamed)") +
                            (preview ? ' | "' + preview + '"' : "") +
                            " | suggestion: " + (best ? best.name : "(none)") +
                            " [" + confidence + (best ? ", score " + best.score : "") + "]"
                        );

                        fileReviewItems++;
                        totalReviewItems++;
                    }
                }
            }

            if (fileReviewGroups === 0) {
                textReport.push("  No .99 review groups found.");
            }

            textReport.push("  Review groups: " + fileReviewGroups +
                            " | direct review items: " + fileReviewItems);
            textReport.push("");

            doc.close(SaveOptions.DONOTSAVECHANGES);
            doc = null;
        } catch (err) {
            textReport.push("  ERROR: " + err);
            textReport.push("");
            if (doc) {
                try { doc.close(SaveOptions.DONOTSAVECHANGES); } catch (e) {}
                doc = null;
            }
        }
    }

    textReport.push("TOTALS");
    textReport.push("----------------------------------------------");
    textReport.push("Review groups: " + totalReviewGroups);
    textReport.push("Direct review items: " + totalReviewItems);
    textReport.push("");
    textReport.push("No Illustrator artwork was modified or saved.");

    var stamp = compactStamp();
    var parent = folder.parent;
    var tsv = new File(parent.fsName + "/REVIEW_INVENTORY_" + stamp + ".tsv");
    var txt = new File(parent.fsName + "/REVIEW_INVENTORY_" + stamp + ".txt");

    writeTSV(tsv, rows);
    writeText(txt, textReport.join("\r\n"));

    alert(
        "Review inventory complete.\n\n" +
        "Review groups: " + totalReviewGroups + "\n" +
        "Direct review items: " + totalReviewItems + "\n\n" +
        "TSV:\n" + tsv.fsName + "\n\n" +
        "No Illustrator files were modified."
    );

    try { parent.execute(); } catch (e2) {}

    function detectFigureId(name) {
        var m = name.match(/F(0[1-9]|1[0-6])([AB])?/i);
        if (!m) return "";
        var id = "F" + m[1];
        if (m[2]) id += m[2].toUpperCase();
        return id;
    }

    function isReviewGroup(name) {
        return String(name).indexOf(".99 — REVIEW / UNCLASSIFIED") >= 0;
    }

    function directGroups(container) {
        var a = [];
        for (var i = 0; i < container.groupItems.length; i++) {
            try {
                if (container.groupItems[i].parent === container) a.push(container.groupItems[i]);
            } catch (e) {}
        }
        return a;
    }

    function directPageItems(container) {
        var a = [];
        for (var i = 0; i < container.pageItems.length; i++) {
            try {
                if (container.pageItems[i].parent === container) a.push(container.pageItems[i]);
            } catch (e) {}
        }
        return a;
    }

    function safeName(item) {
        try { return clean(item.name || ""); } catch (e) { return ""; }
    }

    function clean(s) {
        return String(s).replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");
    }

    function textPreview(item, maxLen) {
        var s = "";
        try {
            if (item.typename === "TextFrame") {
                s = item.contents;
            } else if (item.typename === "GroupItem") {
                for (var i = 0; i < item.textFrames.length; i++) {
                    if (s) s += " | ";
                    s += item.textFrames[i].contents;
                }
            }
        } catch (e) {}

        s = clean(s);
        if (s.length > maxLen) s = s.substring(0, maxLen - 3) + "...";
        return s;
    }

    function countLeavesItem(item) {
        if (item.typename !== "GroupItem") return 1;
        var n = 0;
        var items = directPageItems(item);
        for (var i = 0; i < items.length; i++) {
            if (items[i].typename === "GroupItem") n += countLeavesItem(items[i]);
            else n++;
        }
        return n;
    }

    function safeBounds(item) {
        try {
            var b = item.geometricBounds;
            return [round2(b[0]), round2(b[1]), round2(b[2]), round2(b[3])];
        } catch (e) {
            return ["","","",""];
        }
    }

    function round2(n) {
        return Math.round(n * 100) / 100;
    }

    function rankTargets(item, expected) {
        var hay = normalizeSearch(safeName(item) + " " + textPreview(item, 1000));
        var a = [];

        for (var i = 0; i < expected.length; i++) {
            a.push({name: expected[i], score: scoreTarget(expected[i], hay)});
        }

        a.sort(function (x, y) {
            if (y.score !== x.score) return y.score - x.score;
            return x.name < y.name ? -1 : (x.name > y.name ? 1 : 0);
        });

        return a;
    }

    function normalizeSearch(s) {
        return " " + clean(s).toUpperCase() + " ";
    }

    function semanticName(s) {
        return clean(s).replace(/^\d{2}(?:\.\d{2})?\s*[—-]\s*/i, "").toUpperCase();
    }

    function scoreTarget(target, hay) {
        var semantic = semanticName(target);
        var tokens = semantic.split(/[^A-Z0-9≠]+/);
        var score = 0;

        var stop = {
            "EXPLANATION":true,"EXPLANATIONS":true,"EXAMPLE":true,"EXAMPLES":true,
            "HEADING":true,"HEADINGS":true,"LABEL":true,"LABELS":true,
            "REGION":true,"REGIONS":true,"PANEL":true,"PANELS":true,
            "SYSTEM":true,"STRUCTURE":true,"SUPPORTING":true,"PRIMARY":true,
            "SECONDARY":true,"THE":true,"AND":true,"OR":true,"OF":true
        };

        for (var i = 0; i < tokens.length; i++) {
            var t = tokens[i];
            if (!t || t.length < 3 || stop[t]) continue;
            if (hay.indexOf(t) >= 0) score += (t.length >= 7 ? 2 : 1);
        }

        // Common figure aliases.
        if (semantic.indexOf("TEEN / YA") >= 0 &&
            (hay.indexOf(" TEEN ") >= 0 || hay.indexOf(" YA ") >= 0)) score += 2;
        if (semantic.indexOf("UNITED STATES") >= 0 &&
            (hay.indexOf(" MPA ") >= 0 || hay.indexOf(" CARA ") >= 0 || hay.indexOf(" US ") >= 0)) score += 3;
        if (semantic.indexOf("UNITED KINGDOM") >= 0 &&
            (hay.indexOf(" BBFC ") >= 0 || hay.indexOf(" UK ") >= 0)) score += 3;
        if (semantic.indexOf("SOUTH KOREA") >= 0 &&
            (hay.indexOf(" KMRB ") >= 0 || hay.indexOf(" KR ") >= 0)) score += 3;
        if (semantic.indexOf("CANADA") >= 0 && hay.indexOf(" CA ") >= 0) score += 2;
        if (semantic.indexOf("FRANCE") >= 0 && hay.indexOf(" CNC ") >= 0) score += 3;
        if (semantic.indexOf("IRELAND") >= 0 && hay.indexOf(" IFCO ") >= 0) score += 3;
        if (semantic.indexOf("GERMANY") >= 0 && hay.indexOf(" FSK ") >= 0) score += 3;
        if (semantic.indexOf("SINGAPORE") >= 0 && hay.indexOf(" IMDA ") >= 0) score += 3;
        if (semantic.indexOf("JAPAN") >= 0 && hay.indexOf(" EIRIN ") >= 0) score += 3;
        if (semantic.indexOf("INDIA") >= 0 && hay.indexOf(" CBFC ") >= 0) score += 3;

        return score;
    }

    function confidenceFor(best, second) {
        if (!best || best.score <= 0) return "UNRESOLVED";
        var margin = best.score - (second ? second.score : 0);
        if (best.score >= 5 && margin >= 2) return "HIGH";
        if (best.score >= 3 && margin >= 1) return "MEDIUM";
        return "LOW";
    }

    function pad3(n) {
        if (n < 10) return "00" + n;
        if (n < 100) return "0" + n;
        return String(n);
    }

    function tsvEscape(v) {
        return clean(String(v == null ? "" : v));
    }

    function writeTSV(file, rows) {
        file.encoding = "UTF-8";
        if (!file.open("w")) throw new Error("Could not write TSV: " + file.fsName);
        file.write("\uFEFF");
        for (var r = 0; r < rows.length; r++) {
            var parts = [];
            for (var c = 0; c < rows[r].length; c++) parts.push(tsvEscape(rows[r][c]));
            file.write(parts.join("\t") + "\r\n");
        }
        file.close();
    }

    function writeText(file, s) {
        file.encoding = "UTF-8";
        if (!file.open("w")) throw new Error("Could not write text report: " + file.fsName);
        file.write(s);
        file.close();
    }

    function pad2(n) { return (n < 10 ? "0" : "") + n; }

    function compactStamp() {
        var d = new Date();
        return d.getFullYear() + pad2(d.getMonth()+1) + pad2(d.getDate()) + "-" +
               pad2(d.getHours()) + pad2(d.getMinutes()) + pad2(d.getSeconds());
    }
})();