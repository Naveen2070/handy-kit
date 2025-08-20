import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { printTemplate } from "./utils/templates.js";

interface GitStandupOptions {
  days?: number | undefined;
  weeks?: number | undefined;
  months?: number | undefined;
  years?: number | undefined;
  author?: string | undefined;
  branch?: string | undefined;
  exportPath?: string | undefined;
}

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

    // ✅ build git log command
    let cmd = `git log --since="${since}" --pretty=format:"%ad|%an|%d|%s" --date=short`;
    if (options.author) cmd += ` --author="${options.author}"`;
    if (options.branch) cmd += ` ${options.branch}`;

    const output = execSync(cmd, { encoding: "utf-8" });

    if (!output.trim()) {
      printTemplate("errors.gitStandupNoCommits", { days: options.days });
      return;
    }

    // ✅ process commits into grouped format
    const lines = output.trim().split("\n");
    const grouped: Record<string, string[]> = {};

    for (const line of lines) {
      const [date, author, ref, message] = line.split("|");
      const branch = ref!.replace(/[() ]/g, "") || "unknown";
      if (!grouped[date!]) grouped[date!] = [];
      grouped[date!]!.push(`- [${branch}] ${message} (${author})`);
    }

    // ✅ format for console & markdown
    let formatted = "";
    for (const [date, commits] of Object.entries(grouped)) {
      formatted += `📅 ${date}\n${commits.join("\n")}\n\n`;
    }

    console.log(formatted.trim());

    // ✅ export if requested, otherwise default to current CLI path
    let exportPath =
      options.exportPath || path.join(process.cwd(), "git-standup-report.md");

    if (exportPath.toString() === "true") {
      exportPath = path.join(process.cwd(), "git-standup-report.md");
    }

    fs.writeFileSync(exportPath, `# Git Standup Report\n\n${formatted}`);
    console.log(`✅ Exported report to ${exportPath}`);
  } catch (err) {
    printTemplate("errors.notAGitRepo");
  }
}
