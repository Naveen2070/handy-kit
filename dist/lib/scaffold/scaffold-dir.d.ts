/**
 * Creates a directory structure from a template.
 * The template is a JSON object, where each key is a folder name, and the value is either
 * another JSON object (representing a subfolder) or a string (representing a file).
 * @param {Object} options - Options for creating the directory structure.
 * @param {string} [options.entry] - The folder to create the directory structure in. Defaults to "src".
 * @param {string} [options.templateName] - The name of the template to use. Defaults to "react-default".
 * @param {string} [options.customFile] - The path to a custom template file.
 */
export declare const scaffoldDir: ({ entry, templateName, customFile, }: {
    entry?: string;
    templateName?: string;
    customFile?: string;
}) => Promise<void>;
//# sourceMappingURL=scaffold-dir.d.ts.map