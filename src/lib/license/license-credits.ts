import fs from "fs/promises";
import path from "path";
import { printTemplate } from "../utils/common/index.js";

interface PackageInfo {
  name: string;
  version: string;
  license?: string;
  homepage?: string;
}

const LICENSE_URLS: Record<string, string> = {
  mit: "https://opensource.org/licenses/MIT",
  "apache-2.0": "https://www.apache.org/licenses/LICENSE-2.0",
  "bsd-3-clause": "https://opensource.org/licenses/BSD-3-Clause",
  "gpl-3.0": "https://www.gnu.org/licenses/gpl-3.0.en.html",
  "mpl-2.0": "https://www.mozilla.org/en-US/MPL/2.0/",
  unlicense: "https://unlicense.org/",
  isc: "https://opensource.org/licenses/ISC",
  "lgpl-3.0": "https://www.gnu.org/licenses/lgpl-3.0.html",
};

export async function generateCredits(outputPath: string) {
  try {
    const pkgJsonPath = path.resolve(process.cwd(), "package.json");
    const pkgJsonRaw = await fs.readFile(pkgJsonPath, "utf-8");
    const pkg = JSON.parse(pkgJsonRaw);

    const dependencies = { ...pkg.dependencies, ...pkg.devDependencies };
    const credits: PackageInfo[] = [];

    for (const dep of Object.keys(dependencies)) {
      try {
        const depPkgPath = path.resolve(
          process.cwd(),
          "node_modules",
          dep,
          "package.json"
        );
        const depPkgRaw = await fs.readFile(depPkgPath, "utf-8");
        const depPkg = JSON.parse(depPkgRaw);
        credits.push({
          name: depPkg.name,
          version: depPkg.version,
          license: depPkg.license,
          homepage: depPkg.homepage,
        });
      } catch {
        credits.push({
          name: dep,
          version: dependencies[dep],
          license: "unknown",
        });
      }
    }

    // Group by license type
    const grouped: Record<string, PackageInfo[]> = {};
    for (const pkg of credits) {
      const key = pkg.license || "unknown";
      grouped[key] = grouped[key] || [];
      grouped[key].push(pkg);
    }

    // Build Markdown
    let md = "# Project Credits\n\n";
    for (const [license, pkgs] of Object.entries(grouped)) {
      const licenseLink = LICENSE_URLS[license.toLowerCase()] || "";
      md += `## License: ${license}${
        licenseLink ? ` ([link](${licenseLink}))` : ""
      }\n\n`;
      for (const pkg of pkgs) {
        md += `- **${pkg.name}** v${pkg.version}${
          pkg.homepage ? ` ([homepage](${pkg.homepage}))` : ""
        }\n`;
      }
      md += "\n";
    }

    await fs.writeFile(outputPath, md);
    console.log(`✅ Credits file generated at ${outputPath}`);
  } catch (err) {
    printTemplate("errors.unknownError", { error: err });
  }
}
