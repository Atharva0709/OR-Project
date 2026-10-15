/**
 * Operations Research: Analytics & Details Dashboard Feature Orchestrator
 *
 * Combines project KPIs, critical path inspection, Gaussian probability forecasting,
 * task parameter inspector, and full schedule matrix.
 */

import { memo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePert, Task } from "@@/lib/main";
import { Separator } from "@/components/ui/separator";
import { THEME } from "@/constants/theme";
import { ProjectMetricsCard } from "./ProjectMetricsCard";
import { CriticalPathInspector } from "./CriticalPathInspector";
import { ProbabilityForecaster } from "./ProbabilityForecaster";
import { TaskInspector } from "./TaskInspector";
import { ScheduleTable } from "./ScheduleTable";

export interface PertDetailsProps {
  selectedTask: Task | null;
  deadline: number | null;
  setDeadline: (val: number | null) => void;
  targetProbability: number | null;
  setTargetProbability: (val: number | null) => void;
}

export const PertDetails = memo(
  ({
    selectedTask,
    deadline,
    setDeadline,
    targetProbability,
    setTargetProbability,
  }: PertDetailsProps) => {
    const {
      projectDuration,
      projectVariance,
      projectStdDev,
      criticalPaths,
      highestVariancePathNote,
    } = usePert();

    return (
      <ScrollArea className="h-[calc(100dvh-56px-44px)] px-4 pb-6">
        {/* 1. Project High-Level KPIs */}
        <ProjectMetricsCard
          projectDuration={projectDuration}
          projectVariance={projectVariance}
          projectStdDev={projectStdDev}
        />

        <Separator className="my-4" style={{ backgroundColor: THEME.colors.border }} />

        {/* 2. Critical Paths & Risk */}
        <CriticalPathInspector
          criticalPaths={criticalPaths}
          highestVariancePathNote={highestVariancePathNote}
        />

        <Separator className="my-4" style={{ backgroundColor: THEME.colors.border }} />

        {/* 3. PERT Risk & Probability Forecasting */}
        <ProbabilityForecaster
          projectDuration={projectDuration}
          projectStdDev={projectStdDev}
          deadline={deadline}
          setDeadline={setDeadline}
          targetProbability={targetProbability}
          setTargetProbability={setTargetProbability}
        />

        <Separator className="my-4" style={{ backgroundColor: THEME.colors.border }} />

        {/* 4. Task Inspector & Lookup */}
        <TaskInspector selectedTask={selectedTask} />

        <Separator className="my-4" style={{ backgroundColor: THEME.colors.border }} />

        {/* 5. Complete Schedule Matrix Table */}
        <ScheduleTable />
      </ScrollArea>
    );
  }
);
