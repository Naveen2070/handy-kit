import { collectDepSizes } from "./collectDepSizes.js";
import { fixZeroSizesWithFallback } from "./fallbackScan.js";
import { getDependencies } from "./fileUtils.js";
import { renderDeps, exportResults } from "./render.js";
import {
  getMajor,
  getMinor,
  readPackageJson,
  runCommand,
} from "./manageUtils.js";
import { fetchOutdated, displayOutdatedPackages } from "./outdatedUtils.js";

export {
  collectDepSizes,
  getDependencies,
  fixZeroSizesWithFallback,
  renderDeps,
  exportResults,
  getMajor,
  getMinor,
  readPackageJson,
  runCommand,
  fetchOutdated,
  displayOutdatedPackages,
};
