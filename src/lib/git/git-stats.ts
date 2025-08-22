// gitStats.ts
import { execSync } from "child_process";
import { exportReport, printTemplate, renderChart } from "../utils/index.js";

type Flags = {
  since?: string;
  author?: string;
  daily?: boolean;
  weekly?: boolean;
  monthly?: boolean;
  export?: "json" | "md" | "txt";
};

type CommitEntry = {
  hash: string;
  date: string;
  message: string;
};

type CommitStats = {
  commits: number;
  added: number;
  deleted: number;
  messages: CommitEntry[];
};

type AuthorStats = Record<string, CommitStats>;

/**
 * gitStats.ts
 *
 * This function generates a report of contributors to the Git repository
 * containing statistics about the number of commits, lines added/deleted,
 * and a brief message for each commit.
 *
 * The report is grouped by author and then by date, with the option to
 * group by daily, weekly, or monthly periods.
 *
 * The function takes an object with the following properties:
 *   - `since`: The date from which to start the report (inclusive).
 *   - `author`: An optional filter to select only commits from the
 *     specified author.
 *   - `daily`, `weekly`, `monthly`: Optional flags to group the
 *     report by the specified period.
 *   - `export`: An optional flag to export the report to a file in
 *     the specified format (json, md, or txt).
 *
 * The function returns nothing, but prints the report to the console,
 * including a summary at the top and a visual chart of the data at the
 * bottom.
 */
export async function gitStats(flags: Flags) {
  /**
   * The format of the output from `git log`.
   *
   * This format is used to extract the author, date, hash, and message
   * from each commit.
   */
  const format = "%an|%ad|%H|%s"; // author|date|hash|message

  /**
   * The command to run `git log` with the specified options.
   */
  let command = `git log --pretty=format:"${format}" --shortstat --date=short`;

  /**
   * Add options to the command if specified.
   */
  if (flags.since) command += ` --since="${flags.since}"`;
  if (flags.author) command += ` --author="${flags.author}"`;

  /**
   * Run the command and capture the output.
   */
  let output: string;
  try {
    output = execSync(command, { encoding: "utf-8" });
  } catch (err) {
    printTemplate("errors.notAGitRepo");
    return;
  }

  if (!output.trim()) {
    printTemplate("errors.gitStandupNoCommits", { days: flags.since });
    return;
  }

  /**
   * Split the output into individual lines.
   */
  const lines = output.split("\n");

  /**
   * Initialize the object to store the report data.
   */
  const stats: Record<string, AuthorStats> = {};
  const contributors = new Set<string>();

  /**
   * Iterate over the lines and extract the data.
   */
  let currentAuthor = "";
  let currentDate = "";
  let currentHash = "";
  let currentMessage = "";

  for (const line of lines) {
    if (line.includes("|") && !line.includes("files changed")) {
      const [author, date, hash, message] = line
        .split("|")
        .map((s) => s.trim()) as [string, string, string, string];

      currentAuthor = author;
      currentDate = date;
      currentHash = hash;
      currentMessage = message;

      contributors.add(author!);

      const key = getPeriod(currentDate, flags);

      if (!stats[author]) stats[author!] = {};
      if (!stats[author]![key]) {
        stats[author]![key] = {
          commits: 0,
          added: 0,
          deleted: 0,
          messages: [],
        };
      }

      stats[author]![key].commits++;
      stats[author]![key].messages.push({
        hash,
        date,
        message,
      });
    } else if (line.includes("files changed")) {
      const added = extractNumber(line, /(\d+) insertions?/);
      const deleted = extractNumber(line, /(\d+) deletions?/);
      const key = getPeriod(currentDate, flags);

      if (stats[currentAuthor] && stats[currentAuthor]![key]) {
        stats[currentAuthor]![key]!.added += added;
        stats[currentAuthor]![key]!.deleted += deleted;
      }
    }
  }

  printTemplate("success.gitStats", { days: flags.since });
  // 🧾 Summary
  console.log(`\n🧾 GIT CONTRIBUTION REPORT`);
  console.log(`📅 Since: ${flags.since || "Beginning of repo"}`);
  console.log(`👥 Total Contributors: ${contributors.size}`);
  console.log("=".repeat(50));

  // 👤 Author breakdown
  for (const author of Object.keys(stats)) {
    console.log(`\n👤 ${author}`);
    for (const period of Object.keys(stats[author]!)) {
      const { commits, added, deleted, messages } = stats[author]![
        period
      ] as CommitStats;
      console.log(`   📆 ${period}`);
      console.log(`     - Commits: ${commits}`);
      console.log(`     - +${added} / -${deleted}`);
      console.log(`     - Messages:`);
      messages.forEach(({ hash, message }) => {
        console.log(`       • ${hash.slice(0, 7)} — ${message}`);
      });
    }
  }

  // 📊 Visual chart
  renderChart(stats, flags);

  if (flags.export) {
    exportReport(stats, flags, contributors);
  }
}

/**
 * Given a date string in the format "YYYY-MM-DD", and flags, returns a string
 * representing a period of time. The type of period depends on the flags.
 *
 * @param date The date string
 * @param flags The flags
 *
 * @returns The period string
 */
function getPeriod(date: string, flags: Flags): string {
  const [year, month, day] = date.split("-");

  // If the user wants daily periods, return the full date string
  if (flags.daily) return `${year}-${month}-${day}`;

  // If the user wants weekly periods, return a string in the format:
  // "YYYY-MM (Week X)"
  if (flags.weekly) {
    const week = Math.ceil(parseInt(day || "1", 10) / 7);
    return `${year}-${month} (Week ${week})`;
  }

  // If the user wants monthly periods, return a string in the format:
  // "YYYY-MM"
  if (flags.monthly) return `${year}-${month}`;

  // If none of the above flags are set, return the full date string
  return date;
}

/**
 * Given a string, and a regular expression, returns the number extracted from
 * the string using the regular expression.
 *
 * @param str The string
 * @param regex The regular expression
 *
 * @returns The extracted number
 */
function extractNumber(str: string, regex: RegExp): number {
  // Use the regular expression to match the number in the string
  const match = str.match(regex);

  // If a match is found, extract the number from the match
  // and return it as a number
  return match ? parseInt(match[1]!, 10) : 0;
}
