/**
 * Operations Research: Task Table Row Component
 *
 * Renders individual task rows with inline inputs for key, name, durations,
 * predecessor tag management, and delete actions.
 */

import { memo } from "react";
import { TaskInput } from "@@/lib/main";
import { PredecessorPicker } from "./PredecessorPicker";
import { Trash2, X } from "lucide-react";

interface TaskTableRowProps {
  index: number;
  task: TaskInput;
  allTasks: TaskInput[];
  mode: "cpm" | "pert";
  onFieldChange: (index: number, field: keyof TaskInput, value: string | number) => void;
  onTogglePredecessor: (taskIndex: number, depKey: string) => void;
  onRemovePredecessor: (taskIndex: number, depKey: string) => void;
  onDeleteRow: (index: number) => void;
}

export const TaskTableRow = memo(
  ({
    index,
    task,
    allTasks,
    mode,
    onFieldChange,
    onTogglePredecessor,
    onRemovePredecessor,
    onDeleteRow,
  }: TaskTableRowProps) => {
    // Real-time calculated te for 3-point estimation
    const o = Number(task.optimistic ?? 0);
    const m = Number(task.mostLikely ?? 0);
    const p = Number(task.pessimistic ?? 0);
    const teCalc = (o + 4 * m + p) / 6;

    return (
      <tr className="hover:bg-[#fafafa] transition-colors group">
        {/* Row # */}
        <td className="py-2 px-3 text-center text-xs font-mono text-[#525252]">
          {index + 1}
        </td>

        {/* Task ID */}
        <td className="py-2 px-3">
          <input
            type="text"
            value={task.key}
            placeholder="e.g. 1, A"
            aria-label={`Task ID for row ${index + 1}`}
            onChange={(e) => onFieldChange(index, "key", e.target.value)}
            className="w-full px-2 py-1 text-xs font-mono rounded border border-[#d8d8d8] bg-white hover:border-[#bebebe] outline-none focus:ring-1 focus:ring-[#fa9000]"
          />
        </td>

        {/* Task Name */}
        <td className="py-2 px-3">
          <input
            type="text"
            value={task.text}
            placeholder="Task Name"
            aria-label={`Task Name for row ${index + 1}`}
            onChange={(e) => onFieldChange(index, "text", e.target.value)}
            className="w-full px-2 py-1 text-xs rounded border border-[#d8d8d8] bg-white hover:border-[#bebebe] outline-none focus:ring-1 focus:ring-[#fa9000]"
          />
        </td>

        {/* Duration fields */}
        {mode === "cpm" ? (
          <td className="py-2 px-3">
            <input
              type="number"
              min="0"
              step="any"
              value={task.duration ?? ""}
              placeholder="0"
              aria-label={`Duration for task ${task.key}`}
              onChange={(e) => onFieldChange(index, "duration", e.target.value)}
              className="w-full px-2 py-1 text-xs rounded border border-[#d8d8d8] bg-white hover:border-[#bebebe] outline-none focus:ring-1 focus:ring-[#fa9000]"
            />
          </td>
        ) : (
          <>
            <td className="py-2 px-1">
              <input
                type="number"
                min="0"
                step="any"
                value={task.optimistic ?? ""}
                placeholder="O"
                aria-label={`Optimistic estimate for task ${task.key}`}
                onChange={(e) => onFieldChange(index, "optimistic", e.target.value)}
                className="w-full px-1.5 py-1 text-xs text-center rounded border border-[#d8d8d8] bg-white hover:border-[#bebebe] outline-none focus:ring-1 focus:ring-[#fa9000]"
              />
            </td>
            <td className="py-2 px-1">
              <input
                type="number"
                min="0"
                step="any"
                value={task.mostLikely ?? ""}
                placeholder="M"
                aria-label={`Most likely estimate for task ${task.key}`}
                onChange={(e) => onFieldChange(index, "mostLikely", e.target.value)}
                className="w-full px-1.5 py-1 text-xs text-center rounded border border-[#d8d8d8] bg-white hover:border-[#bebebe] outline-none focus:ring-1 focus:ring-[#fa9000]"
              />
            </td>
            <td className="py-2 px-1">
              <input
                type="number"
                min="0"
                step="any"
                value={task.pessimistic ?? ""}
                placeholder="P"
                aria-label={`Pessimistic estimate for task ${task.key}`}
                onChange={(e) => onFieldChange(index, "pessimistic", e.target.value)}
                className="w-full px-1.5 py-1 text-xs text-center rounded border border-[#d8d8d8] bg-white hover:border-[#bebebe] outline-none focus:ring-1 focus:ring-[#fa9000]"
              />
            </td>
            <td className="py-2 px-2 text-center font-mono font-bold text-xs text-[#111111] bg-neutral-50 rounded">
              {Number.isFinite(teCalc) ? teCalc.toFixed(2) : "—"}
            </td>
          </>
        )}

        {/* Predecessors */}
        <td className="py-2 px-3">
          <div className="flex flex-wrap items-center gap-1.5 min-h-[30px]">
            {(task.dependsOn || []).map((depKey) => {
              const depTask = allTasks.find((t) => t.key === depKey);
              return (
                <span
                  key={depKey}
                  className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full text-xs font-mono bg-neutral-100 text-[#111111] border border-[#d8d8d8]"
                >
                  <span className="font-semibold text-[#fa9000]">{depKey}</span>
                  {depTask?.text && (
                    <span className="text-[#525252] text-[10px] max-w-[80px] truncate">
                      ({depTask.text})
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onRemovePredecessor(index, depKey)}
                    className="p-0.5 hover:bg-[#d8d8d8] rounded-full text-[#525252] hover:text-[#c31833] focus:outline-none"
                    aria-label={`Remove predecessor ${depKey}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}

            <PredecessorPicker
              currentTaskIndex={index}
              allTasks={allTasks}
              selectedDependencies={task.dependsOn || []}
              onToggleDependency={onTogglePredecessor}
            />
          </div>
        </td>

        {/* Delete Row Action */}
        <td className="py-2 px-3 text-center">
          <button
            type="button"
            onClick={() => onDeleteRow(index)}
            aria-label={`Delete task ${task.key || index + 1}`}
            className="p-1.5 text-[#525252] hover:text-[#c31833] hover:bg-[#fdf2f2] rounded transition-colors focus:outline-none"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </td>
      </tr>
    );
  }
);
