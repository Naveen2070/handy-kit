export interface Command {
  name: string;
  description: string;
  usage: string;
  run: (args: string[], flags: Flags) => void;
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
