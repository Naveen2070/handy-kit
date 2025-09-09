type ExportData = Record<string, any>;
/**
 * Exports the report to a file in the specified format.
 *
 * @param stats - A JSON object with the report data.
 * @param flags - An object with the following properties:
 *   - `export`: The format to export the report in (json, txt, or md).
 * @param contributors - A Set containing the contributors to the report.
 */
export declare function exportReport(stats: ExportData, flags: Record<string, any>, contributors: Set<string>): void;
export {};
//# sourceMappingURL=exportReport.d.ts.map