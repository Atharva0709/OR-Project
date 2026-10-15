/**
 * Operations Research: Task Parameter Inspector
 *
 * Provides real-time lookup and parameter analysis for any individual task,
 * displaying ES, EF, LS, LF, Total Float, Free Float, 3-point estimates, and criticality.
 */

import { memo, useId } from "react";
import { setSelectedTask, Task } from "@@/lib/main";
import { SectionEyebrow } from "./SectionEyebrow";
import { UI_STRINGS } from "@/constants/strings";

interface TaskInspectorProps {
  selectedTask: Task | null;
}

export const TaskInspector = memo(({ selectedTask }: TaskInspectorProps) => {
  const taskKeyInputId = useId();

  return (
    <div className="space-y-4">
      {/* Task Selection by Key Input */}
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
                  {selectedTask.critical
                    ? UI_STRINGS.sidebar.labels.yes
                    : UI_STRINGS.sidebar.labels.no}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
