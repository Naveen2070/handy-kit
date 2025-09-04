export declare function renderDeps(results: {
    dependencies: Record<string, any>;
    devDependencies: Record<string, any>;
}, flags: {
    verbose: boolean;
    tree: boolean;
    table: boolean;
}): void;
export declare function exportResults(results: {
    dependencies: Record<string, any>;
    devDependencies: Record<string, any>;
}, exportPath: string, flags?: {
    table?: boolean;
}): Promise<void>;
//# sourceMappingURL=render.d.ts.map