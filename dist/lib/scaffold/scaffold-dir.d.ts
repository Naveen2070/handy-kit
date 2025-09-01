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
export declare const scaffoldDir: ({ entry, templateName, customFile, interactive, non_interactive, force, }: {
    entry?: string;
    templateName?: string;
    customFile?: string;
    interactive?: boolean;
    non_interactive?: boolean;
    force?: boolean;
}) => Promise<void>;
//# sourceMappingURL=scaffold-dir.d.ts.map