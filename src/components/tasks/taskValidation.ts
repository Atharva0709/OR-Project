/**
 * Operations Research: Task List Validation Engine
 *
 * Enforces:
 * 1. Non-empty task list
 * 2. Unique task keys
 * 3. Finite, non-negative durations (CPM) or valid 3-point estimates with o <= m <= p (PERT)
 * 4. Predecessor reference existence (no missing dependencies)
 * 5. No self-dependencies
 * 6. Cycle detection using Kahn's algorithm (topological sort)
 */

import { TaskInput } from "@@/lib/main";
import { UI_STRINGS } from "@/constants/strings";

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

export function validateTasksList(
  tasks: TaskInput[],
  mode: "cpm" | "pert"
): ValidationResult {
  if (tasks.length === 0) {
    return { isValid: false, error: UI_STRINGS.errors.emptyTaskList };
  }

  const keys = new Set<string>();
  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    const key = (t.key ?? "").toString().trim();
    if (!key) {
      return { isValid: false, error: UI_STRINGS.errors.emptyKey(i + 1) };
    }
    if (keys.has(key)) {
      return { isValid: false, error: UI_STRINGS.errors.duplicateKey(key, i + 1) };
    }
    keys.add(key);

    if (mode === "pert") {
      const o = Number(t.optimistic);
      const m = Number(t.mostLikely);
      const p = Number(t.pessimistic);

      if (
        isNaN(o) ||
        isNaN(m) ||
        isNaN(p) ||
        !Number.isFinite(o) ||
        !Number.isFinite(m) ||
        !Number.isFinite(p) ||
        o < 0 ||
        m < 0 ||
        p < 0 ||
        o > m ||
        m > p
      ) {
        return {
          isValid: false,
          error: UI_STRINGS.errors.invalidThreePoint(key, o, m, p),
        };
      }
    } else {
      const dur = Number(t.duration);
      if (isNaN(dur) || !Number.isFinite(dur) || dur < 0) {
        return { isValid: false, error: UI_STRINGS.errors.invalidDuration(key) };
      }
    }
  }

  // Predecessor verification
  for (const t of tasks) {
    const taskKey = (t.key ?? "").toString().trim();
    if (t.dependsOn && t.dependsOn.length > 0) {
      for (const rawDep of t.dependsOn) {
        const dep = (rawDep ?? "").toString().trim();
        if (dep === taskKey) {
          return { isValid: false, error: UI_STRINGS.errors.selfDependency(taskKey) };
        }
        if (!keys.has(dep)) {
          return { isValid: false, error: UI_STRINGS.errors.missingDependency(taskKey, dep) };
        }
      }
    }
  }

  // Cycle detection (Topological sort using Kahn's algorithm)
  const inDegree = new Map<string, number>();
  const graph = new Map<string, string[]>();

  for (const t of tasks) {
    const key = (t.key ?? "").toString().trim();
    inDegree.set(key, 0);
    graph.set(key, []);
  }

  for (const t of tasks) {
    const key = (t.key ?? "").toString().trim();
    if (t.dependsOn && t.dependsOn.length > 0) {
      for (const rawDep of t.dependsOn) {
        const dep = (rawDep ?? "").toString().trim();
        graph.get(dep)?.push(key);
        inDegree.set(key, (inDegree.get(key) || 0) + 1);
      }
    }
  }

  const queue: string[] = [];
  inDegree.forEach((deg, key) => {
    if (deg === 0) queue.push(key);
  });

  let processedCount = 0;
  while (queue.length > 0) {
    const curr = queue.shift()!;
    processedCount++;
    for (const neighbor of graph.get(curr) || []) {
      const remaining = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, remaining);
      if (remaining === 0) {
        queue.push(neighbor);
      }
    }
  }

  if (processedCount < tasks.length) {
    return {
      isValid: false,
      error: UI_STRINGS.errors.circularDependency,
    };
  }

  return { isValid: true, error: null };
}
