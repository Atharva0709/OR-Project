/**
 * Operations Research: Project Metrics KPI Card
 *
 * Displays expected project duration, total variance, and standard deviation.
 */

import { memo } from "react";
import { SectionEyebrow } from "./SectionEyebrow";
import { UI_STRINGS } from "@/constants/strings";

interface ProjectMetricsCardProps {
  projectDuration: number;
  projectVariance: number;
  projectStdDev: number;
}

export const ProjectMetricsCard = memo(
  ({ projectDuration, projectVariance, projectStdDev }: ProjectMetricsCardProps) => {
    return (
      <div className="pt-4">
        <SectionEyebrow label={UI_STRINGS.sidebar.sections.projectMetrics} />
        <div className="grid grid-cols-1 gap-2 mt-2">
          <div className="flex justify-between items-center py-1 border-b border-[#d8d8d8]/60">
            <span className="text-xs text-[#404040]">
              {UI_STRINGS.sidebar.labels.expectedDuration}:
            </span>
            <span className="text-sm font-bold text-[#111111]">
              {projectDuration.toFixed(2)} days
            </span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-[#d8d8d8]/60">
            <span className="text-xs text-[#404040]">
              {UI_STRINGS.sidebar.labels.projectVariance}:
            </span>
            <span className="text-sm font-mono font-medium text-[#111111]">
              {projectVariance.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-[#d8d8d8]/60">
            <span className="text-xs text-[#404040]">
              {UI_STRINGS.sidebar.labels.projectStdDev}:
            </span>
            <span className="text-sm font-mono font-medium text-[#111111]">
              ± {projectStdDev.toFixed(2)} days
            </span>
          </div>
        </div>
      </div>
    );
  }
);
