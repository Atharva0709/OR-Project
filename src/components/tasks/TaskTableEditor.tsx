/**
 * Operations Research: Task Table Editor
 *
 * Full data grid editor with sticky column headers, mode-dependent columns (CPM vs PERT),
 * empty state actions, and new row trigger.
 */

import { memo } from "react";
import { TaskInput } from "@@/lib/main";
import { TaskTableRow } from "./TaskTableRow";
import { UI_STRINGS } from "@/constants/strings";
import { Plus, Sparkles } from "lucide-react";

interface TaskTableEditorProps {
  tasks: TaskInput[];
  mode: "cpm" | "pert";
  onFieldChange: (index: number, field: keyof TaskInput, value: string | number) => void;
  onTogglePredecessor: (taskIndex: number, depKey: string) => void;
  onRemovePredecessor: (taskIndex: number, depKey: string) => void;
  onDeleteRow: (index: number) => void;
  onAddNewTask: () => void;
  onLoadExample: () => void;
}

export const TaskTableEditor = memo(
  ({
    tasks,
    mode,
    onFieldChange,
    onTogglePredecessor,
    onRemovePredecessor,
    onDeleteRow,
    onAddNewTask,
    onLoadExample,
  }: TaskTableEditorProps) => {
    return (
      <div className="flex-1 overflow-auto bg-white border border-[#d8d8d8] rounded-md shadow-inner m-3">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 bg-[#f5f5f5] text-[#111111] font-semibold border-b border-[#d8d8d8] z-10 shadow-sm">
            <tr>
              <th className="py-2.5 px-3 w-10 text-center text-[#525252]">#</th>
              <th className="py-2.5 px-3 w-28">{UI_STRINGS.drawer.columns.id}</th>
              <th className="py-2.5 px-3 w-52">{UI_STRINGS.drawer.columns.name}</th>

              {mode === "cpm" ? (
                <th className="py-2.5 px-3 w-32">{UI_STRINGS.drawer.columns.duration}</th>
              ) : (
                <>
                  <th className="py-2.5 px-2 w-20 text-center">
                    {UI_STRINGS.drawer.columns.optimistic}
                  </th>
                  <th className="py-2.5 px-2 w-20 text-center">
                    {UI_STRINGS.drawer.columns.mostLikely}
                  </th>
                  <th className="py-2.5 px-2 w-20 text-center">
                    {UI_STRINGS.drawer.columns.pessimistic}
                  </th>
                  <th className="py-2.5 px-2 w-24 text-center">
                    {UI_STRINGS.drawer.columns.expectedTe}
                  </th>
                </>
              )}

              <th className="py-2.5 px-3">{UI_STRINGS.drawer.columns.predecessors}</th>
              <th className="py-2.5 px-3 w-14 text-center">{UI_STRINGS.drawer.columns.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eeeeee]">
            {tasks.length === 0 ? (
              <tr>
                <td
                  colSpan={mode === "cpm" ? 6 : 9}
                  className="py-12 text-center text-[#525252]"
                >
                  <p className="font-semibold text-base text-[#111111]">
                    No tasks defined yet.
                  </p>
                  <p className="text-xs mt-1 text-[#525252]">
                    Click "Add Task" or "Load Example" above to get started.
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={onAddNewTask}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-[#fa9000] hover:bg-[#e08200]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add First Task
                    </button>
                    <button
                      type="button"
                      onClick={onLoadExample}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-[#111111] bg-neutral-100 hover:bg-neutral-200"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#fa9000]" />
                      Load Example
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              tasks.map((task, index) => (
                <TaskTableRow
                  key={index}
                  index={index}
                  task={task}
                  allTasks={tasks}
                  mode={mode}
                  onFieldChange={onFieldChange}
                  onTogglePredecessor={onTogglePredecessor}
                  onRemovePredecessor={onRemovePredecessor}
                  onDeleteRow={onDeleteRow}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  }
);
