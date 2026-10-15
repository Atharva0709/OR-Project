export type TaskInput = {
  key: string;
  text: string;
  duration?: number;
  optimistic?: number;
  mostLikely?: number;
  pessimistic?: number;
  dependsOn?: string[];
};

export type Task = {
  key: string;
  text: string;
  duration: number;
  expectedDuration: number;
  variance: number;
  stdDev: number;
  optimistic?: number;
  mostLikely?: number;
  pessimistic?: number;
  dependsOn?: string[];
  earlyStart: number;
  earlyFinish: number;
  lateStart: number;
  lateFinish: number;
  level: number;
  critical: boolean;
  freeFloat: number;
  totalFloat: number;
  index: number;
};

export type LevelType = Map<number, string[]>;

export type LinkType = {
  from: string;
  to: string;
  critical: boolean;
};

type PathItem = {
  text: string;
  key: string;
};

export type CriticalPath = PathItem[];

export interface PertOptions {
  /**
   * Determines whether the boundary tasks (Start and Finish) should be included in the returned tasks.
   * - If `true`, the Start and Finish tasks will be included.
   * - If `false`, the Start and Finish tasks will be excluded.
   * @type {boolean}
   * @default true
   */
  bounds?: boolean;
}
