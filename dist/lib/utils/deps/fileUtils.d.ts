/**
 * Recursively calculates the size of a folder.
 *
 * @param folderPath - The path of the folder to calculate the size of.
 * @returns The size of the folder in bytes.
 */
export declare function getFolderSize(folderPath: string): Promise<number>;
/**
 * Reads the `package.json` file and returns its dependencies.
 * @returns An object with `dependencies` and `devDependencies` properties.
 */
export declare function getDependencies(): Promise<{
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
}>;
/**
 * Formats bytes to a human-readable string.
 *
 * @param bytes - The number of bytes to be formatted.
 * @returns A string representing the number of bytes in a human-readable format.
 */
export declare function formatSize(bytes: number): string;
//# sourceMappingURL=fileUtils.d.ts.map