import fs from "fs/promises";
import path from "path";
import { formatSize } from "./fileUtils.js";
/**
 * Calculate total size of a dependency, including its nested dependencies.
 * @param data Dependency data object with `size` and `deps` properties.
 * @returns Total size of the dependency.
 */
function calcTotalSize(data) {
    let total = data.size;
    // Recursively add up the sizes of all nested dependencies
    for (const sub of Object.values(data.deps)) {
        total += calcTotalSize(sub);
    }
    return total;
}
// Get total size of a full section (dependencies/devDependencies)
/**
 * Calculates the total size of all dependencies in a section (dependencies
 * or devDependencies).
 * @param section A record of dependency names to their data objects.
 * @returns The total size of all dependencies in the section.
 */
function getSectionTotalSize(section) {
    return Object.values(section).reduce((sum, data) => sum + calcTotalSize(data), 0);
}
// Pad text for fixed-width console output
/**
 * Pad a string with spaces so it's a given width.
 * If the string is longer than the width, it will be truncated.
 * @param str The string to pad.
 * @param width The desired width of the padded string.
 * @param align The alignment of the string within the padded string.
 *   Either "left" (default) or "right".
 * @returns The padded string.
 */
function pad(str, width, align = "left") {
    if (str.length > width)
        return str.slice(0, width - 3) + "...";
    const space = " ".repeat(width - str.length);
    return align === "right" ? space + str : str + space;
}
// Render dependencies/devDependencies to console
/**
 * Render dependencies/devDependencies to console.
 * @param results A record with `dependencies` and `devDependencies` properties.
 *   Each property is a record of dependency names to their data objects.
 * @param flags An object with options for rendering the dependencies.
 *   Properties:
 *   - `verbose`: If true, show nested dependencies with their sizes.
 *   - `tree`: If true, show dependencies in a tree view.
 *   - `table`: If true, show dependencies in a table view.
 */
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
/**
 * Render a section of dependencies to the console.
 * @param section A record of dependency names to their data objects.
 * @param flags Options for rendering the section.
 *   Properties:
 *   - `verbose`: If true, show nested dependencies with their sizes.
 *   - `tree`: If true, show dependencies in a tree view.
 */
function renderSection(section, flags) {
    for (const [pkg, data] of Object.entries(section)) {
        const totalSize = calcTotalSize(data);
        console.log(`📦 ${pkg} → ${formatSize(data.size)} (Total: ${formatSize(totalSize)})`);
        // If the user wants to see a tree view of nested dependencies, render it
        if (flags.tree) {
            renderTree(data.deps, "   ", new Set());
        }
        // If the user wants to see nested dependencies with their sizes, render them
        else if (flags.verbose) {
            for (const [dep, sub] of Object.entries(data.deps)) {
                console.log(`   └─ ${dep}: ${formatSize(sub.size)}`);
            }
        }
    }
}
/**
 * Recursively render a tree view of nested dependencies.
 * @param deps A record of dependency names to their data objects.
 * @param prefix A string to prefix each line of the tree with (default: "   ").
 * @param visited A set of dependency identifiers to keep track of which dependencies have been visited (default: a new Set).
 */
function renderTree(deps, prefix = "   ", visited = new Set()) {
    for (const [dep, sub] of Object.entries(deps)) {
        // Create a unique identifier for the dependency using its name and size
        const identifier = `${dep}:${sub.size}`;
        // If we've already visited this dependency, skip it
        if (visited.has(identifier))
            continue;
        // Add the dependency to the set of visited dependencies
        visited.add(identifier);
        // Print the dependency with its size
        console.log(`${prefix}└─ ${dep} (${formatSize(sub.size)})`);
        // Recursively render the dependency's nested dependencies
        renderTree(sub.deps, prefix + "   ", visited);
    }
}
/**
 * Render a table view of dependencies.
 * @param title The title of the table section.
 * @param section A record of dependency names to their data objects.
 */
function renderTable(title, section) {
    const colWidths = [40, 15, 25];
    const headers = ["Package", "Size", "Total Size (incl. deps)"];
    let output = `\n=== ${title} ===\n`;
    // Create the header row
    output +=
        pad(headers[0], colWidths[0]) +
            pad(headers[1], colWidths[1], "right") +
            pad(headers[2], colWidths[2], "right") +
            "\n";
    // Create the horizontal separator row
    output +=
        "-".repeat(colWidths[0]) +
            "-".repeat(colWidths[1]) +
            "-".repeat(colWidths[2]) +
            "\n";
    // Iterate through the dependencies and print their columns
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
/**
 * Export dependency size results to a file in the specified format.
 * @param results An object with two properties: `dependencies` and `devDependencies`.
 * @param exportPath The path to export the results to. The file extension will be used to determine the format.
 * @param flags Options for exporting the results.
 *   Properties:
 *   - `table`: If true, export results in a table format.
 */
export async function exportResults(results, exportPath, flags) {
    // Resolve to absolute path from current working directory
    const resolvedPath = path.isAbsolute(exportPath)
        ? exportPath
        : path.resolve(process.cwd(), exportPath);
    const ext = path.extname(resolvedPath).slice(1).toLowerCase(); // e.g. 'json', 'txt', 'md'
    const format = ext || "json";
    let content = "";
    const depsTotal = getSectionTotalSize(results.dependencies);
    const devDepsTotal = getSectionTotalSize(results.devDependencies);
    const overallTotal = depsTotal + devDepsTotal;
    if (format === "json") {
        content = JSON.stringify(results, null, 2);
    }
    else if (format === "txt") {
        if (flags?.table) {
            /**
             * Render a table view of dependencies.
             * @param res A record of dependency names to their data objects.
             * @returns A string representation of the table view.
             */
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
            /**
             * Render a text view of dependencies.
             * @param res A record of dependency names to their data objects.
             * @param indent The indentation level for each line.
             * @returns A string representation of the text view.
             */
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
        content += `\n📦 Total Dependency Size: ${formatSize(depsTotal)}\n`;
        content += `🧪 Total DevDependency Size: ${formatSize(devDepsTotal)}\n`;
        content += `📂 Total node_modules Size: ${formatSize(overallTotal)}\n`;
    }
    else if (format === "md") {
        /**
         * Render a markdown view of dependencies.
         * @param res A record of dependency names to their data objects.
         * @param depth The nesting level of the markdown list.
         * @returns A string representation of the markdown view.
         */
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
        content += `\n**📦 Total Dependency Size**: ${formatSize(depsTotal)}\n`;
        content += `**🧪 Total DevDependency Size**: ${formatSize(devDepsTotal)}\n`;
        content += `**📂 Total node_modules Size**: ${formatSize(overallTotal)}\n`;
    }
    else {
        throw new Error(`❌ Unsupported export format: ${format}`);
    }
    await fs.mkdir(path.dirname(resolvedPath), { recursive: true });
    await fs.writeFile(resolvedPath, content, "utf8");
    console.log(`\n✅ Exported to ${resolvedPath}`);
}
//# sourceMappingURL=render.js.map