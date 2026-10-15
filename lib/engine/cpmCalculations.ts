/**
 * Operations Research: Critical Path Method (CPM) Passes & Float Calculations
 *
 * Implements:
 * - Forward Pass: Early Start (ES) = max(EF of predecessors), Early Finish (EF) = ES + duration
 * - Backward Pass: Late Finish (LF) = min(LS of successors), Late Start (LS) = LF - duration
 * - Total Float (TF) = LF - EF = LS - ES (path flexibility)
 * - Free Float (FF) = min(ES of successors) - EF (independent task flexibility)
 * - Criticality check: Task is critical if Total Float === 0
 */

import { Task } from "../types/global.types";

/**
 * Retrieves all direct successor tasks for a given task.
 */
export function getSuccessors(task: Task, tasksMap: Map<string, Task>): Task[] {
  return Array.from(tasksMap.values()).filter(
    (t) => t.dependsOn && t.dependsOn.includes(task.key)
  );
}

/**
 * Computes Early Start (ES) and Early Finish (EF) for a task during the forward pass.
 */
export function calculateEarlyTimes(
  taskKey: string,
  tasksMap: Map<string, Task>
): void {
  const task = tasksMap.get(taskKey);
  if (!task) return;

  if (!task.dependsOn || task.dependsOn.length === 0) {
    task.earlyStart = 0;
  } else {
    let maxFinishTime = 0;
    task.dependsOn.forEach((dependencyKey) => {
      const dependencyTask = tasksMap.get(dependencyKey);
      if (dependencyTask) {
        maxFinishTime = Math.max(
          maxFinishTime,
          dependencyTask.earlyStart + dependencyTask.duration
        );
      }
    });
    task.earlyStart = maxFinishTime;
  }
  task.earlyFinish = task.earlyStart + task.duration;
}

/**
 * Computes Late Start (LS), Late Finish (LF), Total Float, Free Float, and Criticality
 * for a task during the backward pass.
 */
export function calculateLateTimes(
  taskKey: string,
  projectDuration: number,
  lastTaskKey: string,
  tasksMap: Map<string, Task>
): void {
  const task = tasksMap.get(taskKey);
  if (!task) return;

  const successors = getSuccessors(task, tasksMap);
  if (task.key !== lastTaskKey && successors.length === 0) {
    const lastTask = tasksMap.get(lastTaskKey);
    if (lastTask && lastTask.dependsOn) {
      if (!lastTask.dependsOn.includes(taskKey)) {
        lastTask.dependsOn.push(taskKey);
      }
    }
  }

  const lateFinish =
    successors.length === 0
      ? projectDuration
      : Math.min(...successors.map((s) => s.lateFinish - s.duration));

  task.lateFinish = lateFinish;
  task.lateStart = task.lateFinish - task.duration;
  task.critical = Math.abs(task.earlyFinish - task.lateFinish) < 1e-9;

  if (!task.critical) {
    task.freeFloat =
      (successors.length === 0
        ? projectDuration
        : Math.min(...successors.map((s) => s.earlyStart))) - task.earlyFinish;
    task.totalFloat = task.lateFinish - task.earlyFinish;
  } else {
    task.freeFloat = 0;
    task.totalFloat = 0;
  }
}
