import type { TemplateContext, Templates } from "../types/utils.js";
import templates from "./templates.json" with { type: "json" };

export function printHelp() {
  printTemplate("help.main");
}

export function printTemplate(path: keyof Templates | string, context: TemplateContext = {}) {
  const msg = getTemplate(path);
  console.log(applyContext(msg, context));
}

function getTemplate(path: keyof Templates | string): string {
  const parts = path.split(".");
  let obj: unknown = templates as Templates;
  for (const p of parts) {
    if (typeof obj === "object" && obj !== null && p in obj) {
      obj = (obj as Record<string, unknown>)[p];
    } else {
      throw new Error(`Template not found: ${path}`);
    }
  }
  if (typeof obj !== "string") throw new Error(`Invalid template type at: ${path}`);
  return obj;
}

function applyContext(template: string, context: TemplateContext): string {
  return template.replace(/{{(\w+)}}/g, (_, key) => {
    if (key === "commands" && Array.isArray(context.commands)) {
      return context.commands
        .map((c) => `  ${c.name}  ${c.usage}`)
        .join("\n");
    }
    return String(context[key] ?? "");
  });
}