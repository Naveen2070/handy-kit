import * as readline from "readline";

/**
 * Asks the user a question and resolves with the user's answer.
 *
 * @param question The question to ask the user.
 * @returns A promise that resolves with the user's answer.
 */
export function askUser(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(question, (ans) => {
      rl.close();
      resolve(ans.trim());
    })
  );
}
