import { TEMPLATES } from "./templates.def.js";
/**
 * Prints the main help message.
 */
export function printHelp() {
    printTemplate("help.main");
}
/**
 * Prints a template with optional context.
 * @param path The path to the template string. This can be a dot-separated path
 *   into the templates object, or a string that exactly matches a key in the
 *   templates object.
 * @param context An optional object containing values to replace placeholders in
 *   the template string. If a key is not present in the context object, the
 *   placeholder will be left unchanged.
 */
export function printTemplate(path, context = {}) {
    const msg = getTemplate(path);
    console.log(applyContext(msg, context));
}
/**
 * Retrieves a template string from the templates object.
 * @param path A dot-separated path into the templates object, or a string that
 *   exactly matches a key in the templates object.
 * @returns The template string, or throws an error if the template is not
 *   found. If the template is found but is not a string, also throws an error.
 * @throws {Error} If the template is not found, or if the value at the path is
 *   not a string.
 */
function getTemplate(path) {
    // check if path is a key in the templates object
    const parts = path.split(".");
    // get the value at the path
    let obj = TEMPLATES;
    //loop through the parts of the path
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
/**
 * Replaces placeholders in a template string with values from a context object.
 * Placeholders are strings in the format `{{key}}`, where `key` is a key in the
 * context object. If the key is not present in the context object, the
 * placeholder is left unchanged.
 * @param template The template string to apply the context to.
 * @param context The object containing values to replace placeholders in the
 *   template string. If a key is not present in the context object, the
 *   placeholder will be left unchanged.
 * @returns The template string with placeholders replaced.
 */
function applyContext(template, context) {
    // replace placeholders in the template string with values from the context object and commands
    return template.replace(/{{(\w+)}}/g, (_, key) => {
        if (key === "commands" && Array.isArray(context.commands)) {
            return context.commands.map((c) => `  ${c.name}  ${c.usage}`).join("\n");
        }
        return String(context[key] ?? "");
    });
}
//# sourceMappingURL=templates.js.map