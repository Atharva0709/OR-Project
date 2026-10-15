/**
 * Operations Research: PERT & CPM Solver Engine
 *
 * Orchestrates:
 * 1. Data initialization & 3-point estimation
 * 2. Topological sort & rank assignment
 * 3. CPM Forward pass (ES, EF) & project duration
 * 4. CPM Backward pass (LS, LF) & float calculations
 * 5. Critical path identification & variance risk modeling
 * 6. Probabilistic on-time completion forecasting
 */

import {
  TaskInput,
  Task,
  LevelType,
  LinkType,
  CriticalPath,
} from "../types/global.types";
import { extractTaskEstimates } from "./pertEstimation";
import {
  calculateEarlyTimes,
  calculateLateTimes,
  getSuccessors,
} from "./cpmCalculations";
import { computeTopologicalLevels } from "./topologicalLevels";
import {
  buildNetworkLinks,
  analyzeCriticalPaths,
} from "./criticalPathAnalysis";
import {
  normalCdf,
  inverseNormalCdf,
} from "./statisticalDistribution";

export const generateKey = (): string => Math.random().toString(36).substring(7);

export class Pert {
  private levels: LevelType;
  private tasksMap: Map<string, Task>;
  private initialData: TaskInput[];
  private links: LinkType[];
  private criticalPaths: CriticalPath[];
  private lastTaskKey: string;
  private startTaskKey: string;
  private projectDuration: number;
  private projectVariance: number;
  private projectStdDev: number;
  private highestVariancePathNote?: string;

  constructor(data: TaskInput[]) {
    this.initialData = data;
    this.tasksMap = new Map<string, Task>();
    this.lastTaskKey = `Finish-${generateKey()}`;
    this.startTaskKey = `Start-${generateKey()}`;
    this.links = [];
    this.criticalPaths = [];
    this.levels = new Map<number, string[]>();
    this.projectDuration = 0;
    this.projectVariance = 0;
    this.projectStdDev = 0;
  }

  private convertDataToMap() {
    this.tasksMap = new Map<string, Task>();
    this.tasksMap.set(this.startTaskKey, {
      key: this.startTaskKey,
      duration: 0,
      expectedDuration: 0,
      variance: 0,
      stdDev: 0,
      text: "Start",
      earlyStart: 0,
      earlyFinish: 0,
      lateStart: 0,
      lateFinish: 0,
      level: 0,
      critical: true,
      freeFloat: 0,
      totalFloat: 0,
      index: -1,
    });

    this.initialData.forEach((task, index) => {
      if (this.tasksMap.has(task.key)) {
        throw new Error(`Duplicate keys found ${task.key}`);
      }

      const estimates = extractTaskEstimates(task);
      const dependsOn =
        !task.dependsOn || task.dependsOn.length === 0
          ? [this.startTaskKey]
          : task.dependsOn;

      this.tasksMap.set(task.key, {
        ...task,
        duration: estimates.duration,
        expectedDuration: estimates.expectedDuration,
        variance: estimates.variance,
        stdDev: estimates.stdDev,
        dependsOn,
        index,
        earlyStart: 0,
        earlyFinish: 0,
        lateStart: 0,
        lateFinish: 0,
        level: undefined as unknown as number,
        critical: false,
        freeFloat: 0,
        totalFloat: 0,
      });
    });
  }

  private calculatePERT() {
    this.convertDataToMap();

    if (this.initialData.length === 0) {
      this.tasksMap.set(this.lastTaskKey, {
        key: this.lastTaskKey,
        text: "Finish",
        dependsOn: [this.startTaskKey],
        duration: 0,
        expectedDuration: 0,
        variance: 0,
        stdDev: 0,
        earlyStart: 0,
        earlyFinish: 0,
        lateFinish: 0,
        lateStart: 0,
        level: 1,
        critical: true,
        freeFloat: 0,
        totalFloat: 0,
        index: 0,
      });
      this.levels.set(0, [this.startTaskKey]);
      this.levels.set(1, [this.lastTaskKey]);
      this.projectDuration = 0;
      this.projectVariance = 0;
      this.projectStdDev = 0;
      return;
    }

    this.levels = computeTopologicalLevels(this.tasksMap, this.startTaskKey);

    // Forward pass in ascending topological level order
    const sortedLevelKeys = Array.from(this.levels.keys()).sort((a, b) => a - b);
    for (const lvl of sortedLevelKeys) {
      const keys = this.levels.get(lvl)!;
      for (const k of keys) {
        calculateEarlyTimes(k, this.tasksMap);
      }
    }

    // Determine max Early Finish across tasks
    let maxEarlyFinish = 0;
    this.tasksMap.forEach((t) => {
      if (t.earlyFinish > maxEarlyFinish) {
        maxEarlyFinish = t.earlyFinish;
      }
    });

    this.projectDuration = maxEarlyFinish;

    // Identify terminal tasks
    const terminalTaskKeys: string[] = [];
    this.tasksMap.forEach((t) => {
      if (t.key !== this.startTaskKey && getSuccessors(t, this.tasksMap).length === 0) {
        terminalTaskKeys.push(t.key);
      }
    });

    const maxLevel = Math.max(0, ...Array.from(this.levels.keys()));
    const finishLevel = maxLevel + 1;
    this.tasksMap.set(this.lastTaskKey, {
      key: this.lastTaskKey,
      text: "Finish",
      dependsOn: terminalTaskKeys.length > 0 ? terminalTaskKeys : [this.startTaskKey],
      duration: 0,
      expectedDuration: 0,
      variance: 0,
      stdDev: 0,
      earlyStart: this.projectDuration,
      earlyFinish: this.projectDuration,
      lateFinish: this.projectDuration,
      lateStart: this.projectDuration,
      level: finishLevel,
      critical: true,
      freeFloat: 0,
      totalFloat: 0,
      index: this.tasksMap.size - 1,
    });
    this.levels.set(finishLevel, [this.lastTaskKey]);

    // Backward pass in descending level order
    const reverseLevelKeys = Array.from(this.levels.keys()).sort((a, b) => b - a);
    for (const lvl of reverseLevelKeys) {
      const keys = this.levels.get(lvl) || [];
      for (const k of keys) {
        calculateLateTimes(k, this.projectDuration, this.lastTaskKey, this.tasksMap);
      }
    }

    // Sort level indices consistently
    this.levels.forEach((indices, key) => {
      this.levels.set(
        key,
        indices.sort((a, b) => this.tasksMap.get(a)!.index - this.tasksMap.get(b)!.index)
      );
    });
  }

  private calcCriticalPaths() {
    this.links = buildNetworkLinks(this.tasksMap, this.startTaskKey, this.lastTaskKey);

    const result = analyzeCriticalPaths(
      this.tasksMap,
      this.links,
      this.startTaskKey,
      this.lastTaskKey,
      this.initialData.length
    );

    this.criticalPaths = result.criticalPaths;
    this.projectVariance = result.projectVariance;
    this.projectStdDev = result.projectStdDev;
    this.highestVariancePathNote = result.highestVariancePathNote;
  }

  getTasks(): Map<string, Task> {
    if (this.tasksMap.size === 0) {
      this.calculatePERT();
    }
    return this.tasksMap;
  }

  getCriticalPaths(): CriticalPath[] {
    if (this.criticalPaths.length === 0 && this.initialData.length > 0) {
      this.calcCriticalPaths();
    }
    return this.criticalPaths;
  }

  getLevels(): Map<number, string[]> {
    return this.levels;
  }

  getNodeLinks(): LinkType[] {
    return this.links;
  }

  getProjectDuration(): number {
    return this.projectDuration;
  }

  getProjectVariance(): number {
    return this.projectVariance;
  }

  getProjectStdDev(): number {
    return this.projectStdDev;
  }

  getHighestVariancePathNote(): string | undefined {
    return this.highestVariancePathNote;
  }

  calculateProbability(targetTime: number): number {
    return normalCdf(targetTime, this.projectDuration, this.projectStdDev);
  }

  calculateRequiredDuration(targetProbability: number): number {
    return inverseNormalCdf(targetProbability, this.projectDuration, this.projectStdDev);
  }

  solve() {
    this.calculatePERT();
    this.calcCriticalPaths();
    return {
      tasks: this.tasksMap,
      levels: this.getLevels(),
      criticalPaths: this.getCriticalPaths(),
      links: this.getNodeLinks(),
      projectDuration: this.getProjectDuration(),
      projectVariance: this.getProjectVariance(),
      projectStdDev: this.getProjectStdDev(),
      highestVariancePathNote: this.getHighestVariancePathNote(),
    };
  }
}

export default Pert;
