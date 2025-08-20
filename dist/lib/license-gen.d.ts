/**
 * Generates a license file based on the given type and author.
 * If the output file already exists, it will ask the user if they want to
 * replace the file, use a new filename, or cancel the operation.
 *
 * @param type The type of license to generate. Supported types are:
 *   - MIT
 *   - Apache-2.0
 *   - BSD-3-Clause
 *   - GPL-3.0
 *   - MPL-2.0
 *   - Unlicense
 * @param author The author of the project.
 * @param outputPath The path to write the license file to. Defaults to "LICENSE".
 * @param force If true, will overwrite the output file if it already exists.
 */
export declare function licenseGen(type: string, author: string, outputPath?: string, force?: boolean): Promise<void>;
//# sourceMappingURL=license-gen.d.ts.map