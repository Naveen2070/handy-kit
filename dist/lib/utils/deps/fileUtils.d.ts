export declare function getFolderSize(folderPath: string): Promise<number>;
export declare function getDependencies(): Promise<{
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
}>;
export declare function formatSize(bytes: number): string;
//# sourceMappingURL=fileUtils.d.ts.map