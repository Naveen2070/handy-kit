import type { BlameResult, Contributor } from "../../types/utils.js";
/**
 * Returns a list of files to analyze.
 * If a file flag is provided, only that file is analyzed.
 * Otherwise, all files in the repository are analyzed.
 * @param fileFlag {string} optional, file to analyze
 * @returns {string[]} list of files to analyze
 */
export declare function getFilesToAnalyze(fileFlag?: string): string[];
/**
 * Parse the output of `git blame --porcelain` into a mapping of authors to the number of lines they contributed.
 * @param blameOutput {string} output of `git blame --porcelain`
 * @param brief {boolean} whether to generate brief output
 * @returns {authors: Record<string, number>, briefOutput?: string[]} mapping of authors to number of lines and optional brief output
 */
export declare function parseBlameOutput(blameOutput: string, brief: boolean): {
    authors: Record<string, number>;
    briefOutput?: string[];
};
/**
 * Format the output of the blame summary (console)
 * @param file {string} file analyzed
 * @param total {number} total lines in the file
 * @param contributors {Contributor[]} contributors to the file
 * @param briefOutput {string[]} optional brief output of per-line authorship
 * @param outputJSON {boolean} whether to output in JSON format
 */
export declare function formatOutput(file: string, total: number, contributors: Contributor[], briefOutput: string[] | undefined, outputJSON: boolean): void;
/**
 * Format the detailed summary output (console)
 * @param authorSummaries {Record<string, {total: number, perFile: Record<string, number>}>}
 */
export declare function formatDetailedSummaryOutput(authorSummaries: Record<string, {
    total: number;
    perFile: Record<string, number>;
}>): void;
/**
 * Generate markdown for the blame results
 * @param results Results by file
 * @returns markdown string
 */
export declare function generateMarkdownResults(results: Record<string, BlameResult>): string;
/**
 * Generate markdown for the detailed summary
 * @param authorSummaries author summary object
 * @returns markdown string
 */
export declare function generateMarkdownSummary(authorSummaries: Record<string, {
    total: number;
    perFile: Record<string, number>;
}>): string;
//# sourceMappingURL=blameUtils.d.ts.map