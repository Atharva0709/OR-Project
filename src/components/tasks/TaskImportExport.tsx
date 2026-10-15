/**
 * Operations Research: Task Import / Export & Preset Toolbar
 *
 * Provides actions to add tasks, load CPM/PERT presets, download JSON backups,
 * upload JSON files, and reset task matrices.
 */

import { memo } from "react";
import { Plus, RotateCcw, Sparkles, Download, Upload } from "lucide-react";
import { UI_STRINGS } from "@/constants/strings";

interface TaskImportExportProps {
  taskCount: number;
  fileInputId: string;
  onAddNewTask: () => void;
  onLoadCpmExample: () => void;
  onLoadPertExample: () => void;
  onExportJson: () => void;
  onImportFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearAll: () => void;
}

export const TaskImportExport = memo(
  ({
    taskCount,
    fileInputId,
    onAddNewTask,
    onLoadCpmExample,
    onLoadPertExample,
    onExportJson,
    onImportFile,
    onClearAll,
  }: TaskImportExportProps) => {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
        {/* Left actions: Add & Preset Loaders */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onAddNewTask}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white bg-[#fa9000] hover:bg-[#e08200] transition-colors shadow-sm active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#fa9000]"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            {UI_STRINGS.drawer.addTaskButton}
          </button>
          <button
            type="button"
            onClick={onLoadCpmExample}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-[#404040] border border-[#d8d8d8] hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#fa9000]"
            title="Load deterministic CPM sample project"
          >
            <RotateCcw className="w-3 h-3" />
            Load CPM Example
          </button>
          <button
            type="button"
            onClick={onLoadPertExample}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-[#404040] border border-[#d8d8d8] hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#fa9000]"
            title="Load 3-point estimation (O, M, P) PERT project"
          >
            <Sparkles className="w-3 h-3 text-[#fa9000]" />
            Load PERT Example
          </button>
        </div>

        {/* Right actions: Export, Import, Clear */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExportJson}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-[#404040] border border-[#d8d8d8] hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#fa9000]"
            title="Export tasks to JSON file"
          >
            <Download className="w-3 h-3" />
            Export
          </button>

          <label
            htmlFor={fileInputId}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-[#404040] border border-[#d8d8d8] hover:bg-neutral-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#fa9000]"
            title="Import tasks from JSON file"
          >
            <Upload className="w-3 h-3" />
            Import
          </label>
          <input
            id={fileInputId}
            type="file"
            accept=".json"
            className="hidden"
            onChange={onImportFile}
          />

          {taskCount > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs text-[#525252] hover:text-[#c31833] transition-colors underline-offset-2 hover:underline ml-2"
            >
              {UI_STRINGS.drawer.clearAllButton}
            </button>
          )}
        </div>
      </div>
    );
  }
);
