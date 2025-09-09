/**
 * Limit the concurrency of the given tasks.
 * @param tasks - The tasks to be run
 * @param maxConcurrent - The maximum number of tasks to run concurrently
 * @returns The results of the tasks
 */
export async function limitConcurrency<T>(
  tasks: (() => Promise<T>)[],
  maxConcurrent: number
): Promise<T[]> {
  const results: T[] = [];
  let running = 0;
  let index = 0;

  return new Promise((resolve, reject) => {
    /**
     * Run the next task in the list.
     * This function is called recursively to run all tasks.
     */
    function runNext() {
      if (index === tasks.length && running === 0) {
        // If all tasks have been run, resolve the promise
        resolve(results);
        return;
      }
      while (running < maxConcurrent && index < tasks.length) {
        const currentIndex = index++;
        running++; // Increment the number of running tasks
        tasks[currentIndex]!()
          .then((res) => {
            results[currentIndex] = res;
          })
          .catch(reject)
          .finally(() => {
            running--; // Decrement the number of running tasks
            runNext(); // Run the next task
          });
      }
    }
    runNext(); // Run the first task
  });
}
