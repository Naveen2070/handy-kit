import path from "path";
import { colorize, printTemplate } from "../utils/common/index.js";
import {
  exportMarkdown,
  getBranchInfo,
  getDiffPreview,
  getStagedFiles,
  getUnpushedCommits,
} from "../utils/git/index.js";

/**
 * @function gitReview
 * @description Shows a pre-PR review summary: branch info, unpushed commits, staged files, and a diff preview.
 * @param _ ignored
 * @param flags flags passed to the command
 * @option --export [path] export the report to a markdown file. If not specified, the report is printed to the console.
 */
export function gitReview(_: string[], flags: Record<string, any> = {}): void {
  const help = flags["help"] || flags["h"];

  if (help) {
    printTemplate("help.git-review");
    process.exit(0);
  }

  try {
    const output: string[] = [];
    const log = (msg: string) => {
      output.push(msg);
      console.log(msg);
    };

    log("\n" + colorize("🔍 GIT REVIEW SUMMARY", "cyan"));
    log("=".repeat(50));

    // 1. Branch Info
    const { branch, tracking } = getBranchInfo();
    log(`${colorize("📎 Branch:", "yellow")} ${branch}`);
    log(
      `${colorize("🔗 Tracking:", "yellow")} ${
        tracking || colorize("(no upstream set)", "red")
      }`
    );

    if (!tracking) {
      log(
        colorize(
          `⚠️  This branch has no upstream. To push:\n   git push --set-upstream origin ${branch}`,
          "magenta"
        )
      );
    }

    // 2. Unpushed Commits
    const unpushed = getUnpushedCommits(tracking);
    log(`\n${colorize("🔼 Unpushed Commits:", "blue")}`);
    log(unpushed || colorize("✅ No unpushed commits", "green"));

    // 3. Staged Files
    const staged = getStagedFiles();
    log(`\n${colorize("📂 Staged Files:", "blue")}`);
    log(staged || colorize("✅ No staged files", "green"));

    // 4. Diff Preview
    const { preview, truncated, total } = getDiffPreview();
    log(`\n${colorize("📄 Diff Preview:", "blue")}`);

    if (preview.includes("✅")) {
      log(colorize(preview, "green"));
    } else {
      if (truncated) {
        log(
          colorize(
            `⚠️  Large diff (${total} lines). Showing first 100 lines...\n`,
            "magenta"
          )
        );
      }
      log(preview);
      if (truncated) log(colorize("...diff truncated.", "yellow"));
    }

    log("\n" + "=".repeat(50));
    log(colorize("✅ Review complete!\n", "green"));

    // 5. Export if --export is set
    let exportPath = flags["export"] || flags["e"];
    if (exportPath) {
      if (exportPath === true || exportPath === "true") {
        exportPath = path.join(process.cwd(), "git-review-report.md");
      }

      exportMarkdown(exportPath, {
        branch,
        tracking,
        unpushed,
        staged,
        diff: preview,
        truncated,
        diffLines: total,
      });
    }
  } catch (err) {
    printTemplate("errors.notAGitRepo");
  }
}
