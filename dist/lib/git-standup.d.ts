interface GitStandupOptions {
    days?: number | undefined;
    weeks?: number | undefined;
    months?: number | undefined;
    years?: number | undefined;
    author?: string | undefined;
    branch?: string | undefined;
    exportPath?: string | undefined;
}
export declare function gitStandup(options: GitStandupOptions): void;
export {};
//# sourceMappingURL=git-standup.d.ts.map