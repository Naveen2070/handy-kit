import { askUser } from "../utils/index.js";
import * as fs from "fs/promises";
import * as path from "path";
import { createFoldersFromTemplate } from "../utils/index.js";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * Creates a directory structure from a template.
 * The template is a JSON object, where each key is a folder name, and the value is either
 * another JSON object (representing a subfolder) or a string (representing a file).
 * @param {Object} options - Options for creating the directory structure.
 * @param {string} [options.entry] - The folder to create the directory structure in. Defaults to "src".
 * @param {string} [options.templateName] - The name of the template to use. Defaults to "react-default".
 * @param {string} [options.customFile] - The path to a custom template file.
 */
export const scaffoldDir = async ({ entry, templateName, customFile, }) => {
    // Get the entry folder
    if (!entry) {
        entry = (await askUser("Enter entry folder (default 'src'): ")) || "src";
    }
    // Get the template
    const templateDir = path.resolve(__dirname, "../../assets/templates/dir");
    let template;
    // Read custom template
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
        // Read template from assets/templates/dir
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
    // Preview the folder structure
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
    console.log(`\nWill be created under: '${path.resolve(process.cwd(), entry)}'\n`);
    const confirm = await askUser("Do you want to proceed? [y/N]: ");
    if (!["y", "yes"].includes(confirm.toLowerCase())) {
        console.log("❌ Aborted by user.");
        return;
    }
    try {
        await createFoldersFromTemplate(template, path.resolve(process.cwd(), entry));
        console.log(`✅ Folder structure created at '${path.resolve(process.cwd(), entry)}'`);
    }
    catch (err) {
        console.error("❌ Error creating folders:", err);
    }
};
//# sourceMappingURL=scaffold-dir.js.map