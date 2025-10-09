/**
 * Finds hot paths in a codebase based on import count and commit count.
 *
 * Hot paths are files that are highly dependent on by other files in the codebase.
 * The hotness score of a file is computed by summing the weighted import count and commit count.
 * The import count is the number of files that import the file, while the commit count is the number
 * of commits that have changed the file. The depth of a file is also taken into account when
 * computing the hotness score.
 *
 * @param {string} rootDir The directory to scan for hot paths.
 * @param {Object} [options] Optional options to control the output.
 * @property {number} [options.top] The top N files to show. If not specified, shows the top 20 files.
 * @property {boolean} [options.all] Whether to show all files or only the top N. If not specified, shows only the top N files.
 * @property {number} [options.importWeight] The weight to give to imports when computing the hotness score. Defaults to 0.7.
 * @property {number} [options.commitWeight] The weight to give to commits when computing the hotness score. Defaults to 0.3.
 */
export declare function findHotPaths(rootDir: string, options?: {
    /**
     * The top N files to show. If not specified, shows the top 20 files.
     */
    top?: number;
    /**
     * Whether to show all files or only the top N. If not specified, shows only the top N files.
     */
    all?: boolean;
    /**
     * The weight to give to imports when computing the hotness score. Defaults to 0.7.
     */
    importWeight?: number;
    /**
     * The weight to give to commits when computing the hotness score. Defaults to 0.3.
     */
    commitWeight?: number;
}): void;
//# sourceMappingURL=code-hotpaths.d.ts.map