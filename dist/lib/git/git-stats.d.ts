type Flags = {
    since?: string;
    author?: string;
    daily?: boolean;
    weekly?: boolean;
    monthly?: boolean;
    export?: "json" | "md" | "txt";
};
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
export declare function gitStats(flags: Flags): Promise<void>;
export {};
//# sourceMappingURL=git-stats.d.ts.map