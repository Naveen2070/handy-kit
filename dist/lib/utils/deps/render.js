import fs from "fs/promises";
import { formatSize } from "./fileUtils.js";
// Calculate total size including nested deps
function calcTotalSize(data) {
    let total = data.size;
    for (const sub of Object.values(data.deps)) {
        total += calcTotalSize(sub);
    }
    return total;
}
// Get total size of a full section (dependencies/devDependencies)
function getSectionTotalSize(section) {
    return Object.values(section).reduce((sum, data) => sum + calcTotalSize(data), 0);
}
// Pad text for fixed-width console output
function pad(str, width, align = "left") {
    if (str.length > width)
        return str.slice(0, width - 3) + "...";
    const space = " ".repeat(width - str.length);
    return align === "right" ? space + str : str + space;
}
// Render dependencies/devDependencies to console
export function renderDeps(results, flags) {
    const depsTotal = getSectionTotalSize(results.dependencies);
    const devDepsTotal = getSectionTotalSize(results.devDependencies);
    const overallTotal = depsTotal + devDepsTotal;
    if (flags.table) {
        renderTable("Dependencies", results.dependencies);
        renderTable("DevDependencies", results.devDependencies);
    }
    else {
        console.log("\n🧩 Dependencies:");
        renderSection(results.dependencies, flags);
        console.log("\n🧪 DevDependencies:");
        renderSection(results.devDependencies, flags);
    }
    console.log("\n📦 Total Dependency Size:     " + formatSize(depsTotal));
    console.log("🧪 Total DevDependency Size:  " + formatSize(devDepsTotal));
    console.log("📂 Total node_modules Size:   " + formatSize(overallTotal));
}
function renderSection(section, flags) {
    for (const [pkg, data] of Object.entries(section)) {
        const totalSize = calcTotalSize(data);
        console.log(`📦 ${pkg} → ${formatSize(data.size)} (Total: ${formatSize(totalSize)})`);
        if (flags.tree) {
            renderTree(data.deps, "   ", new Set());
        }
        else if (flags.verbose) {
            for (const [dep, sub] of Object.entries(data.deps)) {
                console.log(`   └─ ${dep}: ${formatSize(sub.size)}`);
            }
        }
    }
}
function renderTree(deps, prefix = "   ", visited = new Set()) {
    for (const [dep, sub] of Object.entries(deps)) {
        const identifier = `${dep}:${sub.size}`;
        if (visited.has(identifier))
            continue;
        visited.add(identifier);
        console.log(`${prefix}└─ ${dep} (${formatSize(sub.size)})`);
        renderTree(sub.deps, prefix + "   ", visited);
    }
}
function renderTable(title, section) {
    const colWidths = [40, 15, 25];
    const headers = ["Package", "Size", "Total Size (incl. deps)"];
    let output = `\n=== ${title} ===\n`;
    output +=
        pad(headers[0], colWidths[0]) +
            pad(headers[1], colWidths[1], "right") +
            pad(headers[2], colWidths[2], "right") +
            "\n";
    output +=
        "-".repeat(colWidths[0]) +
            "-".repeat(colWidths[1]) +
            "-".repeat(colWidths[2]) +
            "\n";
    for (const [pkg, data] of Object.entries(section)) {
        const totalSize = calcTotalSize(data);
        output +=
            pad(pkg, colWidths[0]) +
                pad(formatSize(data.size), colWidths[1], "right") +
                pad(formatSize(totalSize), colWidths[2], "right") +
                "\n";
    }
    console.log(output);
}
// Export results to file in various formats
export async function exportResults(results, format, flags) {
    const outFile = `deps-size.${format}`;
    let content = "";
    const depsTotal = getSectionTotalSize(results.dependencies);
    const devDepsTotal = getSectionTotalSize(results.devDependencies);
    const overallTotal = depsTotal + devDepsTotal;
    if (format === "json") {
        content = JSON.stringify(results, null, 2);
    }
    else if (format === "txt") {
        if (flags?.table) {
            function toTableText(res) {
                const colWidths = [40, 15, 25];
                const headers = ["Package", "Size", "Total Size (incl. deps)"];
                let str = pad(headers[0], colWidths[0]) +
                    pad(headers[1], colWidths[1], "right") +
                    pad(headers[2], colWidths[2], "right") +
                    "\n";
                str +=
                    "-".repeat(colWidths[0]) +
                        "-".repeat(colWidths[1]) +
                        "-".repeat(colWidths[2]) +
                        "\n";
                for (const [pkg, data] of Object.entries(res)) {
                    const totalSize = calcTotalSize(data);
                    str +=
                        pad(pkg, colWidths[0]) +
                            pad(formatSize(data.size), colWidths[1], "right") +
                            pad(formatSize(totalSize), colWidths[2], "right") +
                            "\n";
                }
                return str;
            }
            content += "Dependencies:\n";
            content += toTableText(results.dependencies);
            content += "\nDevDependencies:\n";
            content += toTableText(results.devDependencies);
        }
        else {
            function toText(res, indent = "") {
                let str = "";
                for (const [pkg, data] of Object.entries(res)) {
                    str += `${indent}${pkg}: ${formatSize(data.size)}\n`;
                    str += toText(data.deps, indent + "  ");
                }
                return str;
            }
            content += "Dependencies:\n";
            content += toText(results.dependencies);
            content += "\nDevDependencies:\n";
            content += toText(results.devDependencies);
        }
        // Append total sizes
        content += `\n📦 Total Dependency Size: ${formatSize(depsTotal)}\n`;
        content += `🧪 Total DevDependency Size: ${formatSize(devDepsTotal)}\n`;
        content += `📂 Total node_modules Size: ${formatSize(overallTotal)}\n`;
    }
    else if (format === "md") {
        function toMarkdown(res, depth = 0) {
            let str = "";
            for (const [pkg, data] of Object.entries(res)) {
                str += `${"  ".repeat(depth)}- **${pkg}** (${formatSize(data.size)})\n`;
                str += toMarkdown(data.deps, depth + 1);
            }
            return str;
        }
        content += "## Dependencies\n";
        content += toMarkdown(results.dependencies);
        content += "\n## DevDependencies\n";
        content += toMarkdown(results.devDependencies);
        // Totals
        content += `\n**📦 Total Dependency Size**: ${formatSize(depsTotal)}\n`;
        content += `**🧪 Total DevDependency Size**: ${formatSize(devDepsTotal)}\n`;
        content += `**📂 Total node_modules Size**: ${formatSize(overallTotal)}\n`;
    }
    await fs.writeFile(outFile, content, "utf8");
    console.log(`\n✅ Exported to ${outFile}`);
}
//# sourceMappingURL=render.js.map