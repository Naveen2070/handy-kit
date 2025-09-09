/**
 * @function gitReview
 * @description Shows a pre-PR review summary: branch info, unpushed commits, staged files, and a diff preview.
 * @param _ ignored
 * @param flags flags passed to the command
 * @option --export [path] export the report to a markdown file. If not specified, the report is printed to the console.
 * @option --format [json|md] format to export the report in. Defaults to markdown.
 * @option --no-emoji removes emojis from the report.
 * @option --summary shows only the summary (branch info, unpushed commits, and staged files).
 * @option --timestamp adds a timestamp to the exported filename.
 */
export declare function gitReview(_: string[], flags?: Record<string, any>): void;
//# sourceMappingURL=git-review.d.ts.map