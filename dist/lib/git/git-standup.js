import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { printTemplate } from "../utils/common/index.js";
/**
 * Get the names of all branches that contain the given commit hash.
 *
 * @param commitHash - The commit hash to search for
 * @returns An array of branch names
 */
function getBranches(commitHash) {
    try {
        // Get output of `git branch -a --contains <commitHash>`
        const output = execSync(`git branch -a --contains ${commitHash}`, {
            encoding: "utf-8",
        });
        // Split output into individual lines
        const lines = output.split("\n");
        // Filter out empty lines and non-branch lines
        const allBranches = lines
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => line.replace(/^\* /, "")); // remove leading '*'
        // Split into local & remote branches
        const localBranches = allBranches.filter((branch) => !branch.startsWith("remotes/") && !branch.includes("->"));
        const remoteBranches = allBranches.filter((branch) => branch.startsWith("remotes/") && !branch.includes("->"));
        if (localBranches.length > 0) {
            // If there are local branches, return them
            return localBranches;
        }
        else if (remoteBranches.length > 0) {
            // Fallback to remote branches, but clean "remotes/origin/"
            return remoteBranches.map((branch) => branch.replace(/^remotes\//, ""));
        }
        else {
            // If no branches are found, return ["unknown"]
            return ["unknown"];
        }
    }
    catch {
        // If an error occurs, return ["unknown"]
        return ["unknown"];
    }
}
/**
 * Prints or exports a grouped list of commits from the last n days/weeks/months/years.
 * If no duration is specified, it will throw an error.
 *
 * @param options - An object containing the following properties:
 *   - `days`: The number of days to look back.
 *   - `weeks`: The number of weeks to look back.
 *   - `months`: The number of months to look back.
 *   - `years`: The number of years to look back.
 *   - `author`: An optional filter to select only commits from the specified author.
 *   - `branch`: An optional filter to select only commits from the specified branch.
 *   - `exportPath`: An optional path to export the report to a file.
 */
export function gitStandup(options) {
    try {
        const sinceDate = new Date();
        if (options.days)
            sinceDate.setDate(sinceDate.getDate() - options.days);
        if (options.weeks)
            sinceDate.setDate(sinceDate.getDate() - options.weeks * 7);
        if (options.months)
            sinceDate.setMonth(sinceDate.getMonth() - options.months);
        if (options.years)
            sinceDate.setFullYear(sinceDate.getFullYear() - options.years);
        const since = sinceDate.toISOString().split("T")[0];
        // include %H for commit hash
        let cmd = `git log --since="${since}" --pretty=format:"%H|%ad|%an|%D|%s" --date=short`;
        const output = execSync(cmd, { encoding: "utf-8" });
        if (!output.trim()) {
            printTemplate("errors.gitStandupNoCommits", { days: options.days });
            return;
        }
        const lines = output.trim().split("\n");
        const grouped = {};
        const authorFilter = options.author?.toLowerCase();
        const branchFilters = options.branch
            ? options.branch.split(",").map((b) => b.trim().toLowerCase())
            : null;
        for (const line of lines) {
            const parts = line.split("|");
            if (parts.length < 5)
                continue;
            const [hash, date, author, refs, ...msgParts] = parts;
            const message = msgParts.join("|").trim();
            // try refs first
            let branches = refs
                .split(",")
                .map((r) => r.replace(/HEAD -> /, "").trim())
                .filter((r) => r && !r.startsWith("tag:") && !r.startsWith("stash@"));
            // Separate local and remote
            const localRefs = branches.filter((b) => !b.startsWith("origin/"));
            const remoteRefs = branches
                .filter((b) => b.startsWith("origin/"))
                .map((b) => b.replace(/^origin\//, ""));
            if (localRefs.length > 0) {
                branches = localRefs;
            }
            else if (remoteRefs.length > 0) {
                branches = remoteRefs;
            }
            // fallback: resolve from git branch --contains
            if (branches.length === 0) {
                branches = getBranches(hash);
            }
            // author filter
            if (authorFilter && !author.toLowerCase().includes(authorFilter))
                continue;
            // branch filter
            if (branchFilters &&
                !branches.some((br) => branchFilters.some((bf) => br.toLowerCase().includes(bf)))) {
                continue;
            }
            if (!grouped[date])
                grouped[date] = [];
            grouped[date].push(`- [${branches.join(", ")}] ${message} (${author})`);
        }
        if (Object.keys(grouped).length === 0) {
            printTemplate("errors.gitStandupNoCommits", { days: options.days });
            return;
        }
        let formatted = "";
        for (const [date, commits] of Object.entries(grouped)) {
            formatted += `📅 ${date}\n${commits.join("\n")}\n\n`;
        }
        console.log(formatted.trim());
        let exportPath = options.exportPath && options.exportPath.toString() === "true"
            ? path.join(process.cwd(), "git-standup-report.md")
            : options.exportPath;
        if (exportPath) {
            fs.writeFileSync(exportPath, `# Git Standup Report\n\n${formatted}`);
            console.log(`✅ Exported report to ${exportPath}`);
        }
    }
    catch (err) {
        printTemplate("errors.notAGitRepo");
    }
}
//# sourceMappingURL=git-standup.js.map