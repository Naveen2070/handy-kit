import { askUser } from "../utils/index.js";
import * as fs from "fs/promises";
import * as path from "path";
import { createFoldersFromTemplate } from "../utils/index.js";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const scaffoldDir = async ({ entry, templateName, customFile, }) => {
    if (!entry) {
        entry = (await askUser("Enter entry folder (default 'src'): ")) || "src";
    }
    const entryPath = path.resolve(process.cwd(), entry);
    const templateDir = path.resolve(__dirname, "../../assets/templates/dir");
    let template;
    if (customFile) {
        try {
            const fileContent = await fs.readFile(path.resolve(customFile), "utf-8");
            template = JSON.parse(fileContent);
        }
        catch (err) {
            console.error("❌ Error reading custom template:", err);
            return;
        }
    }
    else {
        if (!templateName) {
            templateName = await askUser(`Choose one of the following templates: 
      \n react-default(default) 
      \n Enter template name: `);
        }
        templateName = templateName || "react-default";
        try {
            const fileContent = await fs.readFile(path.resolve(templateDir, `${templateName}.json`), "utf-8");
            template = JSON.parse(fileContent);
        }
        catch (err) {
            console.error("❌ Error reading template:", err);
            return;
        }
    }
    // --- Preview step ---
    function preview(templateObj, indent = 0) {
        for (const key of Object.keys(templateObj)) {
            console.log(`${"  ".repeat(indent)}- ${key}/`);
            if (typeof templateObj[key] === "object") {
                preview(templateObj[key], indent + 1);
            }
        }
    }
    console.log("\n📁 Folder structure preview:");
    preview(template);
    console.log(`\nWill be created under: '${entryPath}'\n`);
    const confirm = await askUser("Do you want to proceed? [y/N]: ");
    if (!["y", "yes"].includes(confirm.toLowerCase())) {
        console.log("❌ Aborted by user.");
        return;
    }
    try {
        await createFoldersFromTemplate(template, entryPath);
        console.log(`✅ Folder structure created at '${entryPath}'`);
    }
    catch (err) {
        console.error("❌ Error creating folders:", err);
    }
};
//# sourceMappingURL=scaffold-dir.js.map