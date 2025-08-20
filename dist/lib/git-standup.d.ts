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
export declare function gitStandup(options: GitStandupOptions): void;
//# sourceMappingURL=git-standup.d.ts.map