/*
Figure_Review_Migrate_v2.jsx
Adobe Illustrator / ExtendScript

FINAL deterministic migration for a REVIEW_INVENTORY_*_REVIEWED.tsv.

Key improvements over v1:
- Supports CROSS-TOP-LAYER approved targets using:
    TOP LAYER > SUBGROUP
- Creates an approved subgroup if it does not yet exist.
- Identifies source items by type + name + text preview + geometric bounds,
  NOT by mutable item index.
- Processes every MASTER .ai file in the selected _ORG3 folder so the output
  folder is a complete 17-file set.
- Removes .99 groups only when empty.
- Preserves source _ORG3 files.
- Checks leaf artwork counts before/after.
- Uses text items at the beginning of target groups and geometry at the end,
  helping keep labels above structural shapes.
*/

#target illustrator

(function () {
    var tsv = File.openDialog(
        "Select REVIEW_INVENTORY_*_REVIEWED.tsv",
        "*.tsv"
    );
    if (!tsv) return;

    var sourceFolder = Folder.selectDialog(
        "Select the successful _ORG3 folder that was inventoried."
    );
    if (!sourceFolder) return;

    if (sourceFolder.fsName.toUpperCase().indexOf("_ORG3_") < 0) {
        if (!confirm("Selected folder does not contain _ORG3_. Continue anyway?")) return;
    }

    var approvals = readTSV(tsv);
    if (approvals.length === 0) {
        alert("The TSV contains no data rows.");
        return;
    }

    var approvedRows = [];
    for (var i = 0; i < approvals.length; i++) {
        if (clean(approvals[i]["Approved Target"])) approvedRows.push(approvals[i]);
    }

    if (approvedRows.length === 0) {
        alert("No Approved Target values were found.");
        return;
    }

    var rowsByFile = {};
    for (i = 0; i < approvedRows.length; i++) {
        var fn = approvedRows[i]["File"];
        if (!rowsByFile[fn]) rowsByFile[fn] = [];
        rowsByFile[fn].push(approvedRows[i]);
    }

    var aiFiles = sourceFolder.getFiles(function (f) {
        return (f instanceof File) &&
               /\.ai$/i.test(f.name) &&
               /F(0[1-9]|1[0-6])([AB])?/i.test(f.name) &&
               /MASTER/i.test(f.name);
    });

    if (!aiFiles || aiFiles.length === 0) {
        alert("No supported MASTER .ai files found.");
        return;
    }

    var stamp = compactStamp();
    var outFolder = new Folder(sourceFolder.parent.fsName + "/_FINAL_REVIEWED_" + stamp);
    if (!outFolder.exists && !outFolder.create()) {
        alert("Could not create final output folder.");
        return;
    }

    var reportFolder = new Folder(outFolder.fsName + "/_R");
    if (!reportFolder.exists) reportFolder.create();

    var summary = [];
    summary.push("FINAL FIGURE REVIEW MIGRATION");
    summary.push("==============================================");
    summary.push("Source _ORG3 folder: " + sourceFolder.fsName);
    summary.push("Approval TSV: " + tsv.fsName);
    summary.push("Output folder: " + outFolder.fsName);
    summary.push("Approved rows: " + approvedRows.length);
    summary.push("");

    var processed = 0;
    var totalMoved = 0;
    var totalNoAction = 0;
    var totalErrors = 0;
    var totalReviewRemaining = 0;

    for (var fi = 0; fi < aiFiles.length; fi++) {
        var srcFile = aiFiles[fi];
        var fig = detectFigureId(srcFile.name);
        var rows = rowsByFile[srcFile.name] || [];

        var doc = null;
        var detail = [];

        try {
            doc = app.open(srcFile);
            var beforeLeaves = countDocumentLeaves(doc);
            var moved = 0;
            var noAction = 0;
            var errors = 0;

            detail.push("FINAL REVIEW MIGRATION — " + fig);
            detail.push("==============================================");
            detail.push("Source: " + srcFile.fsName);
            detail.push("Approved rows for file: " + rows.length);
            detail.push("Leaf artwork before: " + beforeLeaves);
            detail.push("");

            for (var r = 0; r < rows.length; r++) {
                var row = rows[r];
                var approved = clean(row["Approved Target"]);

                if (!approved || approved.toUpperCase() === "KEEP REVIEW") {
                    noAction++;
                    detail.push("NO ACTION " + row["Item Key"] + " — KEEP REVIEW/blank");
                    continue;
                }

                var targetSpec = parseTarget(approved, row["Top Layer"]);
                if (!targetSpec) {
                    errors++;
                    detail.push("ERROR " + row["Item Key"] + " — invalid Approved Target: " + approved);
                    continue;
                }

                var sourceLayer = findTopLayer(doc, row["Top Layer"]);
                if (!sourceLayer) {
                    errors++;
                    detail.push("ERROR " + row["Item Key"] + " — source top layer not found: " + row["Top Layer"]);
                    continue;
                }

                var reviewGroup = findDirectGroup(sourceLayer, row["Review Group"]);
                if (!reviewGroup) {
                    errors++;
                    detail.push("ERROR " + row["Item Key"] + " — review group not found: " + row["Review Group"]);
                    continue;
                }

                var item = findItemByFingerprint(reviewGroup, row);
                if (!item) {
                    errors++;
                    detail.push("ERROR " + row["Item Key"] + " — could not uniquely match source item by fingerprint.");
                    continue;
                }

                var targetLayer = findTopLayer(doc, targetSpec.layer);
                if (!targetLayer) {
                    errors++;
                    detail.push("ERROR " + row["Item Key"] + " — destination top layer not found: " + targetSpec.layer);
                    continue;
                }

                var sourceLayerLocked = safeGetLocked(sourceLayer);
                var targetLayerLocked = safeGetLocked(targetLayer);
                safeSetLocked(sourceLayer, false);
                safeSetLocked(targetLayer, false);

                var targetGroup = findDirectGroup(targetLayer, targetSpec.group);
                if (!targetGroup) {
                    try {
                        targetGroup = targetLayer.groupItems.add();
                        targetGroup.name = targetSpec.group;
                        detail.push("CREATED TARGET GROUP — " + targetSpec.layer + " > " + targetSpec.group);
                    } catch (createErr) {
                        safeSetLocked(sourceLayer, sourceLayerLocked);
                        safeSetLocked(targetLayer, targetLayerLocked);
                        errors++;
                        detail.push("ERROR " + row["Item Key"] + " — could not create target group: " + createErr);
                        continue;
                    }
                }

                var itemLocked = safeGetLocked(item);
                safeSetLocked(item, false);

                try {
                    // Text belongs visually above shapes. Structural geometry belongs behind.
                    var placement = (item.typename === "TextFrame")
                        ? ElementPlacement.PLACEATBEGINNING
                        : ElementPlacement.PLACEATEND;

                    item.move(targetGroup, placement);

                    moved++;
                    detail.push(
                        "MOVED " + row["Item Key"] +
                        " | " + row["Item Type"] +
                        " | " + shortText(row["Text Preview"], 90) +
                        " | " + row["Top Layer"] + " > " + row["Review Group"] +
                        " → " + targetSpec.layer + " > " + targetSpec.group
                    );
                } catch (moveErr) {
                    errors++;
                    detail.push("ERROR " + row["Item Key"] + " — move failed: " + moveErr);
                }

                safeSetLocked(item, itemLocked);
                safeSetLocked(sourceLayer, sourceLayerLocked);
                safeSetLocked(targetLayer, targetLayerLocked);
            }

            var removedReviews = removeEmptyReviewGroups(doc);
            var afterLeaves = countDocumentLeaves(doc);
            var remaining = countReviewItems(doc);
            totalReviewRemaining += remaining;

            detail.push("");
            detail.push("VALIDATION");
            detail.push("----------------------------------------------");
            detail.push("Items moved: " + moved);
            detail.push("Rows no-action: " + noAction);
            detail.push("Errors: " + errors);
            detail.push("Empty review groups removed: " + removedReviews);
            detail.push("Review items remaining: " + remaining);
            detail.push("Leaf artwork after: " + afterLeaves);
            detail.push("Leaf count: " + beforeLeaves + "→" + afterLeaves +
                        (beforeLeaves === afterLeaves ? " PASS" : " WARNING"));

            var outFile = new File(outFolder.fsName + "/" + srcFile.name);
            saveCopy(doc, outFile);
            detail.push("Saved: " + outFile.fsName);

            var detailFile = new File(reportFolder.fsName + "/" + fig + "_FINAL.txt");
            writeText(detailFile, detail.join("\r\n"));

            processed++;
            totalMoved += moved;
            totalNoAction += noAction;
            totalErrors += errors;

            summary.push(
                (errors === 0 && beforeLeaves === afterLeaves ? "PASS" : "REVIEW") +
                " — " + fig +
                " | moved " + moved +
                " | remaining review items " + remaining +
                " | leaves " + beforeLeaves + "→" + afterLeaves +
                " | errors " + errors
            );

            doc.close(SaveOptions.DONOTSAVECHANGES);
            doc = null;
        }
        catch (err) {
            totalErrors++;
            summary.push("ERROR — " + fig + " — " + err);

            if (doc) {
                try { doc.close(SaveOptions.DONOTSAVECHANGES); } catch (e2) {}
                doc = null;
            }
        }
    }

    summary.push("");
    summary.push("SUMMARY");
    summary.push("----------------------------------------------");
    summary.push("Files processed: " + processed);
    summary.push("Items moved: " + totalMoved);
    summary.push("Rows no-action: " + totalNoAction);
    summary.push("Errors: " + totalErrors);
    summary.push("Review items remaining across final set: " + totalReviewRemaining);
    summary.push("");
    summary.push("Source _ORG3 files were not overwritten.");

    var summaryFile = new File(outFolder.fsName + "/FINAL_MIGRATION_SUMMARY.txt");
    writeText(summaryFile, summary.join("\r\n"));

    alert(
        "Final review migration complete.\n\n" +
        "Files processed: " + processed + "\n" +
        "Items moved: " + totalMoved + "\n" +
        "Errors: " + totalErrors + "\n" +
        "Review items remaining: " + totalReviewRemaining + "\n\n" +
        "Output:\n" + outFolder.fsName
    );

    try { outFolder.execute(); } catch (e3) {}

    // ------------------------------------------------------------------
    // TSV
    // ------------------------------------------------------------------
    function readTSV(file) {
        file.encoding = "UTF-8";
        if (!file.open("r")) throw new Error("Could not open TSV.");
        var s = file.read();
        file.close();

        s = s.replace(/^\uFEFF/, "");
        var lines = s.split(/\r\n|\n|\r/);
        if (lines.length < 2) return [];

        var headers = lines[0].split("\t");
        var rows = [];

        for (var i = 1; i < lines.length; i++) {
            if (!lines[i]) continue;
            var cols = lines[i].split("\t");
            var row = {};
            for (var h = 0; h < headers.length; h++) {
                row[headers[h]] = (h < cols.length ? cols[h] : "");
            }
            rows.push(row);
        }
        return rows;
    }

    function parseTarget(s, defaultLayer) {
        var parts = String(s).split(">");
        if (parts.length === 1) {
            return {layer: clean(defaultLayer), group: clean(parts[0])};
        }
        if (parts.length === 2) {
            return {layer: clean(parts[0]), group: clean(parts[1])};
        }
        return null;
    }

    // ------------------------------------------------------------------
    // SOURCE MATCHING
    // ------------------------------------------------------------------
    function findItemByFingerprint(reviewGroup, row) {
        var items = directPageItems(reviewGroup);
        var matches = [];

        for (var i = 0; i < items.length; i++) {
            var item = items[i];

            if (item.typename !== row["Item Type"]) continue;
            if (safeName(item) !== clean(row["Item Name"])) continue;
            if (textPreview(item, 180) !== clean(row["Text Preview"])) continue;
            if (!boundsMatch(item, row, 0.75)) continue;

            matches.push(item);
        }

        if (matches.length === 1) return matches[0];

        // Fallback: if exact bounds formatting differs but type/name/text yields exactly one.
        matches = [];
        for (i = 0; i < items.length; i++) {
            item = items[i];
            if (item.typename !== row["Item Type"]) continue;
            if (safeName(item) !== clean(row["Item Name"])) continue;
            if (textPreview(item, 180) !== clean(row["Text Preview"])) continue;
            matches.push(item);
        }

        return matches.length === 1 ? matches[0] : null;
    }

    function boundsMatch(item, row, tolerance) {
        var b;
        try { b = item.geometricBounds; }
        catch (e) { return false; }

        var expected = [
            parseFloat(row["Left"]),
            parseFloat(row["Top"]),
            parseFloat(row["Right"]),
            parseFloat(row["Bottom"])
        ];

        for (var i = 0; i < 4; i++) {
            if (isNaN(expected[i])) return false;
            if (Math.abs(b[i] - expected[i]) > tolerance) return false;
        }
        return true;
    }

    // ------------------------------------------------------------------
    // AI HELPERS
    // ------------------------------------------------------------------
    function detectFigureId(name) {
        var m = name.match(/F(0[1-9]|1[0-6])([AB])?/i);
        if (!m) return "";
        var id = "F" + m[1];
        if (m[2]) id += m[2].toUpperCase();
        return id;
    }

    function findTopLayer(doc, name) {
        for (var i = 0; i < doc.layers.length; i++) {
            if (doc.layers[i].name === name) return doc.layers[i];
        }
        return null;
    }

    function directGroups(container) {
        var out = [];
        for (var i = 0; i < container.groupItems.length; i++) {
            try {
                if (container.groupItems[i].parent === container) out.push(container.groupItems[i]);
            } catch (e) {}
        }
        return out;
    }

    function findDirectGroup(container, name) {
        var groups = directGroups(container);
        for (var i = 0; i < groups.length; i++) {
            if (groups[i].name === name) return groups[i];
        }
        return null;
    }

    function directPageItems(container) {
        var out = [];
        for (var i = 0; i < container.pageItems.length; i++) {
            try {
                if (container.pageItems[i].parent === container) out.push(container.pageItems[i]);
            } catch (e) {}
        }
        return out;
    }

    function removeEmptyReviewGroups(doc) {
        var removed = 0;
        for (var li = 0; li < doc.layers.length; li++) {
            var layerLocked = safeGetLocked(doc.layers[li]);
            safeSetLocked(doc.layers[li], false);

            var groups = directGroups(doc.layers[li]);
            for (var gi = groups.length - 1; gi >= 0; gi--) {
                if (isReviewGroup(groups[gi].name) && countLeavesItem(groups[gi]) === 0) {
                    try {
                        groups[gi].remove();
                        removed++;
                    } catch (e) {}
                }
            }

            safeSetLocked(doc.layers[li], layerLocked);
        }
        return removed;
    }

    function countReviewItems(doc) {
        var count = 0;
        for (var li = 0; li < doc.layers.length; li++) {
            var groups = directGroups(doc.layers[li]);
            for (var gi = 0; gi < groups.length; gi++) {
                if (isReviewGroup(groups[gi].name)) {
                    count += directPageItems(groups[gi]).length;
                }
            }
        }
        return count;
    }

    function isReviewGroup(name) {
        return String(name).indexOf(".99 — REVIEW / UNCLASSIFIED") >= 0;
    }

    function countDocumentLeaves(doc) {
        var n = 0;
        for (var li = 0; li < doc.layers.length; li++) {
            var items = directPageItems(doc.layers[li]);
            for (var i = 0; i < items.length; i++) n += countLeavesItem(items[i]);
        }
        return n;
    }

    function countLeavesItem(item) {
        if (item.typename !== "GroupItem") return 1;
        var n = 0;
        var items = directPageItems(item);
        for (var i = 0; i < items.length; i++) n += countLeavesItem(items[i]);
        return n;
    }

    function safeGetLocked(obj) {
        try { return obj.locked; } catch (e) { return false; }
    }

    function safeSetLocked(obj, value) {
        try { obj.locked = value; } catch (e) {}
    }

    function safeName(item) {
        try { return clean(item.name || ""); } catch (e) { return ""; }
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

    // ------------------------------------------------------------------
    // SAVE / FILE
    // ------------------------------------------------------------------
    function saveCopy(doc, outFile) {
        var opts = new IllustratorSaveOptions();
        opts.pdfCompatible = true;
        opts.compressed = true;
        opts.embedICCProfile = true;
        doc.saveAs(outFile, opts);
    }

    function writeText(file, s) {
        file.encoding = "UTF-8";
        if (!file.open("w")) throw new Error("Could not write report: " + file.fsName);
        file.write(s);
        file.close();
    }

    function clean(s) {
        return String(s == null ? "" : s)
            .replace(/[\r\n\t]+/g, " ")
            .replace(/\s+/g, " ")
            .replace(/^\s+|\s+$/g, "");
    }

    function shortText(s, maxLen) {
        s = clean(s);
        return s.length > maxLen ? s.substring(0, maxLen - 3) + "..." : s;
    }

    function pad2(n) { return (n < 10 ? "0" : "") + n; }

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