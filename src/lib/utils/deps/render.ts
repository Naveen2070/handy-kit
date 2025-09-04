import fs from "fs/promises";
import path from "path";
import { formatSize } from "./fileUtils.js";

// Calculate total size including nested deps
function calcTotalSize(data: {
  size: number;
  deps: Record<string, any>;
}): number {
  let total = data.size;
  for (const sub of Object.values(data.deps)) {
    total += calcTotalSize(sub);
  }
  return total;
}

// Get total size of a full section (dependencies/devDependencies)
function getSectionTotalSize(section: Record<string, any>): number {
  return Object.values(section).reduce(
    (sum, data) => sum + calcTotalSize(data),
    0
  );
}

// Pad text for fixed-width console output
function pad(
  str: string,
  width: number,
  align: "left" | "right" = "left"
): string {
  if (str.length > width) return str.slice(0, width - 3) + "...";
  const space = " ".repeat(width - str.length);
  return align === "right" ? space + str : str + space;
}

// Render dependencies/devDependencies to console
export function renderDeps(
  results: {
    dependencies: Record<string, any>;
    devDependencies: Record<string, any>;
  },
  flags: { verbose: boolean; tree: boolean; table: boolean }
) {
  const depsTotal = getSectionTotalSize(results.dependencies);
  const devDepsTotal = getSectionTotalSize(results.devDependencies);
  const overallTotal = depsTotal + devDepsTotal;

  if (flags.table) {
    renderTable("Dependencies", results.dependencies);
    renderTable("DevDependencies", results.devDependencies);
  } else {
    console.log("\n🧩 Dependencies:");
    renderSection(results.dependencies, flags);

    console.log("\n🧪 DevDependencies:");
    renderSection(results.devDependencies, flags);
  }

  console.log("\n📦 Total Dependency Size:     " + formatSize(depsTotal));
  console.log("🧪 Total DevDependency Size:  " + formatSize(devDepsTotal));
  console.log("📂 Total node_modules Size:   " + formatSize(overallTotal));
}

function renderSection(
  section: Record<string, any>,
  flags: { verbose: boolean; tree: boolean }
) {
  for (const [pkg, data] of Object.entries(section)) {
    const totalSize = calcTotalSize(data);
    console.log(
      `📦 ${pkg} → ${formatSize(data.size)} (Total: ${formatSize(totalSize)})`
    );

    if (flags.tree) {
      renderTree(data.deps, "   ", new Set());
    } else if (flags.verbose) {
      for (const [dep, sub] of Object.entries(data.deps)) {
        console.log(
          `   └─ ${dep}: ${formatSize((sub as { size: number }).size)}`
        );
      }
    }
  }
}

function renderTree(
  deps: Record<string, any>,
  prefix = "   ",
  visited = new Set<string>()
) {
  for (const [dep, sub] of Object.entries(deps)) {
    const identifier = `${dep}:${sub.size}`;
    if (visited.has(identifier)) continue;
    visited.add(identifier);

    console.log(`${prefix}└─ ${dep} (${formatSize(sub.size)})`);
    renderTree(sub.deps, prefix + "   ", visited);
  }
}

function renderTable(title: string, section: Record<string, any>) {
  const colWidths = [40, 15, 25];
  const headers = ["Package", "Size", "Total Size (incl. deps)"];

  let output = `\n=== ${title} ===\n`;

  output +=
    pad(headers[0]!, colWidths[0]!) +
    pad(headers[1]!, colWidths[1]!, "right") +
    pad(headers[2]!, colWidths[2]!, "right") +
    "\n";

  output +=
    "-".repeat(colWidths[0]!) +
    "-".repeat(colWidths[1]!) +
    "-".repeat(colWidths[2]!) +
    "\n";

  for (const [pkg, data] of Object.entries(section)) {
    const totalSize = calcTotalSize(data);
    output +=
      pad(pkg, colWidths[0]!) +
      pad(formatSize(data.size), colWidths[1]!, "right") +
      pad(formatSize(totalSize), colWidths[2]!, "right") +
      "\n";
  }

  console.log(output);
}

export async function exportResults(
  results: {
    dependencies: Record<string, any>;
    devDependencies: Record<string, any>;
  },
  exportPath: string,
  flags?: { table?: boolean }
) {
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
  } else if (format === "txt") {
    if (flags?.table) {
      function toTableText(res: Record<string, any>): string {
        const colWidths = [40, 15, 25];
        const headers = ["Package", "Size", "Total Size (incl. deps)"];
        let str =
          pad(headers[0]!, colWidths[0]!) +
          pad(headers[1]!, colWidths[1]!, "right") +
          pad(headers[2]!, colWidths[2]!, "right") +
          "\n";

        str +=
          "-".repeat(colWidths[0]!) +
          "-".repeat(colWidths[1]!) +
          "-".repeat(colWidths[2]!) +
          "\n";

        for (const [pkg, data] of Object.entries(res)) {
          const totalSize = calcTotalSize(data);
          str +=
            pad(pkg, colWidths[0]!) +
            pad(formatSize(data.size), colWidths[1]!, "right") +
            pad(formatSize(totalSize), colWidths[2]!, "right") +
            "\n";
        }

        return str;
      }

      content += "Dependencies:\n";
      content += toTableText(results.dependencies);
      content += "\nDevDependencies:\n";
      content += toTableText(results.devDependencies);
    } else {
      function toText(res: Record<string, any>, indent = ""): string {
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
  } else if (format === "md") {
    function toMarkdown(res: Record<string, any>, depth = 0): string {
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
  } else {
    throw new Error(`❌ Unsupported export format: ${format}`);
  }

  await fs.mkdir(path.dirname(resolvedPath), { recursive: true });
  await fs.writeFile(resolvedPath, content, "utf8");

  console.log(`\n✅ Exported to ${resolvedPath}`);
}
