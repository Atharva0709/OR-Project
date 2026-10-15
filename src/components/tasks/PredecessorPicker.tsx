/**
 * Operations Research: Predecessor Selector Popover
 *
 * Provides a popover dropdown allowing users to select predecessor tasks
 * with live checkbox toggles and search/filtering.
 */

import { memo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TaskInput } from "@@/lib/main";
import { Plus, CheckCircle2 } from "lucide-react";

interface PredecessorPickerProps {
  currentTaskIndex: number;
  allTasks: TaskInput[];
  selectedDependencies: string[];
  onToggleDependency: (taskIndex: number, depKey: string) => void;
}

export const PredecessorPicker = memo(
  ({
    currentTaskIndex,
    allTasks,
    selectedDependencies,
    onToggleDependency,
  }: PredecessorPickerProps) => {
    const candidateTasks = allTasks.filter((_, idx) => idx !== currentTaskIndex);

    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs text-[#525252] hover:text-[#111111] hover:bg-neutral-100 border border-dashed border-[#bebebe] transition-colors focus:outline-none focus:ring-1 focus:ring-[#fa9000]"
          >
            <Plus className="w-3 h-3" />
            <span className="text-[11px]">Add Predecessor</span>
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          side="bottom"
          className="w-64 p-2 bg-white border border-[#d8d8d8] shadow-lg rounded-lg z-50"
        >
          <p className="text-xs font-semibold text-[#111111] px-2 py-1 border-b border-[#eeeeee]">
            Select Predecessor Tasks
          </p>

          <div className="max-h-48 overflow-y-auto py-1 divide-y divide-[#f5f5f5]">
            {candidateTasks.length === 0 ? (
              <p className="text-xs text-[#525252] p-2 text-center">
                No other tasks available yet.
              </p>
            ) : (
              candidateTasks.map((candidate) => {
                const isSelected = selectedDependencies.includes(candidate.key);
                return (
                  <button
                    key={candidate.key}
                    type="button"
                    onClick={() => onToggleDependency(currentTaskIndex, candidate.key)}
                    className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-left hover:bg-neutral-50 rounded transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#fa9000]">
                        {candidate.key}
                      </span>
                      <span className="text-[#111111] max-w-[130px] truncate">
                        {candidate.text}
                      </span>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#fa9000]" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);
