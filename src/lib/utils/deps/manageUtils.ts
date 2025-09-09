import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import util from "util";
const execPromise = util.promisify(exec);

/* ---------------------------- Utility Functions ---------------------------- */
export function getMajor(version: string): number {
  return parseInt(version.replace(/^[^\d]*/, "").split(".")[0] || "0", 10);
}

export function getMinor(version: string): number {
  return parseInt(version.replace(/^[^\d]*/, "").split(".")[1] || "0", 10);
}

export async function runCommand(cmd: string) {
  console.log(`> ${cmd}`);
  const { stdout, stderr } = await execPromise(cmd, { cwd: process.cwd() });
  if (stdout) process.stdout.write(stdout);
  if (stderr) process.stderr.write(stderr);
}

export async function readPackageJson(): Promise<{
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
} | null> {
  const pkgPath = path.resolve(process.cwd(), "package.json");
  try {
    const raw = await fs.readFile(pkgPath, "utf8");
    return JSON.parse(raw);
  } catch {
    console.error("❌ Failed to read package.json at", pkgPath);
    return null;
  }
}
