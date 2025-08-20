import type { TemplateContext, Templates } from "../types/utils.js";
/**
 * Prints the main help message.
 */
export declare function printHelp(): void;
/**
 * Prints a template with optional context.
 * @param path The path to the template string. This can be a dot-separated path
 *   into the templates object, or a string that exactly matches a key in the
 *   templates object.
 * @param context An optional object containing values to replace placeholders in
 *   the template string. If a key is not present in the context object, the
 *   placeholder will be left unchanged.
 */
export declare function printTemplate(path: keyof Templates | string, context?: TemplateContext): void;
//# sourceMappingURL=templates.d.ts.map