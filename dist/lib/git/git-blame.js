import { execSync } from "child_process";
import { writeFileSync } from "fs";
import { colorize } from "../utils/common/index.js";
import { getFilesToAnalyze, parseBlameOutput, formatOutput, formatDetailedSummaryOutput, generateMarkdownSummary, generateMarkdownResults, } from "../utils/git/index.js";
/**
 * Print a summary of the top contributors for each file in the repository,
 * with support for flags:
 * --top <N>, --file <f>, --json, --min <n>, --brief, --summary, --export <path>
 */
export function gitBlameSummary(flags = {}) {
    const topN = flags.top ? parseInt(flags.top, 10) : 1;
    const minLines = flags.min ? parseInt(flags.min, 10) : 0;
    const outputJSON = !!flags.json;
    const brief = !!flags.brief;
    const summary = !!flags.summary;
    let exportPath = flags.export;
    if (exportPath && !flags.file && !summary) {
        console.warn(colorize("--export flag only applicable when --file and --summary are specified; ignoring --export.", "yellow"));
        exportPath = undefined;
    }
    if (exportPath && brief) {
        console.warn(colorize("--export flag is not compatible with --brief; ignoring --export.", "yellow"));
        exportPath = undefined;
    }
    if (brief && !flags.file) {
        console.warn(colorize("--brief flag only applicable when --file is specified; ignoring --brief.", "yellow"));
    }
    let files;
    try {
        files = getFilesToAnalyze(flags.file);
    }
    catch (error) {
        console.error(colorize("❌ Failed to get files from git.", "red"));
        return;
    }
    if (files.length === 0) {
        console.log("No files found in repository.");
        return;
    }
    const results = {};
    const authorSummaries = {};
    for (const file of files) {
        try {
            const blameOutput = execSync(`git blame --line-porcelain ${file}`, {
                encoding: "utf-8",
            });
            const { authors, briefOutput } = parseBlameOutput(blameOutput, brief && !!flags.file);
            const total = Object.values(authors).reduce((a, b) => a + b, 0);
            if (total < minLines) {
                continue;
            }
            const sorted = Object.entries(authors)
                .sort((a, b) => b[1] - a[1])
                .slice(0, topN);
            const contributors = sorted.map(([author, count]) => ({
                author,
                lines: count,
                percent: (count / total) * 100,
            }));
            if (summary) {
                for (const [author, lines] of Object.entries(authors)) {
                    if (!authorSummaries[author]) {
                        authorSummaries[author] = { total: 0, perFile: {} };
                    }
                    authorSummaries[author].total += lines;
                    authorSummaries[author].perFile[file] = lines;
                }
            }
            if (outputJSON) {
                results[file] = {
                    totalLines: total,
                    contributors,
                    briefOutput,
                };
            }
            else {
                formatOutput(file, total, contributors, briefOutput, outputJSON);
            }
        }
        catch (err) {
            console.error(colorize(`❌ Failed to blame ${file}`, "red"));
        }
    }
    if (outputJSON) {
        console.log(JSON.stringify(results, null, 2));
    }
    if (summary) {
        formatDetailedSummaryOutput(authorSummaries);
    }
    if (exportPath) {
        let mdContent = "";
        if (summary) {
            mdContent += generateMarkdownSummary(authorSummaries);
        }
        else {
            // If no summary flag, export detailed per-file results
            mdContent += generateMarkdownResults(results);
        }
        try {
            writeFileSync(exportPath.toString() === "true" ? "git-blame.md" : exportPath, mdContent, { encoding: "utf-8" });
            console.log(colorize(`\n✅ Exported results to ${exportPath.toString() === "true" ? "git-blame.md" : exportPath}`, "green"));
        }
        catch (err) {
            console.error(colorize(`❌ Failed to write export file: ${exportPath.toString() === "true" ? "git-blame.md" : exportPath}`, "red"));
        }
    }
}
//# sourceMappingURL=git-blame.js.map