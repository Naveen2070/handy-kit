import * as fs from "fs/promises";
import * as path from "path";
import * as readline from "readline";
import { fileURLToPath } from "url";
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
export async function licenseGen(type, author, outputPath = "LICENSE") {
    const year = new Date().getFullYear();
    const templateDir = path.resolve(__dirname, "../templates/licenses");
    const licenseFile = path.join(templateDir, `${type.toLowerCase()}.txt`);
    try {
        await fs.access(licenseFile);
    }
    catch {
        console.error(`❌ License type '${type}' not supported. Try: MIT, Apache-2.0`);
        return;
    }
    let content = await fs.readFile(licenseFile, "utf-8");
    content = content
        .replace(/{{year}}/g, String(year))
        .replace(/{{author}}/g, author);
    try {
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
            console.log(`✅ License saved as '${newName}'`);
            return;
        }
        if (ans.toLowerCase() === "r") {
            await fs.writeFile(outputPath, content);
            console.log(`✅ License overwritten at '${outputPath}'`);
            return;
        }
        console.log("❌ Invalid option. Aborting.");
        return;
    }
    catch {
        // File does not exist
        await fs.writeFile(outputPath, content);
        console.log(`✅ License generated at '${outputPath}'`);
    }
}
//# sourceMappingURL=license-gen.js.map