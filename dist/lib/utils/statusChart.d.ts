import type { AuthorStats } from "../git/git-stats.js";
/**
 * Renders a console chart of the contribution statistics.
 *
 * @param stats - An object with author names as keys and their contribution statistics as values.
 * @param metric - The metric to use for the chart (default: "commits").
 */
export declare function renderChart(stats: Record<string, AuthorStats>, metric?: "commits" | "added" | "deleted"): void;
//# sourceMappingURL=statusChart.d.ts.map