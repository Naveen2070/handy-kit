import type { Flags, ParsedArgs } from "../types/utils.js";

export function parseArgs(argv: string[]): ParsedArgs {
  if (!Array.isArray(argv)) {
    throw new TypeError("parseArgs() expects an array of strings");
  }

  const positional: string[] = [];
  const flags: Flags = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg) {
      throw new TypeError("parseArgs() expects an array of non-empty strings");
    }

    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const value =
        argv[i + 1] && !argv[i + 1]!.startsWith("--") ? argv[++i] : "true";
      flags[key] = value!;
    } else if (arg === "") {
      throw new TypeError("parseArgs() expects an array of non-empty strings");
    } else {
      positional.push(arg);
    }
  }

  return { positional, flags };
}
