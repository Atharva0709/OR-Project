/**
 * Operations Research: Tasks Drawer Feature Orchestrator
 *
 * Coordinates tabular editing, 3-point estimation parameters,
 * JSON code representation, dependency management, and acyclic DAG validation.
 */

import { memo, useState, useEffect, useCallback, useId } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { TaskInput } from "@@/lib/main";
import { cpmExampleTasks, pertExampleTasks } from "@/constants/examples";
import { THEME } from "@/constants/theme";
import { UI_STRINGS } from "@/constants/strings";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { validateTasksList } from "./taskValidation";
import { getNextKeyAndName } from "./taskKeyGenerator";
import { TaskEditorHeader } from "./TaskEditorHeader";
import { TaskImportExport } from "./TaskImportExport";
import { TaskTableEditor } from "./TaskTableEditor";
import { TaskJsonEditor } from "./TaskJsonEditor";

export interface TasksDrawerProps {
  tasks?: TaskInput[];
  setTasks: (tasks: TaskInput[]) => void;
  estimationMode?: "cpm" | "pert";
  onEstimationModeChange?: (mode: "cpm" | "pert") => void;
}

export const TasksDrawer = memo(
  ({
    tasks = [],
    setTasks,
    estimationMode = "cpm",
    onEstimationModeChange,
  }: TasksDrawerProps) => {
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"table" | "json">("table");
    const [mode, setMode] = useState<"cpm" | "pert">(estimationMode);
    const [editableTasks, setEditableTasks] = useState<TaskInput[]>([]);
    const [jsonText, setJsonText] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const fileInputId = useId();

    // Synchronize on drawer open or mode change
    useEffect(() => {
      if (open) {
        const cloned: TaskInput[] = tasks.map((t) => ({
          key: t.key,
          text: t.text,
          duration: t.duration !== undefined ? Number(t.duration) : undefined,
          optimistic: t.optimistic !== undefined ? Number(t.optimistic) : undefined,
          mostLikely: t.mostLikely !== undefined ? Number(t.mostLikely) : undefined,
          pessimistic: t.pessimistic !== undefined ? Number(t.pessimistic) : undefined,
          dependsOn: t.dependsOn ? [...t.dependsOn] : [],
        }));
        setEditableTasks(cloned);
        setJsonText(JSON.stringify(cloned, null, 2));
        setError(null);
        setSuccess(false);
        setActiveTab("table");
        setMode(estimationMode);
      }
    }, [open, tasks, estimationMode]);

    // Toggle between CPM and PERT mode
    const handleToggleMode = useCallback(
      (newMode: "cpm" | "pert") => {
        setMode(newMode);
        onEstimationModeChange?.(newMode);
        setEditableTasks((prev) =>
          prev.map((t) => {
            if (newMode === "pert") {
              const base = t.duration ?? 5;
              return {
                ...t,
                optimistic: t.optimistic ?? Math.max(1, Math.round(base * 0.7)),
                mostLikely: t.mostLikely ?? base,
                pessimistic: t.pessimistic ?? Math.round(base * 1.5),
              };
            } else {
              const te =
                t.optimistic !== undefined &&
                t.mostLikely !== undefined &&
                t.pessimistic !== undefined
                  ? Math.round((t.optimistic + 4 * t.mostLikely + t.pessimistic) / 6)
                  : t.duration ?? 1;
              return {
                ...t,
                duration: te,
              };
            }
          })
        );
        setError(null);
      },
      [onEstimationModeChange]
    );

    // Handle row field changes
    const handleFieldChange = useCallback(
      (index: number, field: keyof TaskInput, value: string | number) => {
        setEditableTasks((prev) => {
          const updated = [...prev];
          const target = { ...updated[index] };

          if (
            field === "duration" ||
            field === "optimistic" ||
            field === "mostLikely" ||
            field === "pessimistic"
          ) {
            const num = value === "" ? 0 : Number(value);
            target[field] = num;
          } else if (field === "key") {
            target.key = String(value);
          } else if (field === "text") {
            target.text = String(value);
          }

          updated[index] = target;
          return updated;
        });
        setError(null);
      },
      []
    );

    // Add predecessor to a task
    const togglePredecessor = useCallback((taskIndex: number, depKey: string) => {
      setEditableTasks((prev) => {
        const updated = [...prev];
        const target = { ...updated[taskIndex] };
        const currentDeps = target.dependsOn ? [...target.dependsOn] : [];

        if (currentDeps.includes(depKey)) {
          target.dependsOn = currentDeps.filter((k) => k !== depKey);
        } else {
          target.dependsOn = [...currentDeps, depKey];
        }

        updated[taskIndex] = target;
        return updated;
      });
      setError(null);
    }, []);

    // Remove predecessor tag
    const removePredecessor = useCallback((taskIndex: number, depKey: string) => {
      setEditableTasks((prev) => {
        const updated = [...prev];
        const target = { ...updated[taskIndex] };
        target.dependsOn = (target.dependsOn || []).filter((k) => k !== depKey);
        updated[taskIndex] = target;
        return updated;
      });
      setError(null);
    }, []);

    // Delete row
    const handleDeleteRow = useCallback((index: number) => {
      setEditableTasks((prev) => {
        const deletedKey = prev[index]?.key;
        const filtered = prev.filter((_, i) => i !== index);
        return filtered.map((t) => ({
          ...t,
          dependsOn: (t.dependsOn || []).filter((dep) => dep !== deletedKey),
        }));
      });
      setError(null);
    }, []);

    // Add new row
    const handleAddNewTask = useCallback(() => {
      const { key, text } = getNextKeyAndName(editableTasks);
      setEditableTasks((prev) => [
        ...prev,
        {
          key,
          text,
          duration: mode === "cpm" ? 3 : undefined,
          optimistic: mode === "pert" ? 2 : undefined,
          mostLikely: mode === "pert" ? 4 : undefined,
          pessimistic: mode === "pert" ? 6 : undefined,
          dependsOn: [],
        },
      ]);
      setError(null);
    }, [editableTasks, mode]);

    // Reset / Load Examples
    const handleLoadCpmExample = useCallback(() => {
      setMode("cpm");
      onEstimationModeChange?.("cpm");
      const cloned: TaskInput[] = cpmExampleTasks.map((t) => ({ ...t }));
      setEditableTasks(cloned);
      setJsonText(JSON.stringify(cloned, null, 2));
      setError(null);
    }, [onEstimationModeChange]);

    const handleLoadPertExample = useCallback(() => {
      setMode("pert");
      onEstimationModeChange?.("pert");
      const cloned: TaskInput[] = pertExampleTasks.map((t) => ({ ...t }));
      setEditableTasks(cloned);
      setJsonText(JSON.stringify(cloned, null, 2));
      setError(null);
    }, [onEstimationModeChange]);

    // Clear all tasks
    const handleClearAll = useCallback(() => {
      setEditableTasks([]);
      setJsonText("[]");
      setError(null);
    }, []);

    // Switch to JSON tab
    const handleSwitchToJson = useCallback(() => {
      setJsonText(JSON.stringify(editableTasks, null, 2));
      setActiveTab("json");
      setError(null);
    }, [editableTasks]);

    // Switch to Table tab
    const handleSwitchToTable = useCallback(() => {
      try {
        const parsed = JSON.parse(jsonText);
        if (!Array.isArray(parsed)) {
          throw new Error("JSON input must be an array of task objects.");
        }
        const formatted: TaskInput[] = parsed.map((t: Record<string, unknown>) => ({
          key: String(t.key ?? ""),
          text: String(t.text ?? ""),
          duration: t.duration !== undefined ? Number(t.duration) : undefined,
          optimistic: t.optimistic !== undefined ? Number(t.optimistic) : undefined,
          mostLikely: t.mostLikely !== undefined ? Number(t.mostLikely) : undefined,
          pessimistic: t.pessimistic !== undefined ? Number(t.pessimistic) : undefined,
          dependsOn: Array.isArray(t.dependsOn) ? t.dependsOn.map(String) : [],
        }));
        setEditableTasks(formatted);
        setActiveTab("table");
        setError(null);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(UI_STRINGS.errors.invalidJson(msg));
      }
    }, [jsonText]);

    // Format JSON text
    const handleFormatJson = useCallback(() => {
      try {
        const parsed = JSON.parse(jsonText);
        setJsonText(JSON.stringify(parsed, null, 2));
        setError(null);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setError("Cannot format: " + msg);
      }
    }, [jsonText]);

    // Export JSON file
    const handleExportJson = useCallback(() => {
      const blob = new Blob([JSON.stringify(editableTasks, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pert-tasks-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, [editableTasks]);

    // Import JSON file
    const handleImportFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = String(event.target?.result ?? "");
          const parsed = JSON.parse(content);
          const tasksArray = Array.isArray(parsed) ? parsed : parsed.tasks;
          if (!Array.isArray(tasksArray)) {
            throw new Error("File must contain a JSON array of tasks.");
          }
          const loaded: TaskInput[] = tasksArray.map((t: Record<string, unknown>) => ({
            key: String(t.key ?? ""),
            text: String(t.text ?? ""),
            duration: t.duration !== undefined ? Number(t.duration) : undefined,
            optimistic: t.optimistic !== undefined ? Number(t.optimistic) : undefined,
            mostLikely: t.mostLikely !== undefined ? Number(t.mostLikely) : undefined,
            pessimistic: t.pessimistic !== undefined ? Number(t.pessimistic) : undefined,
            dependsOn: Array.isArray(t.dependsOn) ? t.dependsOn.map(String) : [],
          }));
          setEditableTasks(loaded);
          setJsonText(JSON.stringify(loaded, null, 2));
          setError(null);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          setError("Failed to import file: " + msg);
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    }, []);

    // Save / Apply Changes
    const handleApply = useCallback(() => {
      let tasksToApply: TaskInput[] = [];

      if (activeTab === "table") {
        tasksToApply = editableTasks.map((t) => ({
          key: String(t.key).trim(),
          text: String(t.text).trim(),
          duration: t.duration !== undefined ? Number(t.duration) : undefined,
          optimistic: t.optimistic !== undefined ? Number(t.optimistic) : undefined,
          mostLikely: t.mostLikely !== undefined ? Number(t.mostLikely) : undefined,
          pessimistic: t.pessimistic !== undefined ? Number(t.pessimistic) : undefined,
          dependsOn: (t.dependsOn || []).map((d) => String(d).trim()).filter(Boolean),
        }));
      } else {
        try {
          const parsed = JSON.parse(jsonText);
          if (!Array.isArray(parsed)) {
            throw new Error("JSON must be an array of tasks.");
          }
          tasksToApply = parsed.map((t: Record<string, unknown>) => ({
            key: String(t.key ?? "").trim(),
            text: String(t.text ?? "").trim(),
            duration: t.duration !== undefined ? Number(t.duration) : undefined,
            optimistic: t.optimistic !== undefined ? Number(t.optimistic) : undefined,
            mostLikely: t.mostLikely !== undefined ? Number(t.mostLikely) : undefined,
            pessimistic: t.pessimistic !== undefined ? Number(t.pessimistic) : undefined,
            dependsOn: Array.isArray(t.dependsOn)
              ? t.dependsOn.map((d: unknown) => String(d).trim()).filter(Boolean)
              : [],
          }));
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          setError(UI_STRINGS.errors.invalidJson(msg));
          return;
        }
      }

      // Comprehensive validation
      const validation = validateTasksList(tasksToApply, mode);
      if (!validation.isValid) {
        setError(validation.error);
        return;
      }

      // Apply to parent
      setTasks(tasksToApply);
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
      }, 350);
    }, [activeTab, editableTasks, jsonText, mode, setTasks]);

    return (
      <div className="justify-self-end">
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <button
              type="button"
              style={{
                backgroundColor: THEME.colors.ink,
                color: THEME.colors.canvas,
                borderRadius: THEME.dimensions.borderRadiusPill,
                padding: "7px 18px",
                fontSize: THEME.typography.fontSizeBase,
                fontFamily: THEME.typography.fontFamily,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                lineHeight: 1,
              }}
              className="hover:opacity-85 shadow-sm active:scale-95 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#fa9000]"
            >
              {UI_STRINGS.app.editTasksButton}
            </button>
          </DrawerTrigger>

          <DrawerContent className="w-full max-h-[92dvh] flex flex-col bg-white">
            <div className="mx-auto w-full max-w-6xl flex flex-col flex-1 overflow-hidden">
              <TaskEditorHeader
                taskCount={editableTasks.length}
                mode={mode}
                activeTab={activeTab}
                onToggleMode={handleToggleMode}
                onSwitchToTable={handleSwitchToTable}
                onSwitchToJson={handleSwitchToJson}
              />

              {/* Error banner */}
              {error && (
                <div
                  role="alert"
                  className="flex items-center gap-2.5 px-6 py-2 bg-[#fdf2f2] border-b border-[#f5c6cb] text-[#c31833] text-xs font-medium"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#c31833]" />
                  <span>{error}</span>
                </div>
              )}

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto px-6 py-4 bg-white flex flex-col">
                {activeTab === "table" ? (
                  <div className="space-y-3 flex-1 flex flex-col">
                    <TaskImportExport
                      taskCount={editableTasks.length}
                      fileInputId={fileInputId}
                      onAddNewTask={handleAddNewTask}
                      onLoadCpmExample={handleLoadCpmExample}
                      onLoadPertExample={handleLoadPertExample}
                      onExportJson={handleExportJson}
                      onImportFile={handleImportFile}
                      onClearAll={handleClearAll}
                    />

                    <TaskTableEditor
                      tasks={editableTasks}
                      mode={mode}
                      onFieldChange={handleFieldChange}
                      onTogglePredecessor={togglePredecessor}
                      onRemovePredecessor={removePredecessor}
                      onDeleteRow={handleDeleteRow}
                      onAddNewTask={handleAddNewTask}
                      onLoadExample={handleLoadPertExample}
                    />
                  </div>
                ) : (
                  <TaskJsonEditor
                    jsonText={jsonText}
                    onChangeJson={(text) => {
                      setJsonText(text);
                      setError(null);
                    }}
                    onFormatJson={handleFormatJson}
                  />
                )}
              </div>

              {/* Drawer Footer */}
              <div
                style={{
                  padding: "12px 24px",
                  borderTop: `1px solid ${THEME.colors.border}`,
                  backgroundColor: "#fcfcfc",
                }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <DrawerClose asChild>
                    <button
                      type="button"
                      className="px-4 py-1.5 rounded-full text-xs font-medium text-[#404040] hover:bg-neutral-100 border border-[#d8d8d8] transition-colors"
                    >
                      Cancel
                    </button>
                  </DrawerClose>
                </div>

                <div className="flex items-center gap-3">
                  {success && (
                    <span className="flex items-center gap-1.5 text-xs text-[#008751] font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      Applied Successfully!
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleApply}
                    className="px-6 py-2 rounded-full text-xs font-bold text-white bg-[#fa9000] hover:bg-[#e08200] shadow-sm active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-[#fa9000]"
                  >
                    {UI_STRINGS.drawer.applyButton}
                  </button>
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    );
  }
);
