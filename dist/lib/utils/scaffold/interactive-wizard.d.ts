type TemplateNode = {
    files?: Record<string, {
        content?: string;
        type?: string;
    }>;
    [folderName: string]: any;
};
export declare function runInteractiveWizard(): Promise<TemplateNode>;
export {};
//# sourceMappingURL=interactive-wizard.d.ts.map