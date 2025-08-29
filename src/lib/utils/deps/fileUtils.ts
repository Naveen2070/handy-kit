import fs from "fs/promises";
import path from "path";

// Recursively calculate folder size
export async function getFolderSize(folderPath: string): Promise<number> {
  try {
    const entries = await fs.readdir(folderPath, { withFileTypes: true });
    const sizes = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(folderPath, entry.name);
        if (entry.isDirectory()) return getFolderSize(fullPath);
        else {
          const stat = await fs.stat(fullPath);
          return stat.size;
        }
      })
    );
    return sizes.reduce((a, b) => a + b, 0);
  } catch {
    return 0;
  }
}

// Read package.json dependencies
export async function getDependencies(): Promise<{
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}> {
  const pkgPath = path.resolve("package.json");
  try {
    const content = await fs.readFile(pkgPath, "utf8");
    const pkg = JSON.parse(content);
    return {
      dependencies: pkg.dependencies || {},
      devDependencies: pkg.devDependencies || {},
    };
  } catch {
    console.error("❌ package.json not found or unreadable.");
    process.exit(1);
  }
}

// Format bytes to human readable string
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
