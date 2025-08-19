import templates from "./templates.json" with { type: "json" };
export function printHelp() {
    printTemplate("help.main");
}
export function printTemplate(path, context = {}) {
    const msg = getTemplate(path);
    console.log(applyContext(msg, context));
}
function getTemplate(path) {
    const parts = path.split(".");
    let obj = templates;
    for (const p of parts) {
        if (typeof obj === "object" && obj !== null && p in obj) {
            obj = obj[p];
        }
        else {
            throw new Error(`Template not found: ${path}`);
        }
    }
    if (typeof obj !== "string")
        throw new Error(`Invalid template type at: ${path}`);
    return obj;
}
function applyContext(template, context) {
    return template.replace(/{{(\w+)}}/g, (_, key) => {
        if (key === "commands" && Array.isArray(context.commands)) {
            return context.commands
                .map((c) => `  ${c.name}  ${c.usage}`)
                .join("\n");
        }
        return String(context[key] ?? "");
    });
}
//# sourceMappingURL=templates.js.map