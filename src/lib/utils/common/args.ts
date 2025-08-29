import type { Flags, ParsedArgs } from "../../types/utils.js";

/**
 * Parse command line arguments into a ParsedArgs object.
 *
 * @param {string[]} argv Array of command line arguments.
 * @returns {ParsedArgs} Parsed command line arguments.
 *
 * @example
 * const argv = ["--foo", "bar", "-x", "y", "z"];
 * const parsed = parseArgs(argv);
 * // parsed = {
 * //   positional: ["z"],
 * //   flags: {
 * //     foo: "bar",
 * //     x: "y",
 * //   },
 * // };
 */
export function parseArgs(argv: string[]): ParsedArgs {
  // Validate arguments
  if (!Array.isArray(argv)) {
    throw new TypeError("parseArgs() expects an array of strings");
  }

  // initialize positional and flags
  const positional: string[] = [];
  const flags: Flags = {};

  // loop through arguments
  for (let i = 0; i < argv.length; i++) {
    // validate argument
    const arg = argv[i];
    if (!arg) {
      throw new TypeError("parseArgs() expects an array of non-empty strings");
    }

    // parse argument and add to positional or flags
    // if argument is a long flag add to flags
    if (arg.startsWith("--")) {
      const [key, inlineValue] = arg.slice(2).split("=");
      const value =
        inlineValue ??
        (argv[i + 1] && !argv[i + 1]!.startsWith("-") ? argv[++i] : "true");
      flags[key!] = value!;

      // if argument is a short flag add to flags
    } else if (arg.startsWith("-") && arg.length > 1) {
      const chars = arg.slice(1).split("");
      if (chars.length > 1) {
        for (const c of chars) {
          flags[c] = "true";
        }
      } else {
        const key = chars[0]!;
        const value =
          argv[i + 1] && !argv[i + 1]!.startsWith("-") ? argv[++i] : "true";
        flags[key] = value!;
      }
      // if argument is not a flag add to positional
    } else {
      positional.push(arg);
    }
  }

  return { positional, flags };
}
