import path from "path";
import fs from "fs";
import { colorize, printTemplate } from "../utils/common/index.js";
import { exportMarkdown, getBranchInfo, getDiffPreview, getStagedFiles, getUnpushedCommits, } from "../utils/git/index.js";
/**
 * @function gitReview
 * @description Shows a pre-PR review summary: branch info, unpushed commits, staged files, and a diff preview.
 * @param _ ignored
 * @param flags flags passed to the command
 * @option --export [path] export the report to a markdown file. If not specified, the report is printed to the console.
 * @option --format [json|md] format to export the report in. Defaults to markdown.
 * @option --no-emoji removes emojis from the report.
 * @option --summary shows only the summary (branch info, unpushed commits, and staged files).
 * @option --timestamp adds a timestamp to the exported filename.
 */
export function gitReview(_, flags = {}) {
    const help = flags["help"] || flags["h"];
    const jsonFormat = flags["format"] === "json";
    const noEmoji = flags["no-emoji"] || false;
    const summaryOnly = flags["summary"] || false;
    const useTimestamp = flags["timestamp"] || false;
    if (help) {
        printTemplate("help.git-review");
        process.exit(0);
    }
    try {
        const output = [];
        const log = (msg) => {
            output.push(msg);
            console.log(msg);
        };
        const e = (emoji, fallback) => (noEmoji ? fallback : emoji);
        log("\n" + colorize(`${e("🔍", ">>")} GIT REVIEW SUMMARY`, "cyan"));
        log("=".repeat(50));
        // 1. Branch Info
        const { branch, tracking } = getBranchInfo();
        log(`${colorize(`${e("📎", "-")} Branch:`, "yellow")} ${branch}`);
        log(`${colorize(`${e("🔗", "-")} Tracking:`, "yellow")} ${tracking || colorize("(no upstream set)", "red")}`);
        if (!tracking) {
            log(colorize(`${e("⚠️", "!")}  This branch has no upstream. To push:\n   git push --set-upstream origin ${branch}`, "magenta"));
        }
        // 2. Unpushed Commits
        const unpushed = getUnpushedCommits(tracking);
        log(`\n${colorize(`${e("🔼", "-")} Unpushed Commits:`, "blue")}`);
        log(unpushed || colorize(`${e("✅", "✔")} No unpushed commits`, "green"));
        // 3. Staged Files
        const staged = getStagedFiles();
        log(`\n${colorize(`${e("📂", "-")} Staged Files:`, "blue")}`);
        log(staged || colorize(`${e("✅", "✔")} No staged files`, "green"));
        // 4. Diff Preview
        let preview = "";
        let truncated = false;
        let total = 0;
        if (!summaryOnly) {
            const diffData = getDiffPreview();
            preview = diffData.preview;
            truncated = diffData.truncated;
            total = diffData.total;
            log(`\n${colorize(`${e("📄", "-")} Diff Preview:`, "blue")}`);
            if (preview.includes("✅")) {
                log(colorize(preview, "green"));
            }
            else {
                if (truncated) {
                    log(colorize(`${e("⚠️", "!")}  Large diff (${total} lines). Showing first 100 lines...\n`, "magenta"));
                }
                log(preview);
                if (truncated)
                    log(colorize("...diff truncated.", "yellow"));
            }
        }
        log("\n" + "=".repeat(50));
        log(colorize(`${e("✅", "✔")} Review complete!\n`, "green"));
        // 5. Export
        let exportPath = flags["export"] || flags["e"];
        if (exportPath) {
            const extension = jsonFormat ? "json" : "md";
            const baseName = `git-review-report`;
            if (exportPath === true || exportPath === "true") {
                exportPath = path.join(process.cwd(), useTimestamp
                    ? `${baseName}-${new Date()
                        .toISOString()
                        .slice(0, 10)}.${extension}`
                    : `${baseName}.${extension}`);
            }
            const exportData = {
                branch,
                tracking,
                unpushed,
                staged,
                diff: preview,
                truncated,
                diffLines: total,
            };
            if (jsonFormat) {
                fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2), "utf-8");
                console.log(colorize(`📁 Exported JSON summary to ${exportPath}`, "green"));
            }
            else {
                exportMarkdown(exportPath, exportData, noEmoji);
            }
        }
    }
    catch (err) {
        printTemplate("errors.notAGitRepo");
    }
}
//# sourceMappingURL=git-review.js.map