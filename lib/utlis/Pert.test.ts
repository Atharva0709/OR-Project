import { describe, it, expect } from "vitest";
import Pert, { normalCdf, inverseNormalCdf, erf } from "./Pert";
import { TaskInput } from "../types/global.types";

describe("Pert & CPM Engine", () => {
  // 1. 5-task CPM sample
  it("calculates expected duration 9 and critical path A-C-E for the 5-task sample", () => {
    const tasks: TaskInput[] = [
      { key: "1", text: "A", duration: 3 },
      { key: "2", text: "B", duration: 2, dependsOn: ["1"] },
      { key: "3", text: "C", duration: 4, dependsOn: ["1"] },
      { key: "4", text: "D", duration: 1, dependsOn: ["2"] },
      { key: "5", text: "E", duration: 2, dependsOn: ["3", "4"] },
    ];

    const pert = new Pert(tasks);
    const result = pert.solve();

    expect(result.projectDuration).toBe(9);
    expect(result.criticalPaths).toHaveLength(1);
    const pathKeys = result.criticalPaths[0].map((node) => node.key);
    expect(pathKeys).toEqual(["1", "3", "5"]);

    const pathTexts = result.criticalPaths[0].map((node) => node.text);
    expect(pathTexts).toEqual(["A", "C", "E"]);

    const taskA = result.tasks.get("1")!;
    expect(taskA.earlyStart).toBe(0);
    expect(taskA.earlyFinish).toBe(3);
    expect(taskA.lateStart).toBe(0);
    expect(taskA.lateFinish).toBe(3);
    expect(taskA.totalFloat).toBe(0);
    expect(taskA.critical).toBe(true);

    const taskB = result.tasks.get("2")!;
    expect(taskB.earlyStart).toBe(3);
    expect(taskB.earlyFinish).toBe(5);
    expect(taskB.lateStart).toBe(4);
    expect(taskB.lateFinish).toBe(6);
    expect(taskB.totalFloat).toBe(1);
    expect(taskB.critical).toBe(false);

    const taskC = result.tasks.get("3")!;
    expect(taskC.earlyStart).toBe(3);
    expect(taskC.earlyFinish).toBe(7);
    expect(taskC.totalFloat).toBe(0);
    expect(taskC.critical).toBe(true);

    const taskD = result.tasks.get("4")!;
    expect(taskD.earlyStart).toBe(5);
    expect(taskD.earlyFinish).toBe(6);
    expect(taskD.totalFloat).toBe(1);
    expect(taskD.critical).toBe(false);

    const taskE = result.tasks.get("5")!;
    expect(taskE.earlyStart).toBe(7);
    expect(taskE.earlyFinish).toBe(9);
    expect(taskE.totalFloat).toBe(0);
    expect(taskE.critical).toBe(true);
  });

  // 2. 3-point example with hand-verified te and variance
  it("computes hand-verified te and variance for 3-point estimates", () => {
    // Task 1: O=2, M=5, P=8 => te=(2 + 20 + 8)/6 = 5.0, var=((8-2)/6)^2 = 1.0
    // Task 2: O=3, M=6, P=15 => te=(3 + 24 + 15)/6 = 7.0, var=((15-3)/6)^2 = 4.0
    const tasks: TaskInput[] = [
      { key: "T1", text: "Task 1", optimistic: 2, mostLikely: 5, pessimistic: 8 },
      { key: "T2", text: "Task 2", optimistic: 3, mostLikely: 6, pessimistic: 15, dependsOn: ["T1"] },
    ];

    const pert = new Pert(tasks);
    const result = pert.solve();

    const t1 = result.tasks.get("T1")!;
    expect(t1.duration).toBe(5);
    expect(t1.variance).toBe(1);
    expect(t1.stdDev).toBe(1);

    const t2 = result.tasks.get("T2")!;
    expect(t2.duration).toBe(7);
    expect(t2.variance).toBe(4);
    expect(t2.stdDev).toBe(2);

    expect(result.projectDuration).toBe(12);
    expect(result.projectVariance).toBe(5); // 1.0 + 4.0
    expect(result.projectStdDev).toBeCloseTo(Math.sqrt(5), 5);
  });

  // 3. P(T) at the mean = 0.5
  it("evaluates P(finish <= T) = 0.5 at the expected project mean", () => {
    const tasks: TaskInput[] = [
      { key: "T1", text: "Task 1", optimistic: 2, mostLikely: 5, pessimistic: 8 },
      { key: "T2", text: "Task 2", optimistic: 3, mostLikely: 6, pessimistic: 15, dependsOn: ["T1"] },
    ];

    const pert = new Pert(tasks);
    pert.solve();

    const probAtMean = pert.calculateProbability(12);
    expect(probAtMean).toBeCloseTo(0.5, 5);

    // Verify erf(0) = 0
    expect(erf(0)).toBe(0);
    expect(normalCdf(12, 12, Math.sqrt(5))).toBeCloseTo(0.5, 5);

    // Verify inverseNormalCdf(0.5) returns mean
    const requiredMean = pert.calculateRequiredDuration(0.5);
    expect(requiredMean).toBeCloseTo(12, 4);
    expect(inverseNormalCdf(0.5, 12, Math.sqrt(5))).toBeCloseTo(12, 4);

    // Verify higher probability requires more time
    const prob95Duration = pert.calculateRequiredDuration(0.95);
    expect(prob95Duration).toBeGreaterThan(12);
    expect(prob95Duration).toBeCloseTo(12 + 1.64485 * Math.sqrt(5), 1);
  });

  // 4. Circular dependency
  it("throws clear error when a circular dependency is detected", () => {
    const tasks: TaskInput[] = [
      { key: "1", text: "A", duration: 3, dependsOn: ["2"] },
      { key: "2", text: "B", duration: 2, dependsOn: ["1"] },
    ];

    expect(() => new Pert(tasks).solve()).toThrowError(/Circular dependency detected/);
  });

  // 5. Missing dependency ID
  it("throws clear error when predecessor key does not exist", () => {
    const tasks: TaskInput[] = [
      { key: "1", text: "A", duration: 3, dependsOn: ["999"] },
    ];

    expect(() => new Pert(tasks).solve()).toThrowError(/Task with KEY '999' was not found/);
  });

  // 6. Duplicate ID
  it("throws clear error on duplicate task keys", () => {
    const tasks: TaskInput[] = [
      { key: "1", text: "A", duration: 3 },
      { key: "1", text: "B", duration: 4 },
    ];

    expect(() => new Pert(tasks).solve()).toThrowError(/Duplicate keys found 1/);
  });

  // 7. Negative values
  it("throws error for negative duration in CPM mode", () => {
    const tasks: TaskInput[] = [
      { key: "1", text: "A", duration: -5 },
    ];

    expect(() => new Pert(tasks).solve()).toThrowError(/Duration must be a finite number >= 0/);
  });

  it("throws error for negative values in 3-point estimates", () => {
    const tasks: TaskInput[] = [
      { key: "1", text: "A", optimistic: -2, mostLikely: 4, pessimistic: 6 },
    ];

    expect(() => new Pert(tasks).solve()).toThrowError(/3-point estimates must be finite numbers >= 0/);
  });

  // 8. o > m or m > p
  it("throws error when optimistic > mostLikely or mostLikely > pessimistic", () => {
    const tasksOgtM: TaskInput[] = [
      { key: "1", text: "A", optimistic: 6, mostLikely: 4, pessimistic: 8 },
    ];
    expect(() => new Pert(tasksOgtM).solve()).toThrowError(/Invalid 3-point estimates/);

    const tasksMgtP: TaskInput[] = [
      { key: "1", text: "A", optimistic: 2, mostLikely: 9, pessimistic: 8 },
    ];
    expect(() => new Pert(tasksMgtP).solve()).toThrowError(/Invalid 3-point estimates/);
  });

  // 9. Empty list
  it("handles empty task list gracefully without crashing", () => {
    const pert = new Pert([]);
    const result = pert.solve();

    expect(result.projectDuration).toBe(0);
    expect(result.projectVariance).toBe(0);
    expect(result.projectStdDev).toBe(0);
    expect(result.criticalPaths).toEqual([]);
    expect(pert.calculateProbability(5)).toBe(1);
  });

  // 10. Multiple critical paths with highest variance selection
  it("identifies highest variance critical path when multiple critical paths exist", () => {
    // Both paths have duration 10:
    // Path 1: T1 (dur: 5, var: 1) -> T2 (dur: 5, var: 1) = var 2
    // Path 2: T3 (dur: 5, var: 4) -> T4 (dur: 5, var: 4) = var 8
    const tasks: TaskInput[] = [
      { key: "1", text: "T1", optimistic: 2, mostLikely: 5, pessimistic: 8 }, // te=5, var=1
      { key: "2", text: "T2", optimistic: 2, mostLikely: 5, pessimistic: 8, dependsOn: ["1"] }, // te=5, var=1
      { key: "3", text: "T3", optimistic: 1, mostLikely: 4, pessimistic: 13 }, // te=(1+16+13)/6 = 5, var = ((13-1)/6)^2 = 4
      { key: "4", text: "T4", optimistic: 1, mostLikely: 4, pessimistic: 13, dependsOn: ["3"] }, // te=5, var=4
    ];

    const pert = new Pert(tasks);
    const result = pert.solve();

    expect(result.projectDuration).toBe(10);
    expect(result.criticalPaths).toHaveLength(2);
    // Highest variance path should be Path 2 with variance = 4 + 4 = 8
    expect(result.projectVariance).toBe(8);
    expect(result.projectStdDev).toBeCloseTo(Math.sqrt(8), 5);
    expect(result.highestVariancePathNote).toBeDefined();
    expect(result.highestVariancePathNote).toContain("Multiple critical paths detected");
  });
});
