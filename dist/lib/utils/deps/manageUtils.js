import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import util from "util";
const execPromise = util.promisify(exec);
/**
 * Extract the major version from a string.
 *
 * Example: "foo-bar@1.2.3" -> 1
 *
 * @param {string} version The version string
 * @returns {number} The major version number
 */
export function getMajor(version) {
    return parseInt(version.replace(/^[^\d]*/, "").split(".")[0] || "0", 10);
}
/**
 * Extract the minor version from a string.
 *
 * Example: "foo-bar@1.2.3" -> 2
 *
 * @param {string} version The version string
 * @returns {number} The minor version number
 */
export function getMinor(version) {
    return parseInt(version.replace(/^[^\d]*/, "").split(".")[1] || "0", 10);
}
/**
 * Run a shell command in the current working directory.
 *
 * @param {string} cmd The command to run
 */
export async function runCommand(cmd) {
    console.log(`> ${cmd}`);
    const { stdout, stderr } = await execPromise(cmd, { cwd: process.cwd() });
    if (stdout)
        process.stdout.write(stdout);
    if (stderr)
        process.stderr.write(stderr);
}
/**
 * Read the current working directory's `package.json` file.
 *
 * @returns The parsed JSON of the package.json file. If the file does not exist,
 * the function returns `null`.
 */
export async function readPackageJson() {
    const pkgPath = path.resolve(process.cwd(), "package.json");
    try {
        // Read the package.json file
        const raw = await fs.readFile(pkgPath, "utf8");
        // Parse the JSON
        return JSON.parse(raw);
    }
    catch {
        // If the file does not exist, log an error message
        console.error("❌ Failed to read package.json at", pkgPath, "The file may not exist.");
        // Return null
        return null;
    }
}
//# sourceMappingURL=manageUtils.js.map