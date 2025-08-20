import * as fs from "fs/promises";
import * as path from "path";
import * as readline from "readline";
import { fileURLToPath } from "url";
import { printTemplate } from "./utils/templates.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
function askUser(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) => rl.question(question, (ans) => {
        rl.close();
        resolve(ans.trim());
    }));
}
const SUPPORTED_LICENSES = [
    "mit",
    "apache-2.0",
    "bsd-3-clause",
    "gpl-3.0",
    "mpl-2.0",
    "unlicense",
];
export async function licenseGen(type, author, outputPath = "LICENSE") {
    const year = new Date().getFullYear();
    const templateDir = path.resolve(__dirname, "../assets/templates/licenses");
    const licenseFile = path.join(templateDir, `${type.toLowerCase()}.txt`);
    if (!SUPPORTED_LICENSES.includes(type.toLowerCase())) {
        printTemplate("errors.unsupportedLicense", { type });
        return;
    }
    try {
        await fs.access(licenseFile);
    }
    catch {
        console.log(`❌ License file '${licenseFile}' not found.`);
        return;
    }
    let content = await fs.readFile(licenseFile, "utf-8");
    content = content
        .replace(/{{year}}/g, String(year))
        .replace(/{{author}}/g, author);
    try {
        // check if output file already exists
        await fs.access(outputPath);
        console.log(`⚠️ File '${outputPath}' already exists.`);
        const ans = await askUser("Do you want to [r]eplace, [n]ew filename, or [c]ancel? ");
        if (ans.toLowerCase() === "c") {
            console.log("❌ Cancelled.");
            return;
        }
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
        if (ans.toLowerCase() === "r") {
            await fs.writeFile(outputPath, content);
            printTemplate("success.licenseReplaced", { type, author, outputPath });
            return;
        }
        console.log("❌ Invalid option. Aborting.");
        return;
    }
    catch {
        // File does not exist
        await fs.writeFile(outputPath, content);
        printTemplate("success.licenseGen", { type, author, outputPath });
    }
}
//# sourceMappingURL=license-gen.js.map