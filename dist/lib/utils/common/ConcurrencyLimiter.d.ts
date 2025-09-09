/**
 * Limit the concurrency of the given tasks.
 * @param tasks - The tasks to be run
 * @param maxConcurrent - The maximum number of tasks to run concurrently
 * @returns The results of the tasks
 */
export declare function limitConcurrency<T>(tasks: (() => Promise<T>)[], maxConcurrent: number): Promise<T[]>;
//# sourceMappingURL=ConcurrencyLimiter.d.ts.map