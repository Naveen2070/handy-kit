/**
 * Prints a commit chart to the console, grouped by author and then
 * grouped by period (daily, weekly, monthly). The chart shows the number
 * of commits each author made in each period.
 *
 * @param stats - An object of author stats, where each author has a
 *   sub-object with period stats (e.g. daily, weekly, monthly). Each
 *   period stat has a `commits` property with the number of commits.
 * @param flags - Unused
 */
export function renderChart(stats, flags) {
    console.log("\n📊 COMMIT CHART\n");
    for (const author of Object.keys(stats)) {
        console.log(`👤 ${author}`);
        for (const period of Object.keys(stats[author])) {
            const { commits } = stats[author][period];
            const bar = "█".repeat(Math.min(commits, 40)); // Cap width
            console.log(`   ${period.padEnd(20)} | ${bar} (${commits})`);
        }
        console.log("");
    }
}
//# sourceMappingURL=statusChart.js.map