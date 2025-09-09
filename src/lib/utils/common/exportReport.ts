import fs from "fs";
import path from "path";

type ExportData = Record<string, any>;

/**
 * Exports the report to a file in the specified format.
 *
 * @param stats - A JSON object with the report data.
 * @param flags - An object with the following properties:
 *   - `export`: The format to export the report in (json, txt, or md).
 * @param contributors - A Set containing the contributors to the report.
 */
export function exportReport(
  stats: ExportData,
  flags: Record<string, any>,
  contributors: Set<string>
) {
  const filenameBase = `git-report-${new Date().toISOString().split("T")[0]}`;
  const outputDir = "./exported-reports";
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  // Determine which output format to use
  switch (flags.export) {
    case "json": {
      // Export to JSON
      const outputPath = path.join(outputDir, `${filenameBase}.json`);
      fs.writeFileSync(
        outputPath,
        // Use JSON.stringify to pretty-print the report
        JSON.stringify(
          { contributors: Array.from(contributors), stats },
          null,
          2
        )
      );
      console.log(`✅ JSON report saved to ${outputPath}`);
      break;
    }

    case "txt": {
      // Export to plain text
      const lines: string[] = [];
      lines.push(`GIT REPORT (${new Date().toDateString()})`);
      lines.push(`Contributors: ${contributors.size}`);
      lines.push("=".repeat(50));
      for (const author in stats) {
        lines.push(`\n👤 ${author}`);
        for (const period in stats[author]) {
          const { commits, added, deleted, messages } = stats[author][period];
          lines.push(`   📆 ${period}`);
          lines.push(`     - Commits: ${commits}`);
          lines.push(`     - +${added} / -${deleted}`);
          lines.push(`     - Messages:`);
          messages.forEach(
            ({ hash, message }: { hash: string; message: string }) => {
              lines.push(`       • ${hash.slice(0, 7)} — ${message}`);
            }
          );
        }
      }
      const outputPath = path.join(outputDir, `${filenameBase}.txt`);
      fs.writeFileSync(outputPath, lines.join("\n"));
      console.log(`✅ Text report saved to ${outputPath}`);
      break;
    }

    case "md": {
      // Export to Markdown
      const lines: string[] = [];
      lines.push(`# 🧾 Git Contribution Report\n`);
      lines.push(`- 📅 Since: ${flags.since || "Beginning of repo"}`);
      lines.push(`- 👥 Total Contributors: ${contributors.size}`);
      lines.push(`\n---`);

      for (const author in stats) {
        lines.push(`\n## 👤 ${author}`);
        for (const period in stats[author]) {
          const { commits, added, deleted, messages } = stats[author][
            period
          ] as any;
          lines.push(`\n### 📆 ${period}`);
          lines.push(`- Commits: **${commits}**`);
          lines.push(
            `- Lines added: \`${added}\` | Lines deleted: \`${deleted}\``
          );
          lines.push(`- Messages:`);
          messages.forEach(
            ({ hash, message }: { hash: string; message: string }) => {
              lines.push(`  - \`${hash.slice(0, 7)}\` — ${message}`);
            }
          );
        }
      }

      const outputPath = path.join(outputDir, `${filenameBase}.md`);
      fs.writeFileSync(outputPath, lines.join("\n"));
      console.log(`✅ Markdown report saved to ${outputPath}`);
      break;
    }

    default:
      break;
  }
}
