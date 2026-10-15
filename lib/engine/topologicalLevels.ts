/**
 * Operations Research: Topological Rank & Level Assignment
 *
 * Traverses the Directed Acyclic Graph (DAG) to determine task levels (ranks)
 * and detects any circular references/cycles.
 */

import { Task, LevelType } from "../types/global.types";

/**
 * Computes topological levels (ranks) for all tasks in the network.
 * Throws an Error if circular dependencies are detected or missing dependencies exist.
 */
export function computeTopologicalLevels(
  tasksMap: Map<string, Task>,
  startTaskKey: string
): LevelType {
  const levels: LevelType = new Map<number, string[]>();
  levels.set(0, [startTaskKey]);

  const recStack = new Set<string>();

  const calcLevel = (task: Task) => {
    if (recStack.has(task.key)) {
      throw new Error("Circular dependency detected");
    }
    recStack.add(task.key);

    if (!task.dependsOn || task.dependsOn.length === 0) {
      task.level = 0;
    } else {
      let maxLevel = 0;
      task.dependsOn.forEach((dependency) => {
        const dependencyTask = tasksMap.get(dependency);
        if (!dependencyTask) {
          throw new Error(`Task with KEY '${dependency}' was not found.`);
        }
        if (dependencyTask.level === undefined) {
          calcLevel(dependencyTask);
        }
        maxLevel = Math.max(maxLevel, dependencyTask.level + 1);
      });
      task.level = maxLevel;
    }

    recStack.delete(task.key);

    if (!levels.has(task.level)) {
      levels.set(task.level, []);
    }

    const levelArray = levels.get(task.level)!;
    if (!levelArray.includes(task.key)) {
      levelArray.push(task.key);
    }
  };

  tasksMap.forEach((task) => {
    if (task.level === undefined) {
      recStack.clear();
      calcLevel(task);
    }
  });

  return levels;
}
