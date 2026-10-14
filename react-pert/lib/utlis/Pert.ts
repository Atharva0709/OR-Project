import {
  TaskInput,
  Task,
  LevelType,
  LinkType,
  CriticalPath,
} from "../types/global.types";

export const generateKey = (): string => Math.random().toString(36).substring(7);

/**
 * Abramowitz and Stegun approximation 7.1.26 for the Error Function (erf).
 * Maximum absolute error < 1.5e-7. No external dependencies.
 */
export function erf(x: number): number {
  if (x === 0) return 0;
  const sign = x >= 0 ? 1 : -1;
  const absX = Math.abs(x);
  const p = 0.3275911;
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;

  const t = 1 / (1 + p * absX);
  const poly = ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t;
  return sign * (1 - poly * Math.exp(-absX * absX));
}

/**
 * Standard Normal Cumulative Distribution Function (CDF).
 * P(X <= x) where X ~ Normal(mean, stdDev).
 */
export function normalCdf(x: number, mean: number, stdDev: number): number {
  if (!Number.isFinite(x)) return x < mean ? 0 : 1;
  if (stdDev <= 0) {
    return x >= mean ? 1 : 0;
  }
  const z = (x - mean) / (stdDev * Math.SQRT2);
  return 0.5 * (1 + erf(z));
}

/**
 * Inverse Normal Cumulative Distribution Function (Quantile / Probit function)
 * using Peter J. Acklam's rational approximation.
 * Computes x such that P(X <= x) = p for X ~ Normal(mean, stdDev).
 */
export function inverseNormalCdf(p: number, mean = 0, stdDev = 1): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (stdDev === 0) return mean;

  const a = [
    -3.969683028665376e1,
    2.209460984245205e2,
    -2.759285104469687e2,
    1.38357751867269e2,
    -3.066479806614716e1,
    2.506628277459239e0,
  ];

  const b = [
    -5.447609879822406e1,
    1.615858368580409e2,
    -1.556989798598866e2,
    6.680131188771972e1,
    -1.328068155288572e1,
  ];

  const c = [
    -7.784894002430293e-3,
    -3.223964580411365e-1,
    -2.400758277161838e0,
    -2.549732539343734e0,
    4.374664141464968e0,
    2.938163982698783e0,
  ];

  const d = [
    7.784695709041462e-3,
    3.224671290700398e-1,
    2.445134137142996e0,
    3.754408661907416e0,
  ];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let q: number;
  let r: number;
  let z: number;

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    z =
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    z =
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    z =
      -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }

  return mean + z * stdDev;
}

class Pert {
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

      let duration: number;
      let variance = 0;
      let stdDev = 0;
      let expectedDuration: number;

      const hasThreePoint =
        task.optimistic !== undefined ||
        task.mostLikely !== undefined ||
        task.pessimistic !== undefined;

      if (hasThreePoint) {
        const o = Number(task.optimistic);
        const m = Number(task.mostLikely);
        const p = Number(task.pessimistic);

        if (
          !Number.isFinite(o) ||
          !Number.isFinite(m) ||
          !Number.isFinite(p) ||
          o < 0 ||
          m < 0 ||
          p < 0
        ) {
          throw new Error(
            `Task "${task.key}": 3-point estimates must be finite numbers >= 0 (got o=${task.optimistic}, m=${task.mostLikely}, p=${task.pessimistic}).`
          );
        }
        if (o > m || m > p) {
          throw new Error(
            `Task "${task.key}": Invalid 3-point estimates. Must satisfy optimistic (${o}) <= mostLikely (${m}) <= pessimistic (${p}).`
          );
        }

        expectedDuration = (o + 4 * m + p) / 6;
        variance = Math.pow((p - o) / 6, 2);
        stdDev = Math.sqrt(variance);
        duration = expectedDuration;
      } else if (task.duration !== undefined) {
        const d = Number(task.duration);
        if (!Number.isFinite(d) || d < 0) {
          throw new Error(
            `Task "${task.key}": Duration must be a finite number >= 0. Got ${task.duration}.`
          );
        }
        duration = d;
        expectedDuration = d;
        variance = 0;
        stdDev = 0;
      } else {
        throw new Error(
          `Task "${task.key}": Must provide either 'duration' or 3-point estimates (optimistic, mostLikely, pessimistic).`
        );
      }

      const dependsOn =
        !task.dependsOn || task.dependsOn.length === 0
          ? [this.startTaskKey]
          : task.dependsOn;

      // Note: level is left undefined here so calcLevels correctly visits it
      this.tasksMap.set(task.key, {
        ...task,
        duration,
        expectedDuration,
        variance,
        stdDev,
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

    this.calcLevels();

    // Iterate levels in ascending order (topological order)
    const sortedLevelKeys = Array.from(this.levels.keys()).sort((a, b) => a - b);
    for (const lvl of sortedLevelKeys) {
      const keys = this.levels.get(lvl)!;
      for (const k of keys) {
        this.calculateEarlyTimes(k);
      }
    }

    // Find maximum early finish time across all tasks
    let maxEarlyFinish = 0;
    this.tasksMap.forEach((t) => {
      if (t.earlyFinish > maxEarlyFinish) {
        maxEarlyFinish = t.earlyFinish;
      }
    });

    this.projectDuration = maxEarlyFinish;

    // Terminal tasks are all tasks (excluding Start) that have no successors
    const terminalTaskKeys: string[] = [];
    this.tasksMap.forEach((t) => {
      if (t.key !== this.startTaskKey && this.getSuccessors(t).length === 0) {
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

    // Backward pass in reverse topological order (highest level down to 0)
    const reverseLevelKeys = Array.from(this.levels.keys()).sort((a, b) => b - a);
    for (const lvl of reverseLevelKeys) {
      const keys = this.levels.get(lvl) || [];
      for (const k of keys) {
        this.calculateLateTimes(k, this.projectDuration);
      }
    }

    this.levels.forEach((indices, key) => {
      this.levels.set(
        key,
        indices.sort((a, b) => this.tasksMap.get(a)!.index - this.tasksMap.get(b)!.index)
      );
    });
  }

  private getSuccessors(task: Task): Task[] {
    return Array.from(this.tasksMap.values()).filter(
      (t) => t.dependsOn && t.dependsOn.includes(task.key)
    );
  }

  private calculateEarlyTimes(k: string) {
    const task = this.tasksMap.get(k)!;
    if (!task.dependsOn || task.dependsOn.length === 0) {
      task.earlyStart = 0;
    } else {
      let maxFinishTime = 0;
      task.dependsOn.forEach((dependency) => {
        const dependencyTask = this.tasksMap.get(dependency)!;
        maxFinishTime = Math.max(
          maxFinishTime,
          dependencyTask.earlyStart + dependencyTask.duration
        );
      });
      task.earlyStart = maxFinishTime;
    }
    task.earlyFinish = task.earlyStart + task.duration;
  }

  private calculateLateTimes(k: string, projectDuration: number) {
    const task = this.tasksMap.get(k)!;
    const successors = this.getSuccessors(task);
    if (task.key !== this.lastTaskKey && successors.length === 0)
      this.tasksMap.get(this.lastTaskKey)!.dependsOn?.push(k);

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

  private calcLevels() {
    this.levels.clear();
    this.levels.set(0, [this.startTaskKey]);

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
          const dependencyTask = this.tasksMap.get(dependency);
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

      if (!this.levels.has(task.level)) {
        this.levels.set(task.level, []);
      }

      const levelArray = this.levels.get(task.level)!;
      if (!levelArray.includes(task.key)) {
        levelArray.push(task.key);
      }
    };

    this.tasksMap.forEach((task) => {
      if (task.level === undefined) {
        recStack.clear();
        calcLevel(task);
      }
    });
  }

  private calcNodeLinks() {
    const linkData: LinkType[] = [];
    const dependencies: string[] = [];

    this.tasksMap.forEach((task, key) => {
      if (task.dependsOn) {
        task.dependsOn.forEach((dependency) => {
          dependencies.push(dependency);
          const depTask = this.tasksMap.get(dependency);
          linkData.push({
            from: dependency,
            to: task.key,
            critical:
              task.critical &&
              (dependency === this.startTaskKey || (depTask?.critical ?? false)),
          });
        });
      } else if (key !== this.startTaskKey) {
        linkData.push({
          from: this.startTaskKey,
          to: task.key,
          critical: task.critical,
        });
      }
    });

    this.tasksMap.forEach((task) => {
      if (!dependencies.includes(task.key) && task.key !== this.lastTaskKey) {
        linkData.push({
          from: task.key,
          to: this.lastTaskKey,
          critical: task.critical,
        });
      }
    });

    this.links = linkData.sort((a, b) => Number(a.critical) - Number(b.critical));
  }

  private calcCriticalPaths() {
    this.calcNodeLinks();

    if (this.initialData.length === 0) {
      this.criticalPaths = [];
      this.projectVariance = 0;
      this.projectStdDev = 0;
      this.highestVariancePathNote = undefined;
      return;
    }

    const criticalPaths: CriticalPath[] = [];
    const startNodes = this.links.filter(
      (link) =>
        link.critical && link.from === this.startTaskKey && link.to !== this.lastTaskKey
    );

    startNodes.forEach((startNode) => {
      const path: LinkType[] = [startNode];

      const findPath = (node: LinkType) => {
        const nodeLinks = this.links.filter(
          (link) => link.critical && link.from === node.to && link.to !== this.lastTaskKey
        );
        if (nodeLinks.length === 0) {
          criticalPaths.push(
            path.map((p) => ({
              text: this.tasksMap.get(p.to)!.text,
              key: p.to,
            }))
          );
        } else {
          nodeLinks.forEach((nodeLink) => {
            path.push(nodeLink);
            findPath(nodeLink);
            path.pop();
          });
        }
      };

      findPath(startNode);
    });

    this.criticalPaths = criticalPaths;

    if (criticalPaths.length === 0) {
      this.projectVariance = 0;
      this.projectStdDev = 0;
      this.highestVariancePathNote = undefined;
      return;
    }

    let maxVariance = -1;
    let chosenPathIndex = 0;

    criticalPaths.forEach((path, idx) => {
      let pathVariance = 0;
      path.forEach((node) => {
        const task = this.tasksMap.get(node.key);
        if (task && node.key !== this.startTaskKey && node.key !== this.lastTaskKey) {
          pathVariance += task.variance;
        }
      });
      if (pathVariance > maxVariance) {
        maxVariance = pathVariance;
        chosenPathIndex = idx;
      }
    });

    this.projectVariance = Math.max(0, maxVariance);
    this.projectStdDev = Math.sqrt(this.projectVariance);

    if (criticalPaths.length > 1) {
      const chosenPathName = criticalPaths[chosenPathIndex].map((p) => p.text).join(" → ");
      this.highestVariancePathNote = `Multiple critical paths detected (${criticalPaths.length}). Path with highest variance selected: "${chosenPathName}" (variance: ${this.projectVariance.toFixed(2)}, σ: ${this.projectStdDev.toFixed(2)}).`;
    } else {
      this.highestVariancePathNote = undefined;
    }
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
