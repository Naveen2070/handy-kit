import type { AuthorStats } from "../../git/git-stats.js";

/**
 * Renders a console chart of the contribution statistics.
 *
 * @param stats - An object with author names as keys and their contribution statistics as values.
 * @param metric - The metric to use for the chart (default: "commits").
 */
export function renderChart(
  stats: Record<string, AuthorStats>,
  metric: "commits" | "added" | "deleted" = "commits"
): void {
  console.log("\n=== Contribution Chart ===");

  // Collect all values for scaling
  const values: number[] = [];
  for (const author in stats) {
    for (const period in stats[author]) {
      values.push(stats[author][period]![metric]);
    }
  }

  const maxVal = Math.max(...values, 1); // prevent divide by zero

  // Render
  for (const author in stats) {
    console.log(`\n${author}`);
    const sortedPeriods = Object.keys(stats[author]!).sort();

    for (const period of sortedPeriods) {
      const entry = stats[author]![period];
      const value = entry![metric];
      const barLength = Math.floor((value / maxVal) * 40);
      const bar = "█".repeat(barLength);

      console.log(`  ${period}: ${bar} (${value} ${metric})`);
    }
  }
}
