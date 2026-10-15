/**
 * Operations Research: 3-Point PERT Estimation Engine
 *
 * Implements Beta distribution approximations:
 * - Expected Duration: te = (o + 4m + p) / 6
 * - Variance: sigma^2 = ((p - o) / 6)^2
 * - Standard Deviation: sigma = sqrt(variance)
 */

import { TaskInput } from "../types/global.types";

export interface PertEstimates {
  duration: number;
  expectedDuration: number;
  variance: number;
  stdDev: number;
}

/**
 * Validates and extracts duration estimates for a task.
 * Handles both deterministic CPM duration and probabilistic 3-point estimates.
 */
export function extractTaskEstimates(task: TaskInput): PertEstimates {
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

    const expectedDuration = (o + 4 * m + p) / 6;
    const variance = Math.pow((p - o) / 6, 2);
    const stdDev = Math.sqrt(variance);

    return {
      duration: expectedDuration,
      expectedDuration,
      variance,
      stdDev,
    };
  }

  if (task.duration !== undefined) {
    const d = Number(task.duration);
    if (!Number.isFinite(d) || d < 0) {
      throw new Error(
        `Task "${task.key}": Duration must be a finite number >= 0. Got ${task.duration}.`
      );
    }
    return {
      duration: d,
      expectedDuration: d,
      variance: 0,
      stdDev: 0,
    };
  }

  throw new Error(
    `Task "${task.key}": Must provide either 'duration' or 3-point estimates (optimistic, mostLikely, pessimistic).`
  );
}
