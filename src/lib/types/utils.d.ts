export interface Command {
  name: string;
  description: string;
  usage: string;
  run: (args: string[], flags: Record<string, string>) => void;
}

export interface CommandGroup {
  name: string;
  description: string;
  subcommands: Command[];
}

export interface Flags {
  [key: string]: string;
}

export interface ParsedArgs {
  positional: string[];
  flags: Flags;
}

export interface Templates {
  help: {
    main: string;
  };
  errors: {
    unknownCommand: string;
    missingLicenseArgs: string;
    invalidDays: string;
  };
}

export interface TemplateContext {
  command?: string;
  commands?: Command[];
  [key: string]: any;
}

export interface GitStandupOptions {
  days?: number;
  weeks?: number;
  months?: number;
  years?: number;
  author?: string;
  branch?: string;
  exportPath?: string;
}

export type DepsSizeFlag = {
  verbose: boolean;
  tree: boolean;
  export: string;
  table: boolean;
  depth: number;
  concurrency: number;
};

export type DependencyInfo = {
  current: string;
  wanted: string;
  latest: string;
  location?: string;
  "depended by"?: string;
  type?: string;
};
