import { execSync } from "node:child_process";
export function gitStandup(days) {
    try {
        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - days);
        const since = sinceDate.toISOString().split("T")[0];
        const output = execSync(`git log --since="${since}" --pretty=format:"- [%ad] %s" --date=short`, { encoding: "utf-8" });
        if (!output.trim()) {
            console.log(`No commits in the last ${days} days.`);
            return;
        }
        console.log(`Commits from last ${days} days:\n${output}`);
    }
    catch (err) {
        console.error("❌ Failed to read git logs. Are you in a git repo?");
    }
}
//# sourceMappingURL=git-standup.js.map