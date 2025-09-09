import { execSync } from "child_process";
import type { BlameResult, Contributor } from "../../types/utils.js";
import { colorize } from "../common/index.js";

/**
 * Returns a list of files to analyze.
 * If a file flag is provided, only that file is analyzed.
 * Otherwise, all files in the repository are analyzed.
 * @param fileFlag {string} optional, file to analyze
 * @returns {string[]} list of files to analyze
 */
export function getFilesToAnalyze(fileFlag?: string): string[] {
  if (fileFlag) {
    // If a file flag is provided, only analyze that file
    return [fileFlag];
  }
  // Otherwise, get all files in the repository
  const files = execSync("git ls-files", { encoding: "utf-8" })
    .split("\n")
    .filter(Boolean);

  return files;
}

/**
 * Parse the output of `git blame --porcelain` into a mapping of authors to the number of lines they contributed.
 * @param blameOutput {string} output of `git blame --porcelain`
 * @param brief {boolean} whether to generate brief output
 * @returns {authors: Record<string, number>, briefOutput?: string[]} mapping of authors to number of lines and optional brief output
 */
export function parseBlameOutput(
  blameOutput: string,
  brief: boolean
): { authors: Record<string, number>; briefOutput?: string[] } {
  const authors: Record<string, number> = {};
  const lines = blameOutput.split("\n");
  const briefOutput: string[] = [];

  // porcelain format groups each block per source line
  // Each block starts with a commit hash line, followed by lines including 'author ' and 'linenumber ' lines
  let currentLineNum = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] as string;

    if (line.startsWith("author ")) {
      const author = line.slice(7).trim();
      authors[author] = (authors[author] || 0) + 1;
    }

    if (brief && line.startsWith("    lineno ")) {
      // lineno line is indented by 4 spaces followed by lineno <number>
      const linenoStr = line.trim().split(" ")[1];
      currentLineNum = parseInt(linenoStr as string, 10);
    }

    if (brief && line.startsWith("author ")) {
      const author = line.slice(7).trim();
      briefOutput.push(`line ${currentLineNum}: ${author}`);
    }
  }

  return { authors, briefOutput: brief ? briefOutput : [] };
}

/**
 * Format the output of the blame summary (console)
 * @param file {string} file analyzed
 * @param total {number} total lines in the file
 * @param contributors {Contributor[]} contributors to the file
 * @param briefOutput {string[]} optional brief output of per-line authorship
 * @param outputJSON {boolean} whether to output in JSON format
 */
export function formatOutput(
  file: string,
  total: number,
  contributors: Contributor[],
  briefOutput: string[] | undefined,
  outputJSON: boolean
): void {
  if (outputJSON) {
    // JSON output handled outside
    return;
  }

  console.log(colorize(`\n${file}`, "cyan"));
  console.log(`  - Total lines: ${total}`);

  for (const { author, lines, percent } of contributors) {
    console.log(`  - ${author} (${lines} lines, ${percent.toFixed(1)}%)`);
  }

  if (briefOutput && briefOutput.length > 0) {
    console.log("  - Brief per-line authorship:");
    for (const line of briefOutput) {
      console.log(`      ${line}`);
    }
  }
}

/**
 * Format the detailed summary output (console)
 * @param authorSummaries {Record<string, {total: number, perFile: Record<string, number>}>}
 */
export function formatDetailedSummaryOutput(
  authorSummaries: Record<
    string,
    { total: number; perFile: Record<string, number> }
  >
): void {
  const sortedAuthors = Object.entries(authorSummaries).sort(
    (a, b) => b[1].total - a[1].total
  );

  console.log(
    colorize("\n📊 Summary of contributions across all files:", "magenta")
  );

  let rank = 1;
  for (const [author, summary] of sortedAuthors) {
    console.log(`${rank}. ${author} - ${summary.total} lines total`);
    for (const [file, lines] of Object.entries(summary.perFile)) {
      console.log(`   - ${file}: ${lines} lines`);
    }
    rank++;
  }
}

/**
 * Generate markdown for the blame results
 * @param results Results by file
 * @returns markdown string
 */
export function generateMarkdownResults(
  results: Record<string, BlameResult>
): string {
  let md = "# Git Blame Summary\n\n";

  for (const [file, result] of Object.entries(results)) {
    if (!result) continue;
    md += `## ${file}\n\n`;
    md += `- Total lines: ${result.totalLines}\n\n`;
    md += "| Author | Lines | Percent |\n";
    md += "|--------|-------|---------|\n";
    for (const { author, lines, percent } of result.contributors) {
      md += `| ${author} | ${lines} | ${percent.toFixed(1)}% |\n`;
    }
    if (result.briefOutput && result.briefOutput.length > 0) {
      md += `\n### Brief per-line authorship\n\n`;
      for (const line of result.briefOutput) {
        md += `- ${line}\n`;
      }
    }
    md += "\n";
  }

  return md;
}

/**
 * Generate markdown for the detailed summary
 * @param authorSummaries author summary object
 * @returns markdown string
 */
export function generateMarkdownSummary(
  authorSummaries: Record<
    string,
    { total: number; perFile: Record<string, number> }
  >
): string {
  let md = "# Summary of contributions across all files\n\n";

  const sortedAuthors = Object.entries(authorSummaries).sort(
    (a, b) => b[1].total - a[1].total
  );

  let rank = 1;
  for (const [author, summary] of sortedAuthors) {
    md += `## ${rank}. ${author} - ${summary.total} lines total\n\n`;
    md += "| File | Lines |\n";
    md += "|------|-------|\n";
    for (const [file, lines] of Object.entries(summary.perFile)) {
      md += `| ${file} | ${lines} |\n`;
    }
    md += "\n";
    rank++;
  }

  return md;
}
