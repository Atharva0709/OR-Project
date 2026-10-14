import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { TaskInput, PertOptions } from "../types/global.types.ts";
import {
  InternalPertResultType,
  InternalPertContextType,
  PertDataType,
} from "../types/pert.types.ts";
import PertCalculator from "../utlis/Pert.ts";

const EMPTY_RESULT: InternalPertResultType = {
  tasks: new Map(),
  levels: new Map(),
  links: [],
  criticalPaths: [],
  projectDuration: 0,
  projectVariance: 0,
  projectStdDev: 0,
  highestVariancePathNote: undefined,
};

const pertContext = createContext<InternalPertContextType | null>(null);
const internalPertContext = createContext<InternalPertContextType | null>(null);

const createPertProvider = (Context: React.Context<InternalPertContextType | null>) => {
  return function PertProviderComponent({ children }: { children: ReactNode }) {
    const [pertData, setPertResults] = useState<InternalPertResultType>(EMPTY_RESULT);
    const [error, setError] = useState<string | null>(null);

    const calculatePertResults = useCallback((data: TaskInput[]) => {
      try {
        const results: InternalPertResultType = new PertCalculator(data).solve();
        setPertResults(results);
        setError(null);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setPertResults(EMPTY_RESULT);
        setError(msg);
      }
    }, []);

    return (
      <Context.Provider
        value={{
          pertData,
          calculatePertResults,
          error,
        }}
      >
        {children}
      </Context.Provider>
    );
  };
};

export const PertProvider = createPertProvider(pertContext);
export const InternalPertProvider = createPertProvider(internalPertContext);

export const usePert = (options: PertOptions = { bounds: true }) => {
  const context = useContext(pertContext);
  if (!context) {
    throw new Error("usePertData must be used within a PertProvider");
  }
  const tasksArr = Array.from(context.pertData.tasks.values());
  const startKey = tasksArr.length > 0 ? tasksArr[0].key : undefined;

  // bounds: true includes Start and Finish; bounds: false strips them
  const tasks =
    options?.bounds === false
      ? tasksArr.length > 2
        ? tasksArr.slice(1, -1).map((task) => ({
            ...task,
            dependsOn:
              startKey && task.dependsOn
                ? task.dependsOn.filter((k) => k !== startKey)
                : task.dependsOn,
          }))
        : []
      : tasksArr;

  return {
    ...context.pertData,
    tasks,
    error: context.error,
    projectDuration: context.pertData.projectDuration,
    projectVariance: context.pertData.projectVariance,
    projectStdDev: context.pertData.projectStdDev,
    highestVariancePathNote: context.pertData.highestVariancePathNote,
  } as PertDataType;
};

export const usePertContext = () => {
  const context = useContext(pertContext);
  const internalContext = useContext(internalPertContext);
  const active = context ?? internalContext;

  if (!active) {
    throw new Error(
      "usePertData must be used within a PertProvider or InternalPertProvider"
    );
  }
  return active;
};
