/**
 * Render dependencies/devDependencies to console.
 * @param results A record with `dependencies` and `devDependencies` properties.
 *   Each property is a record of dependency names to their data objects.
 * @param flags An object with options for rendering the dependencies.
 *   Properties:
 *   - `verbose`: If true, show nested dependencies with their sizes.
 *   - `tree`: If true, show dependencies in a tree view.
 *   - `table`: If true, show dependencies in a table view.
 */
export declare function renderDeps(results: {
    dependencies: Record<string, any>;
    devDependencies: Record<string, any>;
}, flags: {
    verbose: boolean;
    tree: boolean;
    table: boolean;
}): void;
/**
 * Export dependency size results to a file in the specified format.
 * @param results An object with two properties: `dependencies` and `devDependencies`.
 * @param exportPath The path to export the results to. The file extension will be used to determine the format.
 * @param flags Options for exporting the results.
 *   Properties:
 *   - `table`: If true, export results in a table format.
 */
export declare function exportResults(results: {
    dependencies: Record<string, any>;
    devDependencies: Record<string, any>;
}, exportPath: string, flags?: {
    table?: boolean;
}): Promise<void>;
//# sourceMappingURL=render.d.ts.map