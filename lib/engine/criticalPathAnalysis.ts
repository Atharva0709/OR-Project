/**
 * Operations Research: Critical Path Analysis & Variance Aggregation
 *
 * Traces all critical paths through the network where total float equals zero,
 * identifies multi-critical paths, and calculates total project variance
 * by summing variances along the most risky critical path.
 */

import { Task, LinkType, CriticalPath } from "../types/global.types";

export interface CriticalPathAnalysisResult {
  links: LinkType[];
  criticalPaths: CriticalPath[];
  projectVariance: number;
  projectStdDev: number;
  highestVariancePathNote?: string;
}

/**
 * Constructs directed links between tasks, tagging critical links.
 */
export function buildNetworkLinks(
  tasksMap: Map<string, Task>,
  startTaskKey: string,
  lastTaskKey: string
): LinkType[] {
  const linkData: LinkType[] = [];
  const dependencies: string[] = [];

  tasksMap.forEach((task, key) => {
    if (task.dependsOn) {
      task.dependsOn.forEach((dependency) => {
        dependencies.push(dependency);
        const depTask = tasksMap.get(dependency);
        linkData.push({
          from: dependency,
          to: task.key,
          critical:
            task.critical &&
            (dependency === startTaskKey || (depTask?.critical ?? false)),
        });
      });
    } else if (key !== startTaskKey) {
      linkData.push({
        from: startTaskKey,
        to: task.key,
        critical: task.critical,
      });
    }
  });

  tasksMap.forEach((task) => {
    if (!dependencies.includes(task.key) && task.key !== lastTaskKey) {
      linkData.push({
        from: task.key,
        to: lastTaskKey,
        critical: task.critical,
      });
    }
  });

  return linkData.sort((a, b) => Number(a.critical) - Number(b.critical));
}

/**
 * Traces all critical paths and calculates project variance.
 */
export function analyzeCriticalPaths(
  tasksMap: Map<string, Task>,
  links: LinkType[],
  startTaskKey: string,
  lastTaskKey: string,
  initialDataLength: number
): CriticalPathAnalysisResult {
  if (initialDataLength === 0) {
    return {
      links,
      criticalPaths: [],
      projectVariance: 0,
      projectStdDev: 0,
      highestVariancePathNote: undefined,
    };
  }

  const criticalPaths: CriticalPath[] = [];
  const startNodes = links.filter(
    (link) => link.critical && link.from === startTaskKey && link.to !== lastTaskKey
  );

  startNodes.forEach((startNode) => {
    const path: LinkType[] = [startNode];

    const findPath = (node: LinkType) => {
      const nodeLinks = links.filter(
        (link) => link.critical && link.from === node.to && link.to !== lastTaskKey
      );
      if (nodeLinks.length === 0) {
        criticalPaths.push(
          path.map((p) => ({
            text: tasksMap.get(p.to)!.text,
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

  if (criticalPaths.length === 0) {
    return {
      links,
      criticalPaths: [],
      projectVariance: 0,
      projectStdDev: 0,
      highestVariancePathNote: undefined,
    };
  }

  let maxVariance = -1;
  let chosenPathIndex = 0;

  criticalPaths.forEach((path, idx) => {
    let pathVariance = 0;
    path.forEach((node) => {
      const task = tasksMap.get(node.key);
      if (task && node.key !== startTaskKey && node.key !== lastTaskKey) {
        pathVariance += task.variance;
      }
    });
    if (pathVariance > maxVariance) {
      maxVariance = pathVariance;
      chosenPathIndex = idx;
    }
  });

  const projectVariance = Math.max(0, maxVariance);
  const projectStdDev = Math.sqrt(projectVariance);

  let highestVariancePathNote: string | undefined;
  if (criticalPaths.length > 1) {
    const chosenPathName = criticalPaths[chosenPathIndex].map((p) => p.text).join(" → ");
    highestVariancePathNote = `Multiple critical paths detected (${criticalPaths.length}). Path with highest variance selected: "${chosenPathName}" (variance: ${projectVariance.toFixed(2)}, σ: ${projectStdDev.toFixed(2)}).`;
  }

  return {
    links,
    criticalPaths,
    projectVariance,
    projectStdDev,
    highestVariancePathNote,
  };
}
