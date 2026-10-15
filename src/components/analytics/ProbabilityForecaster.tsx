/**
 * Operations Research: PERT Risk & Probability Forecaster
 *
 * Computes:
 * 1. Probability of project completion by a target deadline P(T <= D)
 * 2. Required project duration for a desired confidence level (Quantile / Probit)
 */

import { memo, useId } from "react";
import { SectionEyebrow } from "./SectionEyebrow";
import { UI_STRINGS } from "@/constants/strings";
import { normalCdf, inverseNormalCdf } from "@@/lib/main";
import { Clock, Target } from "lucide-react";

interface ProbabilityForecasterProps {
  projectDuration: number;
  projectStdDev: number;
  deadline: number | null;
  setDeadline: (val: number | null) => void;
  targetProbability: number | null;
  setTargetProbability: (val: number | null) => void;
}

export const ProbabilityForecaster = memo(
  ({
    projectDuration,
    projectStdDev,
    deadline,
    setDeadline,
    targetProbability,
    setTargetProbability,
  }: ProbabilityForecasterProps) => {
    const deadlineInputId = useId();
    const targetProbInputId = useId();

    const onTimeProbability =
      deadline !== null && !isNaN(deadline)
        ? normalCdf(deadline, projectDuration, projectStdDev)
        : null;

    const normalizedProb =
      targetProbability !== null && !isNaN(targetProbability)
        ? targetProbability > 1
          ? targetProbability / 100
          : targetProbability
        : null;

    const requiredDuration =
      normalizedProb !== null && normalizedProb > 0 && normalizedProb < 1
        ? inverseNormalCdf(normalizedProb, projectDuration, projectStdDev)
        : null;

    return (
      <div>
        <SectionEyebrow label={UI_STRINGS.sidebar.sections.riskForecasting} />

        {/* 1. Target Deadline Input */}
        <div className="space-y-1.5 mb-3">
          <label
            htmlFor={deadlineInputId}
            className="text-xs font-medium text-[#111111] flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-[#404040]" />
            {UI_STRINGS.sidebar.labels.deadlineInput}
          </label>
          <input
            id={deadlineInputId}
            type="number"
            min={0}
            step="any"
            placeholder="e.g. 15 (days)"
            value={deadline ?? ""}
            onChange={(e) => {
              const val = e.target.value.trim();
              setDeadline(val === "" ? null : Number(val));
            }}
            className="w-full bg-white border border-[#9e9e9e] rounded-full px-3.5 py-1.5 text-xs text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#fa9000]"
          />
          {onTimeProbability !== null && (
            <div className="p-2 rounded bg-neutral-100/90 border border-[#d8d8d8] text-xs">
              <span className="text-[#525252] block text-[11px]">
                {UI_STRINGS.sidebar.labels.deadlineProbOutput}:
              </span>
              <span className="text-sm font-bold text-[#111111]">
                {(onTimeProbability * 100).toFixed(1)}%
              </span>
              <span className="text-[11px] text-[#525252] ml-2">
                (Z = {((deadline! - projectDuration) / (projectStdDev || 1)).toFixed(2)})
              </span>
            </div>
          )}
        </div>

        {/* 2. Target Probability Input */}
        <div className="space-y-1.5">
          <label
            htmlFor={targetProbInputId}
            className="text-xs font-medium text-[#111111] flex items-center gap-1.5"
          >
            <Target className="w-3.5 h-3.5 text-[#404040]" />
            {UI_STRINGS.sidebar.labels.targetProbInput}
          </label>
          <input
            id={targetProbInputId}
            type="number"
            min={1}
            max={99.9}
            step="any"
            placeholder="e.g. 95 (%)"
            value={targetProbability ?? ""}
            onChange={(e) => {
              const val = e.target.value.trim();
              setTargetProbability(val === "" ? null : Number(val));
            }}
            className="w-full bg-white border border-[#9e9e9e] rounded-full px-3.5 py-1.5 text-xs text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#fa9000]"
          />
          {requiredDuration !== null && (
            <div className="p-2 rounded bg-neutral-100/90 border border-[#d8d8d8] text-xs">
              <span className="text-[#525252] block text-[11px]">
                {UI_STRINGS.sidebar.labels.requiredDurationOutput}:
              </span>
              <span className="text-sm font-bold text-[#111111]">
                {requiredDuration.toFixed(2)} days
              </span>
              <span className="text-[11px] text-[#525252] ml-2">
                (at {(normalizedProb! * 100).toFixed(0)}% confidence)
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
);
