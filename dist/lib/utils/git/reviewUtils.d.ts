/**
 * Get the current branch and tracking information.
 *
 * @returns An object containing the branch and tracking information.
 */
export declare function getBranchInfo(): {
    branch: string;
    tracking: string;
};
/**
 * Get the commits that are not pushed to the remote branch.
 *
 * @param tracking The remote branch that is being tracked.
 * @returns A string containing the commits that are not pushed to the remote branch.
 */
export declare function getUnpushedCommits(tracking: string): string;
/**
 * Get the list of staged files.
 *
 * @returns A string containing the list of staged files, separated by newlines.
 */
export declare function getStagedFiles(): string;
/**
 * Get a preview of the staged changes.
 *
 * @returns An object containing the diff preview, a boolean indicating if the diff was truncated, and the total number of lines in the diff.
 */
export declare function getDiffPreview(): {
    preview: string;
    truncated: boolean;
    total: number;
};
/**
 * Exports the review summary to a markdown file.
 *
 * @param filePath The path to the markdown file to write.
 * @param data The data to write to the markdown file.
 * @param noEmoji If true, the emoji characters will be replaced with their fallback strings.
 */
export declare function exportMarkdown(filePath: string, data: {
    branch: string;
    tracking: string;
    unpushed: string;
    staged: string;
    diff: string;
    truncated: boolean;
    diffLines: number;
}, noEmoji?: boolean): void;
//# sourceMappingURL=reviewUtils.d.ts.map