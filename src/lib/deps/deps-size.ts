import type { DepsSizeFlag } from "../types/utils.js";
import { limitConcurrency } from "../utils/common/index.js";
import {
  collectDepSizes,
  exportResults,
  fixZeroSizesWithFallback,
  getDependencies,
  renderDeps,
} from "../utils/deps/index.js";
import path from "path";

export async function getDepsSize(flags: DepsSizeFlag) {
  const { dependencies, devDependencies } = await getDependencies();

  const results = {
    dependencies: {} as Record<string, any>,
    devDependencies: {} as Record<string, any>,
  };

  const cache = new Map<string, { size: number; deps: Record<string, any> }>();

  const maxDepth = flags.depth;
  const maxConcurrency = flags.concurrency;

  // Create tasks for dependencies
  const depTasks = Object.keys(dependencies).map((dep) => async () => {
    const depPath = path.resolve("node_modules", dep);
    const res = await collectDepSizes(depPath, cache, 0, maxDepth);
    results.dependencies[dep] = res;
  });

  // Create tasks for devDependencies
  const devDepTasks = Object.keys(devDependencies).map((dep) => async () => {
    const depPath = path.resolve("node_modules", dep);
    const res = await collectDepSizes(depPath, cache, 0, maxDepth);
    results.devDependencies[dep] = res;
  });

  // Run with concurrency limit
  await limitConcurrency([...depTasks, ...devDepTasks], maxConcurrency);

  await fixZeroSizesWithFallback(results.dependencies);
  await fixZeroSizesWithFallback(results.devDependencies);

  renderDeps(results, flags);

  if (flags.export) {
    await exportResults(results, flags.export);
  }
}
