import type { ParsedArgs } from "../types/utils.js";
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
export declare function parseArgs(argv: string[]): ParsedArgs;
//# sourceMappingURL=args.d.ts.map