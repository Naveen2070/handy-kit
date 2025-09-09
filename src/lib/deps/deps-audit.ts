import { exec } from "child_process";
import util from "util";
import fs from "fs/promises";

const execPromise = util.promisify(exec);

/**
 * Handles `handy-kit deps audit`
 */
export async function handleAuditDepsCommand(
  _: string[],
  flags: Record<string, string | boolean>
) {
  const help = flags["help"] || flags["h"];
  const jsonFlag = flags["json"] || flags["j"];
  const summaryOnly = flags["summary"] || flags["s"];
  const exportPath = flags["export"] || flags["e"];

  if (help) {
    const { printTemplate } = await import("../utils/common/templates.js");
    printTemplate("help.deps-audit");
    process.exit(0);
  }

  let auditData: any;

  try {
    const { stdout } = await execPromise("npm audit --json", {
      cwd: process.cwd(),
    });
    auditData = JSON.parse(stdout);
  } catch (err: any) {
    if (err.stdout) {
      try {
        auditData = JSON.parse(err.stdout);
      } catch {
        console.error("❌ Failed to parse audit output.");
        process.exit(1);
      }
    } else {
      console.error("❌ Audit failed:", err.stderr || err.message);
      process.exit(1);
    }
  }

  if (!auditData) {
    console.error("❌ No audit data found.");
    process.exit(1);
  }

  if (exportPath) {
    try {
      await fs.writeFile(
        exportPath.toString(),
        JSON.stringify(auditData, null, 2)
      );
      console.log(`✅ Exported audit results to ${exportPath}`);
    } catch (err) {
      console.error(`❌ Failed to export audit report:`, err);
    }
  }

  // JSON output if flagged
  if (jsonFlag === "true" || jsonFlag === true) {
    console.log(JSON.stringify(auditData, null, 2));
    return;
  }

  // Summary only output
  if (summaryOnly === "true" || summaryOnly === true) {
    const summary = auditData.metadata || {};
    console.log("\n🔍 Audit Summary:");
    console.log(`• Total Dependencies:   ${summary.dependencies?.total || 0}`);
    console.log(`• Vulnerabilities:`);
    console.log(`    - Info:     ${summary.vulnerabilities?.info || 0}`);
    console.log(`    - Low:      ${summary.vulnerabilities?.low || 0}`);
    console.log(`    - Moderate: ${summary.vulnerabilities?.moderate || 0}`);
    console.log(`    - High:     ${summary.vulnerabilities?.high || 0}`);
    console.log(`    - Critical: ${summary.vulnerabilities?.critical || 0}`);
    return;
  }

  // Otherwise, pretty print vulnerabilities in human readable form
  const vulns = auditData.vulnerabilities || {};

  const severityOrder = ["critical", "high", "moderate", "low", "info"];

  function printVuln(name: string, vuln: any) {
    const severity = vuln.severity || "unknown";
    console.log(`\n📛 Package: ${name}`);
    console.log(`  Severity: ${severity.toUpperCase()}`);
    if (vuln.title) {
      console.log(`  Title:    ${vuln.title}`);
    }
    if (vuln.via && Array.isArray(vuln.via)) {
      const viaTitles = vuln.via
        .map((v: any) => (typeof v === "string" ? v : v.title || v.name))
        .filter(Boolean);
      if (viaTitles.length > 0) {
        console.log(`  Via:      ${viaTitles.join(", ")}`);
      }
    }
    if (vuln.fixAvailable) {
      const fix = vuln.fixAvailable;
      if (typeof fix === "object") {
        console.log(
          `  Fix:      Upgrade ${fix.name} to version ${fix.version}${
            fix.isSemVerMajor ? " (major)" : ""
          }`
        );
      } else {
        console.log(`  Fix:      ${fix}`);
      }
    }
    if (vuln.url) {
      console.log(`  More Info: ${vuln.url}`);
    }
  }

  // Group vulnerabilities by severity and print ordered by severity
  for (const severity of severityOrder) {
    const filtered = Object.entries(vulns).filter(
      ([_, vuln]: [string, any]) => (vuln.severity || "unknown") === severity
    );

    if (filtered.length === 0) continue;

    console.log(
      `\n=== ${severity.toUpperCase()} Vulnerabilities (${filtered.length}) ===`
    );
    filtered.forEach(([name, vuln]) => printVuln(name, vuln));
  }

  // Print summary at the end
  const summary = auditData.metadata || {};
  console.log("\n🔍 Audit Summary:");
  console.log(`• Total Dependencies:   ${summary.dependencies?.total || 0}`);
  console.log(`• Vulnerabilities:`);
  console.log(`    - Info:     ${summary.vulnerabilities?.info || 0}`);
  console.log(`    - Low:      ${summary.vulnerabilities?.low || 0}`);
  console.log(`    - Moderate: ${summary.vulnerabilities?.moderate || 0}`);
  console.log(`    - High:     ${summary.vulnerabilities?.high || 0}`);
  console.log(`    - Critical: ${summary.vulnerabilities?.critical || 0}`);
}
