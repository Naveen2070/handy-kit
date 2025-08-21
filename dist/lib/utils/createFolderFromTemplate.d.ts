/**
 * Creates a folder structure from a template.
 * The template is a JSON object, where each key is a folder name, and the value is either
 * another JSON object (representing a subfolder) or a string (representing a file).
 * @param template The template to create the folder structure from.
 * @param entryPath The path where the folder structure will be created.
 */
export declare function createFoldersFromTemplate(template: Record<string, any>, entryPath: string): Promise<void>;
//# sourceMappingURL=createFolderFromTemplate.d.ts.map