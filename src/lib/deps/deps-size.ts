import {
  collectDepSizes,
  exportResults,
  fixZeroSizesWithFallback,
  getDependencies,
  renderDeps,
} from "../utils/deps/index.js";
import path from "path";

export async function getDepsSize(flags: {
  verbose: boolean;
  tree: boolean;
  export: string;
  table: boolean;
}) {
  const { dependencies, devDependencies } = await getDependencies();

  const results = {
    dependencies: {} as Record<string, any>,
    devDependencies: {} as Record<string, any>,
  };

  const cache = new Map();

  for (const dep of Object.keys(dependencies)) {
    const depPath = path.resolve("node_modules", dep);
    results.dependencies[dep] = await collectDepSizes(depPath, cache);
  }

  for (const dep of Object.keys(devDependencies)) {
    const depPath = path.resolve("node_modules", dep);
    results.devDependencies[dep] = await collectDepSizes(depPath, cache);
  }

  await fixZeroSizesWithFallback(results.dependencies);
  await fixZeroSizesWithFallback(results.devDependencies);

  renderDeps(results, flags);

  if (flags.export) {
    await exportResults(results, flags.export);
  }
}
