export declare function getMajor(version: string): number;
export declare function getMinor(version: string): number;
export declare function runCommand(cmd: string): Promise<void>;
export declare function readPackageJson(): Promise<{
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
} | null>;
//# sourceMappingURL=manageUtils.d.ts.map