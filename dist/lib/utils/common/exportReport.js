import fs from "fs";
import path from "path";
export function exportReport(stats, flags, contributors) {
    const filenameBase = `git-report-${new Date().toISOString().split("T")[0]}`;
    const outputDir = "./exported-reports";
    if (!fs.existsSync(outputDir))
        fs.mkdirSync(outputDir);
    switch (flags.export) {
        case "json": {
            const outputPath = path.join(outputDir, `${filenameBase}.json`);
            fs.writeFileSync(outputPath, JSON.stringify({ contributors: Array.from(contributors), stats }, null, 2));
            console.log(`✅ JSON report saved to ${outputPath}`);
            break;
        }
        case "txt": {
            const lines = [];
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
                    messages.forEach(({ hash, message }) => {
                        lines.push(`       • ${hash.slice(0, 7)} — ${message}`);
                    });
                }
            }
            const outputPath = path.join(outputDir, `${filenameBase}.txt`);
            fs.writeFileSync(outputPath, lines.join("\n"));
            console.log(`✅ Text report saved to ${outputPath}`);
            break;
        }
        case "md": {
            const lines = [];
            lines.push(`# 🧾 Git Contribution Report\n`);
            lines.push(`- 📅 Since: ${flags.since || "Beginning of repo"}`);
            lines.push(`- 👥 Total Contributors: ${contributors.size}`);
            lines.push(`\n---`);
            for (const author in stats) {
                lines.push(`\n## 👤 ${author}`);
                for (const period in stats[author]) {
                    const { commits, added, deleted, messages } = stats[author][period];
                    lines.push(`\n### 📆 ${period}`);
                    lines.push(`- Commits: **${commits}**`);
                    lines.push(`- Lines added: \`${added}\` | Lines deleted: \`${deleted}\``);
                    lines.push(`- Messages:`);
                    messages.forEach(({ hash, message }) => {
                        lines.push(`  - \`${hash.slice(0, 7)}\` — ${message}`);
                    });
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
//# sourceMappingURL=exportReport.js.map