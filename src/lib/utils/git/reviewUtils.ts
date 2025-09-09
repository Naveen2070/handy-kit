import { colorize } from "../common/index.js";
import { execSync } from "child_process";
import fs from "fs";

/**
 * Get the current branch and tracking information.
 *
 * @returns An object containing the branch and tracking information.
 */
export function getBranchInfo(): { branch: string; tracking: string } {
  const branch = execSync("git rev-parse --abbrev-ref HEAD", {
    encoding: "utf-8",
  }).trim();

  let tracking = "";
  // Try to get the tracking information
  try {
    tracking = execSync(
      "git rev-parse --abbrev-ref --symbolic-full-name @{u}",
      { encoding: "utf-8" }
    ).trim();
  } catch {
    // If there is no tracking information, set it to an empty string
    tracking = "";
  }

  return { branch, tracking };
}

/**
 * Get the commits that are not pushed to the remote branch.
 *
 * @param tracking The remote branch that is being tracked.
 * @returns A string containing the commits that are not pushed to the remote branch.
 */
export function getUnpushedCommits(tracking: string): string {
  if (!tracking) return "";
  try {
    // Get the commits that are not pushed to the remote branch
    return execSync(`git log ${tracking}..HEAD --oneline`, {
      encoding: "utf-8",
    }).trim();
  } catch {
    // If there is an error, return an empty string
    return "";
  }
}

/**
 * Get the list of staged files.
 *
 * @returns A string containing the list of staged files, separated by newlines.
 */
export function getStagedFiles(): string {
  return execSync("git diff --cached --name-only", {
    encoding: "utf-8",
  }).trim();
}

/**
 * Get a preview of the staged changes.
 *
 * @returns An object containing the diff preview, a boolean indicating if the diff was truncated, and the total number of lines in the diff.
 */
export function getDiffPreview(): {
  preview: string;
  truncated: boolean;
  total: number;
} {
  /**
   * Get the raw diff of the staged changes.
   *
   * If there are no staged changes, return an empty string.
   */
  const rawDiff = execSync("git diff --cached", { encoding: "utf-8" }).trim();
  const lines = rawDiff.split("\n");

  /**
   * If the diff is empty, return a message indicating that there are no staged changes.
   */
  if (!rawDiff)
    return {
      preview: "✅ No staged changes to show",
      truncated: false,
      total: 0,
    };

  /**
   * Set the maximum number of lines to show in the preview.
   */
  const MAX = 100;

  /**
   * If the diff has more lines than the maximum, truncate it and return the truncated version.
   */
  if (lines.length > MAX) {
    return {
      preview: lines.slice(0, MAX).join("\n"),
      truncated: true,
      total: lines.length,
    };
  }

  /**
   * If the diff is not truncated, return the full diff.
   */
  return {
    preview: rawDiff,
    truncated: false,
    total: lines.length,
  };
}

/**
 * Exports the review summary to a markdown file.
 *
 * @param filePath The path to the markdown file to write.
 * @param data The data to write to the markdown file.
 * @param noEmoji If true, the emoji characters will be replaced with their fallback strings.
 */
export function exportMarkdown(
  filePath: string,
  data: {
    branch: string;
    tracking: string;
    unpushed: string;
    staged: string;
    diff: string;
    truncated: boolean;
    diffLines: number;
  },
  noEmoji = false
): void {
  /**
   * Returns the fallback string for the given emoji character if noEmoji is true, otherwise the emoji character itself.
   */
  const e = (emoji: string, fallback: string) => (noEmoji ? fallback : emoji);

  /**
   * The lines of the markdown file to be written.
   */
  const lines = [
    `# ${e("🔍", "")} Git Review Summary`,
    "",
    "## Branch Info",
    `- **Branch**: \`${data.branch}\``,
    `- **Tracking**: ${
      data.tracking ? `\`${data.tracking}\`` : "**(no upstream set)**"
    }`,
    !data.tracking
      ? `> ${e(
          "⚠️",
          "!"
        )} This branch has no upstream.\n> \`git push --set-upstream origin ${
          data.branch
        }\``
      : "",
    "",
    "## Unpushed Commits",
    data.unpushed || `${e("✅", "✔")} No unpushed commits`,
    "",
    "## Staged Files",
    data.staged || `${e("✅", "✔")} No staged files`,
    "",
    "## Diff Preview",
    data.diff
      ? [
          data.truncated
            ? `${e("⚠️", "!")} Large diff (${
                data.diffLines
              } lines). Showing first 100 lines:\n`
            : "",
          "```diff",
          data.diff,
          "```",
          data.truncated ? "\n...diff truncated." : "",
        ].join("\n")
      : `${e("✅", "✔")} No staged changes to show`,
    "",
    `${e("✅", "✔")} Review complete!`,
  ].join("\n");

  try {
    fs.writeFileSync(filePath, lines, "utf-8");
    console.log(
      colorize(`📁 Exported markdown summary to ${filePath}`, "green")
    );
  } catch (err) {
    console.error(colorize(`❌ Failed to write export file: ${err}`, "red"));
  }
}
