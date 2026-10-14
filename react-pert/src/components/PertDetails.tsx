import { memo, useId } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePert, setSelectedTask, Task, normalCdf, inverseNormalCdf } from "@@/lib/main";
import { Separator } from "@/components/ui/separator";
import { THEME } from "@/constants/theme";
import { UI_STRINGS } from "@/constants/strings";
import { AlertCircle, Target, Clock } from "lucide-react";

/** Section eyebrow label with theme bar */
function SectionEyebrow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div
        style={{
          width: THEME.dimensions.eyebrowBarWidth,
          height: 16,
          backgroundColor: THEME.colors.primary,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: THEME.typography.fontFamily,
          fontSize: THEME.typography.fontSizeXs,
          fontWeight: 700,
          color: THEME.colors.inkMuted,
          textTransform: "uppercase",
          letterSpacing: 1.2,
        }}
      >
        {label}
      </span>
    </div>
  );
}

interface PertDetailsProps {
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

    const taskKeyInputId = useId();
    const deadlineInputId = useId();
    const targetProbInputId = useId();

    // Probabilistic Calculations
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
      <ScrollArea className="h-[calc(100dvh-56px-44px)] px-4 pb-6">
        {/* Project Metrics */}
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

        <Separator className="my-4" style={{ backgroundColor: THEME.colors.border }} />

        {/* Critical Paths */}
        <div>
          <SectionEyebrow label={UI_STRINGS.sidebar.labels.criticalPaths} />
          {criticalPaths.length === 0 ? (
            <p className="text-xs text-[#525252]">No critical path identified.</p>
          ) : (
            <ul className="text-xs text-[#111111] space-y-2 mt-1">
              {criticalPaths.map((cp, index) => (
                <li key={index} className="p-2 rounded bg-neutral-50 border border-[#d8d8d8]/60">
                  <span className="font-semibold text-[#fa9000] mr-1.5">Path #{index + 1}:</span>
                  {cp.map((p, i) => (
                    <span key={i}>
                      <button
                        type="button"
                        onClick={() => setSelectedTask(p.key)}
                        className="font-medium hover:underline focus:outline-none focus:ring-1 focus:ring-[#fa9000]"
                      >
                        {p.text}
                      </button>
                      {i < cp.length - 1 && <span className="text-[#9e9e9e] mx-1">→</span>}
                    </span>
                  ))}
                </li>
              ))}
            </ul>
          )}

          {highestVariancePathNote && (
            <div className="mt-2.5 p-2 rounded bg-amber-50/80 border border-amber-200 flex items-start gap-1.5 text-[11px] text-amber-900 leading-snug">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>{highestVariancePathNote}</span>
            </div>
          )}
        </div>

        <Separator className="my-4" style={{ backgroundColor: THEME.colors.border }} />

        {/* PERT Risk Forecasting */}
        <div>
          <SectionEyebrow label={UI_STRINGS.sidebar.sections.riskForecasting} />

          {/* 1. User Deadline Input */}
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

        <Separator className="my-4" style={{ backgroundColor: THEME.colors.border }} />

        {/* Task Selection by Key */}
        <div>
          <SectionEyebrow label={UI_STRINGS.sidebar.sections.taskLookup} />
          <label htmlFor={taskKeyInputId} className="sr-only">
            {UI_STRINGS.sidebar.labels.taskKeyInput}
          </label>
          <input
            id={taskKeyInputId}
            type="text"
            placeholder={UI_STRINGS.sidebar.labels.taskKeyInput}
            onChange={(e) => setSelectedTask(e.target.value.trim() || null)}
            className="w-full bg-white border border-[#9e9e9e] rounded-full px-3.5 py-1.5 text-xs text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#fa9000]"
          />
        </div>

        <Separator className="my-4" style={{ backgroundColor: THEME.colors.border }} />

        {/* Selected Task Details */}
        <div>
          <SectionEyebrow label={UI_STRINGS.sidebar.sections.selectedTask} />
          {!selectedTask ? (
            <p className="text-xs text-[#525252] leading-relaxed">
              {UI_STRINGS.sidebar.labels.clickTaskToSelect}
            </p>
          ) : (
            <div className="space-y-2 text-xs text-[#111111]">
              <div className="p-2.5 rounded bg-neutral-50 border border-[#d8d8d8]">
                <p className="font-bold text-sm text-[#111111] mb-1">{selectedTask.text}</p>
                <p className="text-[11px] text-[#525252]">Key: {selectedTask.key}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-white border border-[#d8d8d8]/80">
                  <span className="text-[10px] text-[#525252] block uppercase tracking-wider">
                    Expected te
                  </span>
                  <span className="font-bold text-sm text-[#111111]">
                    {selectedTask.duration.toFixed(2)} d
                  </span>
                </div>
                <div className="p-2 rounded bg-white border border-[#d8d8d8]/80">
                  <span className="text-[10px] text-[#525252] block uppercase tracking-wider">
                    Variance σ²
                  </span>
                  <span className="font-mono font-medium text-xs text-[#111111]">
                    {selectedTask.variance.toFixed(2)}
                  </span>
                </div>
              </div>

              {selectedTask.optimistic !== undefined && (
                <div className="p-2 rounded bg-neutral-50 border border-[#d8d8d8]/80 text-[11px] space-y-1">
                  <p className="font-semibold text-[#404040]">3-Point Estimates:</p>
                  <div className="grid grid-cols-3 gap-1 text-center">
                    <span className="bg-white p-1 rounded border border-[#d8d8d8]">
                      O: {selectedTask.optimistic}
                    </span>
                    <span className="bg-white p-1 rounded border border-[#d8d8d8]">
                      M: {selectedTask.mostLikely}
                    </span>
                    <span className="bg-white p-1 rounded border border-[#d8d8d8]">
                      P: {selectedTask.pessimistic}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-1 pt-1 border-t border-[#d8d8d8]/60 text-xs">
                <p className="flex justify-between">
                  <span className="text-[#525252]">Depends on:</span>
                  <span className="font-medium">
                    {selectedTask.dependsOn && selectedTask.dependsOn.length > 0
                      ? selectedTask.dependsOn.join(", ")
                      : "None (Start Node)"}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-[#525252]">Early Start / Finish:</span>
                  <span className="font-medium">
                    {selectedTask.earlyStart} → {selectedTask.earlyFinish}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-[#525252]">Late Start / Finish:</span>
                  <span className="font-medium">
                    {selectedTask.lateStart} → {selectedTask.lateFinish}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-[#525252]">Total Float:</span>
                  <span className="font-medium">{selectedTask.totalFloat} days</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-[#525252]">Free Float:</span>
                  <span className="font-medium">{selectedTask.freeFloat} days</span>
                </p>
                <p className="flex justify-between items-center pt-1">
                  <span className="text-[#525252]">Critical Task:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      selectedTask.critical
                        ? "bg-red-50 text-[#c31833] border border-red-200"
                        : "bg-neutral-100 text-[#404040]"
                    }`}
                  >
                    {selectedTask.critical ? UI_STRINGS.sidebar.labels.yes : UI_STRINGS.sidebar.labels.no}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    );
  }
);
