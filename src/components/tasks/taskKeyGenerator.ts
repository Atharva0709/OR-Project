/**
 * Operations Research: Smart Task Key & Label Generator
 */

import { TaskInput } from "@@/lib/main";

export function getNextKeyAndName(tasks: TaskInput[]): { key: string; text: string } {
  const numKeys = tasks
    .map((t) => Number(t.key))
    .filter((n) => !isNaN(n) && Number.isInteger(n));

  if (numKeys.length > 0) {
    const nextNum = Math.max(...numKeys) + 1;
    const nextLetter = String.fromCharCode(64 + ((nextNum - 1) % 26) + 1);
    return { key: String(nextNum), text: `Task ${nextLetter}` };
  }

  let counter = tasks.length + 1;
  while (tasks.some((t) => t.key === String(counter))) {
    counter++;
  }
  return { key: String(counter), text: `Task ${counter}` };
}
