import { askUser } from "../common/askUser.js";

type TemplateNode = {
  files?: Record<string, { content?: string; type?: string }>;
  [folderName: string]: any;
};

export async function runInteractiveWizard(): Promise<TemplateNode> {
  const root: TemplateNode = {};

  async function addItems(current: TemplateNode, level = 0) {
    while (true) {
      const indent = "  ".repeat(level);
      const type = await askUser(
        `${indent}Add (f)ile, (d)irectory or (q)uit this level: `
      );

      if (!type || type.toLowerCase() === "q") break;

      if (type.toLowerCase() === "d") {
        const dirName = await askUser(`${indent}Enter directory name: `);
        if (!dirName) continue;
        current[dirName] = {};
        await addItems(current[dirName], level + 1);
      } else if (type.toLowerCase() === "f") {
        const fileName = await askUser(
          `${indent}Enter file name (without extension): `
        );
        const fileType = await askUser(
          `${indent}Enter file extension (e.g. js, ts): `
        );
        const content = await askUser(
          `${indent}Enter file content (or leave blank): `
        );

        if (!current.files) current.files = {};
        current.files[fileName] = {
          type: fileType || "txt",
          content: content || "",
        };
      } else {
        console.log(`${indent}Invalid option. Use 'f', 'd', or 'q'.`);
      }
    }
  }

  console.log("📁 Starting folder structure creation...");
  await addItems(root);
  return root;
}
