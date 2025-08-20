import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { printTemplate } from "./utils/templates.js";
import type { GitStandupOptions } from "./types/utils.js";

/**
 * Prints or exports a grouped list of commits from the last n days/weeks/months/years.
 * If no duration is specified, it will throw an error.
 *
 * @param options - An object containing the following properties:
 *   - `days`: The number of days to look back.
 *   - `weeks`: The number of weeks to look back.
 *   - `months`: The number of months to look back.
 *   - `years`: The number of years to look back.
 *   - `author`: An optional filter to select only commits from the specified author.
 *   - `branch`: An optional filter to select only commits from the specified branch.
 *   - `exportPath`: An optional path to export the report to a file.
 */
export function gitStandup(options: GitStandupOptions): void {
  try {
    const sinceDate = new Date();
    if (options.days) sinceDate.setDate(sinceDate.getDate() - options.days);
    if (options.weeks)
      sinceDate.setDate(sinceDate.getDate() - options.weeks * 7);
    if (options.months)
      sinceDate.setMonth(sinceDate.getMonth() - options.months);
    if (options.years)
      sinceDate.setFullYear(sinceDate.getFullYear() - options.years);

    const since = sinceDate.toISOString().split("T")[0];

    let cmd = `git log --since="${since}" --pretty=format:"%ad|%an|%d|%s" --date=short`;

    const output = execSync(cmd, { encoding: "utf-8" });

    if (!output.trim()) {
      printTemplate("errors.gitStandupNoCommits", { days: options.days });
      return;
    }

    const lines = output.trim().split("\n");
    const grouped: Record<string, string[]> = {};

    const authorFilter = options.author?.toLowerCase();
    const branchFilters = options.branch
      ? options.branch.split(",").map((b) => b.trim().toLowerCase())
      : null;

    for (const line of lines) {
      const parts = line.split("|");
      if (parts.length < 4) continue;

      const [date, author, ref, ...msgParts] = parts;
      const message = msgParts.join("|").trim();
      const branch = ref!.replace(/[() ]/g, "") || "unknown";

      // author filter (case-insensitive, substring)
      if (authorFilter && !author!.toLowerCase().includes(authorFilter)) {
        continue;
      }

      // branch filter (case-insensitive, substring, supports multiple)
      if (
        branchFilters &&
        !branchFilters.some((bf) => branch.toLowerCase().includes(bf))
      ) {
        continue;
      }

      if (!grouped[date!]) grouped[date!] = [];
      grouped[date!]!.push(`- [${branch}] ${message} (${author})`);
    }

    if (Object.keys(grouped).length === 0) {
      printTemplate("errors.gitStandupNoCommits", { days: options.days });
      return;
    }

    let formatted = "";
    for (const [date, commits] of Object.entries(grouped)) {
      formatted += `📅 ${date}\n${commits.join("\n")}\n\n`;
    }

    console.log(formatted.trim());

    let exportPath =
      options.exportPath && options.exportPath.toString() === "true"
        ? path.join(process.cwd(), "git-standup-report.md")
        : options.exportPath;

    if (exportPath) {
      fs.writeFileSync(exportPath!, `# Git Standup Report\n\n${formatted}`);
      console.log(`✅ Exported report to ${exportPath}`);
    }
  } catch (err) {
    printTemplate("errors.notAGitRepo");
  }
}
