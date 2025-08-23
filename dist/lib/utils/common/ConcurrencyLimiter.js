export async function limitConcurrency(tasks, maxConcurrent) {
    const results = [];
    let running = 0;
    let index = 0;
    return new Promise((resolve, reject) => {
        function runNext() {
            if (index === tasks.length && running === 0) {
                resolve(results);
                return;
            }
            while (running < maxConcurrent && index < tasks.length) {
                const currentIndex = index++;
                running++;
                tasks[currentIndex]()
                    .then((res) => {
                    results[currentIndex] = res;
                })
                    .catch(reject)
                    .finally(() => {
                    running--;
                    runNext();
                });
            }
        }
        runNext();
    });
}
//# sourceMappingURL=ConcurrencyLimiter.js.map