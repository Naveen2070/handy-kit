export function parseArgs(argv) {
    if (!Array.isArray(argv)) {
        throw new TypeError("parseArgs() expects an array of strings");
    }
    const positional = [];
    const flags = {};
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (!arg) {
            throw new TypeError("parseArgs() expects an array of non-empty strings");
        }
        if (arg.startsWith("--")) {
            const [key, inlineValue] = arg.slice(2).split("=");
            const value = inlineValue ??
                (argv[i + 1] && !argv[i + 1].startsWith("-") ? argv[++i] : "true");
            flags[key] = value;
        }
        else if (arg.startsWith("-") && arg.length > 1) {
            const chars = arg.slice(1).split("");
            if (chars.length > 1) {
                for (const c of chars) {
                    flags[c] = "true";
                }
            }
            else {
                const key = chars[0];
                const value = argv[i + 1] && !argv[i + 1].startsWith("-") ? argv[++i] : "true";
                flags[key] = value;
            }
        }
        else {
            positional.push(arg);
        }
    }
    return { positional, flags };
}
//# sourceMappingURL=args.js.map