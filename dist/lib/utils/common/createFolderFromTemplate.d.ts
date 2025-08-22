/**
 * Creates a folder structure from a schema.
 * - Supports nested folders.
 * - Creates files with content.
 * - Copies files from given source paths if "paths" is defined inside "files".
 *
 * @param template The template schema for the folder structure.
 * @param entryPath The root directory where the structure should be created.
 */
export declare function createFoldersFromTemplate(template: Record<string, any>, entryPath: string): Promise<void>;
//# sourceMappingURL=createFolderFromTemplate.d.ts.map