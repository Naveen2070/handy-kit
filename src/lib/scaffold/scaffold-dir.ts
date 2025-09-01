import { askUser } from "../utils/common/index.js";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { fileURLToPath } from "url";
import {
  createFoldersFromTemplate,
  runInteractiveWizard,
} from "../utils/scaffold/index.js";

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
 * @param {boolean} [options.interactive] - Whether to use interactive mode.
 */
export const scaffoldDir = async ({
  entry,
  templateName,
  customFile,
  interactive = false,
}: {
  entry?: string;
  templateName?: string;
  customFile?: string;
  interactive?: boolean;
}) => {
  if (!entry) {
    entry = (await askUser("Enter entry folder (default 'src'): ")) || "src";
  }

  let template: Record<string, any>;

  const defaultTemplateDir = path.resolve(
    __dirname,
    "../../assets/templates/dir"
  );
  const userTemplateDir = path.resolve(
    os.homedir(),
    ".scaffold-cli/templates/dir"
  );

  await fs.mkdir(userTemplateDir, { recursive: true });

  if (interactive) {
    // 👨‍🎨 Interactive flow
    template = await runInteractiveWizard();

    const save = await askUser(
      "Save this structure as a reusable template? [y/N]: "
    );
    if (["y", "yes"].includes(save.toLowerCase())) {
      const name = await askUser("Enter template name (e.g. my-template): ");
      const savePath = path.resolve(userTemplateDir, `${name}.json`);
      await fs.writeFile(savePath, JSON.stringify(template, null, 2), "utf8");
      console.log(`✅ Template saved at ${savePath}`);
    }
  } else if (customFile) {
    // 📄 Load from custom file
    try {
      const fileContent = await fs.readFile(path.resolve(customFile), "utf-8");
      template = JSON.parse(fileContent);
    } catch (err) {
      console.error("❌ Error reading custom template:", err);
      return;
    }
  } else {
    // 📦 Select from templates (default + user + interactive)
    const [defaultTemplates, userTemplates] = await Promise.all([
      fs.readdir(defaultTemplateDir),
      fs.readdir(userTemplateDir),
    ]);

    const allTemplates = [
      ...defaultTemplates.map((name) => ({
        name,
        type: "default",
        path: path.join(defaultTemplateDir, name),
      })),
      ...userTemplates.map((name) => ({
        name,
        type: "user",
        path: path.join(userTemplateDir, name),
      })),
    ];

    const templateOptions = [
      ...allTemplates.map((t, i) => ({
        label: `${i + 1}. ${
          t.type === "user" ? "📦 user" : "📦 default"
        } - ${t.name.replace(".json", "")}`,
        value: t.name.replace(".json", ""),
        index: i,
      })),
      {
        label: `${
          allTemplates.length + 1
        }. 🎨 interactive - create from scratch`,
        value: "interactive",
        index: allTemplates.length,
      },
    ];

    if (!templateName) {
      const selection = await askUser(
        `Choose one of the following templates:\n${templateOptions
          .map((opt) => opt.label)
          .join("\n")}\nEnter template number or name: `
      );

      const selectedByIndex = parseInt(selection);
      const selectedTemplate =
        templateOptions.find((opt) => opt.value === selection) ||
        templateOptions.find((opt) => opt.index === selectedByIndex - 1);

      if (!selectedTemplate) {
        console.error("❌ Invalid selection.");
        return;
      }

      if (selectedTemplate.value === "interactive") {
        interactive = true;
        template = await runInteractiveWizard();

        const save = await askUser(
          "Save this structure as a reusable template? [y/N]: "
        );
        if (["y", "yes"].includes(save.toLowerCase())) {
          const name = await askUser(
            "Enter template name (e.g. my-template): "
          );
          const savePath = path.resolve(userTemplateDir, `${name}.json`);
          await fs.writeFile(
            savePath,
            JSON.stringify(template, null, 2),
            "utf8"
          );
          console.log(`✅ Template saved at ${savePath}`);
        }
      } else {
        try {
          const fileContent = await fs.readFile(
            allTemplates[selectedTemplate.index]!.path,
            "utf-8"
          );
          template = JSON.parse(fileContent);
        } catch (err) {
          console.error("❌ Error reading template:", err);
          return;
        }
      }
    } else {
      const selectedTemplate = allTemplates.find(
        (t) => t.name.replace(".json", "") === templateName
      );

      if (!selectedTemplate) {
        console.error("❌ Template not found:", templateName);
        return;
      }

      try {
        const fileContent = await fs.readFile(selectedTemplate.path, "utf-8");
        template = JSON.parse(fileContent);
      } catch (err) {
        console.error("❌ Error reading template:", err);
        return;
      }
    }
  }

  // 🪟 Preview
  function preview(templateObj: Record<string, any>, indent = 0) {
    const indentStr = "  ".repeat(indent);

    for (const key of Object.keys(templateObj)) {
      if (key === "files") {
        const files = templateObj[key];
        if (Array.isArray(files.paths)) {
          for (const fullPath of files.paths) {
            const fileName = path.basename(fullPath);
            console.log(`${indentStr}📄 ${fileName} (copied from ${fullPath})`);
          }
        }

        for (const fileName of Object.keys(files)) {
          if (fileName === "paths") continue;
          const file = files[fileName];
          const ext = file.type ? `.${file.type}` : "";
          console.log(`${indentStr}📄 ${fileName}${ext}`);
        }
      } else if (key === "paths") {
        const paths = templateObj[key];
        for (const filePath of paths) {
          const fileName = path.basename(filePath);
          console.log(`${indentStr}📄 ${fileName} (top-level path)`);
        }
      } else {
        const value = templateObj[key];
        const hasFiles =
          typeof value === "object" &&
          (value.files || value.paths || Object.keys(value).length > 0);
        const icon = hasFiles ? "📂" : "📁";
        console.log(`${indentStr}${icon} ${key}/`);
        if (typeof value === "object") preview(value, indent + 1);
      }
    }
  }

  console.log("\n🪟 Folder structure preview:");
  preview(template);
  console.log(
    `\nWill be created under: '${path.resolve(process.cwd(), entry)}'\n`
  );

  const confirm = await askUser("Do you want to proceed? [y/N]: ");
  if (!["y", "yes"].includes(confirm.toLowerCase())) {
    console.log("❌ Aborted by user.");
    return;
  }

  try {
    await createFoldersFromTemplate(
      template,
      path.resolve(process.cwd(), entry)
    );
    console.log(
      `✅ Folder structure created at '${path.resolve(process.cwd(), entry)}'`
    );
  } catch (err) {
    console.error("❌ Error creating folders:", err);
  }
};
