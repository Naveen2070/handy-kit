import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";
import { printTemplate } from "../utils/index.js";
import { askUser } from "../utils/index.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SUPPORTED_LICENSES = [
    "mit",
    "apache-2.0",
    "bsd-3-clause",
    "gpl-3.0",
    "mpl-2.0",
    "unlicense",
];
/**
 * Generates a license file based on the given type and author.
 * If the output file already exists, it will ask the user if they want to
 * replace the file, use a new filename, or cancel the operation.
 *
 * @param type The type of license to generate. Supported types are:
 *   - MIT
 *   - Apache-2.0
 *   - BSD-3-Clause
 *   - GPL-3.0
 *   - MPL-2.0
 *   - Unlicense
 * @param author The author of the project.
 * @param outputPath The path to write the license file to. Defaults to "LICENSE".
 * @param force If true, will overwrite the output file if it already exists.
 */
export async function licenseGen(type, author, outputPath = "LICENSE", force = false) {
    const year = new Date().getFullYear();
    const templateDir = path.resolve(__dirname, "../../assets/templates/licenses");
    const licenseFile = path.join(templateDir, `${type.toLowerCase()}.txt`);
    // check if license type is supported
    if (!SUPPORTED_LICENSES.includes(type.toLowerCase())) {
        printTemplate("errors.unsupportedLicense", { type });
        return;
    }
    // check if license file exists
    try {
        await fs.access(licenseFile);
    }
    catch {
        console.log(`❌ License file '${licenseFile}' not found.`);
        return;
    }
    // read license file and replace placeholders
    let content = await fs.readFile(licenseFile, "utf-8");
    content = content
        .replace(/{{year}}/g, String(year))
        .replace(/{{author}}/g, author);
    try {
        if (force) {
            await fs.writeFile(outputPath, content);
            printTemplate("success.licenseReplaced", { type, author, outputPath });
            return;
        }
        // check if output file already exists and ask user what to do
        await fs.access(outputPath);
        console.log(`⚠️ File '${outputPath}' already exists.`);
        // ask user what to do
        const ans = await askUser("Do you want to [r]eplace, [n]ew filename, or [c]ancel? ");
        // if user cancels, exit
        if (ans.toLowerCase() === "c") {
            console.log("❌ Cancelled.");
            return;
        }
        // if user wants to replace, replace file
        if (ans.toLowerCase() === "n") {
            const newName = await askUser("Enter new filename: ");
            await fs.writeFile(newName, content);
            printTemplate("success.licenseCreated", {
                type,
                author,
                outputPath: newName,
            });
            return;
        }
        // if user wants to replace, replace file
        if (ans.toLowerCase() === "r") {
            await fs.writeFile(outputPath, content);
            printTemplate("success.licenseReplaced", { type, author, outputPath });
            return;
        }
        console.log("❌ Invalid option. Aborting.");
        return;
    }
    catch {
        // File does not exist so create it
        await fs.writeFile(outputPath, content);
        printTemplate("success.licenseGen", { type, author, outputPath });
    }
}
//# sourceMappingURL=license-gen.js.map