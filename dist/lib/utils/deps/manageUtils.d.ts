/**
 * Extract the major version from a string.
 *
 * Example: "foo-bar@1.2.3" -> 1
 *
 * @param {string} version The version string
 * @returns {number} The major version number
 */
export declare function getMajor(version: string): number;
/**
 * Extract the minor version from a string.
 *
 * Example: "foo-bar@1.2.3" -> 2
 *
 * @param {string} version The version string
 * @returns {number} The minor version number
 */
export declare function getMinor(version: string): number;
/**
 * Run a shell command in the current working directory.
 *
 * @param {string} cmd The command to run
 */
export declare function runCommand(cmd: string): Promise<void>;
/**
 * Read the current working directory's `package.json` file.
 *
 * @returns The parsed JSON of the package.json file. If the file does not exist,
 * the function returns `null`.
 */
export declare function readPackageJson(): Promise<{
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
} | null>;
//# sourceMappingURL=manageUtils.d.ts.map