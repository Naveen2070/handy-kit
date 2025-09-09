type TemplateNode = {
    files?: Record<string, {
        content?: string;
        type?: string;
    }>;
    [folderName: string]: any;
};
/**
 * Runs an interactive wizard to create a folder structure.
 * The wizard asks the user to create directories or files,
 * and to enter the content of the files.
 * The user can quit at any level.
 * @return The created folder structure as a JSON object.
 */
export declare function runInteractiveWizard(): Promise<TemplateNode>;
export {};
//# sourceMappingURL=interactive-wizard.d.ts.map