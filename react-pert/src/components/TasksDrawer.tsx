import { memo, useState, useEffect, useCallback, useId } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TaskInput } from "@@/lib/main";
import { cpmExampleTasks, pertExampleTasks } from "@/constants/examples";
import { THEME } from "@/constants/theme";
import { UI_STRINGS } from "@/constants/strings";
import {
  AlertCircle,
  Plus,
  Trash2,
  RotateCcw,
  Code2,
  Table2,
  X,
  CheckCircle2,
  Download,
  Upload,
  Layers,
  Sparkles,
} from "lucide-react";

interface TasksDrawerProps {
  tasks?: TaskInput[];
  setTasks: (tasks: TaskInput[]) => void;
  estimationMode?: "cpm" | "pert";
  onEstimationModeChange?: (mode: "cpm" | "pert") => void;
}

/**
 * Validates tasks for uniqueness, valid durations, existing dependencies, and circular references.
 */
function validateTasksList(
  tasks: TaskInput[],
  mode: "cpm" | "pert"
): { isValid: boolean; error: string | null } {
  if (tasks.length === 0) {
    return { isValid: false, error: UI_STRINGS.errors.emptyTaskList };
  }

  const keys = new Set<string>();
  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    const key = (t.key ?? "").toString().trim();
    if (!key) {
      return { isValid: false, error: UI_STRINGS.errors.emptyKey(i + 1) };
    }
    if (keys.has(key)) {
      return { isValid: false, error: UI_STRINGS.errors.duplicateKey(key, i + 1) };
    }
    keys.add(key);

    if (mode === "pert") {
      const o = Number(t.optimistic);
      const m = Number(t.mostLikely);
      const p = Number(t.pessimistic);

      if (
        isNaN(o) ||
        isNaN(m) ||
        isNaN(p) ||
        !Number.isFinite(o) ||
        !Number.isFinite(m) ||
        !Number.isFinite(p) ||
        o < 0 ||
        m < 0 ||
        p < 0 ||
        o > m ||
        m > p
      ) {
        return {
          isValid: false,
          error: UI_STRINGS.errors.invalidThreePoint(key, o, m, p),
        };
      }
    } else {
      const dur = Number(t.duration);
      if (isNaN(dur) || !Number.isFinite(dur) || dur < 0) {
        return { isValid: false, error: UI_STRINGS.errors.invalidDuration(key) };
      }
    }
  }

  // Predecessor verification
  for (const t of tasks) {
    const taskKey = (t.key ?? "").toString().trim();
    if (t.dependsOn && t.dependsOn.length > 0) {
      for (const rawDep of t.dependsOn) {
        const dep = (rawDep ?? "").toString().trim();
        if (dep === taskKey) {
          return { isValid: false, error: UI_STRINGS.errors.selfDependency(taskKey) };
        }
        if (!keys.has(dep)) {
          return { isValid: false, error: UI_STRINGS.errors.missingDependency(taskKey, dep) };
        }
      }
    }
  }

  // Cycle detection (Topological sort using Kahn's algorithm)
  const inDegree = new Map<string, number>();
  const graph = new Map<string, string[]>();

  for (const t of tasks) {
    const key = (t.key ?? "").toString().trim();
    inDegree.set(key, 0);
    graph.set(key, []);
  }

  for (const t of tasks) {
    const key = (t.key ?? "").toString().trim();
    if (t.dependsOn && t.dependsOn.length > 0) {
      for (const rawDep of t.dependsOn) {
        const dep = (rawDep ?? "").toString().trim();
        graph.get(dep)?.push(key);
        inDegree.set(key, (inDegree.get(key) || 0) + 1);
      }
    }
  }

  const queue: string[] = [];
  inDegree.forEach((deg, key) => {
    if (deg === 0) queue.push(key);
  });

  let processedCount = 0;
  while (queue.length > 0) {
    const curr = queue.shift()!;
    processedCount++;
    for (const neighbor of graph.get(curr) || []) {
      const remaining = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, remaining);
      if (remaining === 0) {
        queue.push(neighbor);
      }
    }
  }

  if (processedCount < tasks.length) {
    return {
      isValid: false,
      error: UI_STRINGS.errors.circularDependency,
    };
  }

  return { isValid: true, error: null };
}

/** Generates a smart next key and label */
function getNextKeyAndName(tasks: TaskInput[]): { key: string; text: string } {
  const numKeys = tasks
    .map((t) => Number(t.key))
    .filter((n) => !isNaN(n) && Number.isInteger(n));

  if (numKeys.length > 0) {
    const nextNum = Math.max(...numKeys) + 1;
    const nextLetter = String.fromCharCode(64 + ((nextNum - 1) % 26) + 1);
    return { key: String(nextNum), text: `Task ${nextLetter}` };
  }

  let counter = tasks.length + 1;
  while (tasks.some((t) => t.key === String(counter))) {
    counter++;
  }
  return { key: String(counter), text: `Task ${counter}` };
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

          if (field === "duration" || field === "optimistic" || field === "mostLikely" || field === "pessimistic") {
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
              {/* Header banner */}
              <DrawerHeader
                style={{
                  backgroundColor: THEME.colors.navy,
                  padding: "14px 20px",
                  borderBottom: `1px solid rgba(255,255,255,0.1)`,
                }}
                className="flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <div
                      style={{
                        width: THEME.dimensions.eyebrowBarWidth,
                        height: THEME.dimensions.eyebrowBarHeight,
                        backgroundColor: THEME.colors.primary,
                      }}
                    />
                    <DrawerTitle
                      style={{
                        color: THEME.colors.canvas,
                        fontFamily: THEME.typography.fontFamily,
                        fontWeight: 700,
                        fontSize: THEME.typography.fontSizeXl,
                        letterSpacing: 0.5,
                      }}
                    >
                      {UI_STRINGS.drawer.title}
                    </DrawerTitle>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-[#fa9000] font-medium ml-2">
                      {editableTasks.length} {editableTasks.length === 1 ? "Task" : "Tasks"}
                    </span>
                  </div>
                  <DrawerDescription
                    style={{
                      color: "#d0d0d0",
                      fontSize: 12,
                      fontFamily: THEME.typography.fontFamily,
                      marginTop: 3,
                    }}
                  >
                    {UI_STRINGS.drawer.subtitle}
                  </DrawerDescription>
                </div>

                {/* Estimation Mode Toggle & View Switcher */}
                <div className="flex items-center gap-2">
                  {/* CPM vs PERT Mode Switch */}
                  <div className="flex items-center bg-white/10 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => handleToggleMode("cpm")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                        mode === "cpm"
                          ? "bg-[#fa9000] text-white shadow-sm"
                          : "text-white/80 hover:text-white"
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      CPM Mode
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleMode("pert")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                        mode === "pert"
                          ? "bg-[#fa9000] text-white shadow-sm"
                          : "text-white/80 hover:text-white"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      3-Point (PERT)
                    </button>
                  </div>

                  {/* Table vs JSON */}
                  <div className="flex items-center bg-white/10 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={activeTab === "table" ? undefined : handleSwitchToTable}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        activeTab === "table"
                          ? "bg-white text-[#100e2f] shadow-sm font-semibold"
                          : "text-white/80 hover:text-white"
                      }`}
                    >
                      <Table2 className="w-3.5 h-3.5" />
                      {UI_STRINGS.drawer.tabTable}
                    </button>
                    <button
                      type="button"
                      onClick={activeTab === "json" ? undefined : handleSwitchToJson}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        activeTab === "json"
                          ? "bg-white text-[#100e2f] shadow-sm font-semibold"
                          : "text-white/80 hover:text-white"
                      }`}
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      {UI_STRINGS.drawer.tabJson}
                    </button>
                  </div>
                </div>
              </DrawerHeader>

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
              <div className="flex-1 overflow-y-auto px-6 py-4 bg-white">
                {activeTab === "table" ? (
                  <div className="space-y-3">
                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={handleAddNewTask}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white bg-[#fa9000] hover:bg-[#e08200] transition-colors shadow-sm active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#fa9000]"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          {UI_STRINGS.drawer.addTaskButton}
                        </button>
                        <button
                          type="button"
                          onClick={handleLoadCpmExample}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-[#404040] border border-[#d8d8d8] hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#fa9000]"
                          title="Load deterministic CPM sample project"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Load CPM Example
                        </button>
                        <button
                          type="button"
                          onClick={handleLoadPertExample}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-[#404040] border border-[#d8d8d8] hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#fa9000]"
                          title="Load 3-point estimation (O, M, P) PERT project"
                        >
                          <Sparkles className="w-3 h-3 text-[#fa9000]" />
                          Load PERT Example
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Export JSON */}
                        <button
                          type="button"
                          onClick={handleExportJson}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-[#404040] border border-[#d8d8d8] hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#fa9000]"
                          title="Export tasks to JSON file"
                        >
                          <Download className="w-3 h-3" />
                          Export
                        </button>

                        {/* Import JSON */}
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
                          onChange={handleImportFile}
                        />

                        {editableTasks.length > 0 && (
                          <button
                            type="button"
                            onClick={handleClearAll}
                            className="text-xs text-[#525252] hover:text-[#c31833] transition-colors underline-offset-2 hover:underline ml-2"
                          >
                            {UI_STRINGS.drawer.clearAllButton}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Table */}
                    <div className="border border-[#d8d8d8] rounded-md overflow-x-auto bg-white shadow-sm">
                      <table className="w-full border-collapse text-left text-sm">
                        <thead>
                          <tr
                            style={{ backgroundColor: "#f9f9f9" }}
                            className="border-b border-[#d8d8d8] text-[#404040] text-xs font-semibold uppercase tracking-wider"
                          >
                            <th className="py-2.5 px-3 w-10 text-center">#</th>
                            <th className="py-2.5 px-3 w-28">{UI_STRINGS.drawer.columns.id}</th>
                            <th className="py-2.5 px-3 w-44">{UI_STRINGS.drawer.columns.name}</th>

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
                          {editableTasks.length === 0 ? (
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
                                    onClick={handleAddNewTask}
                                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-[#fa9000] hover:bg-[#e08200]"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add First Task
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleLoadPertExample}
                                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-[#111111] bg-neutral-100 hover:bg-neutral-200"
                                  >
                                    <Sparkles className="w-3.5 h-3.5 text-[#fa9000]" />
                                    Load PERT Example
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            editableTasks.map((task, index) => {
                              const candidateTasks = editableTasks.filter(
                                (_, otherIdx) => otherIdx !== index
                              );

                              // Real-time calculated te for 3-point
                              const o = Number(task.optimistic ?? 0);
                              const m = Number(task.mostLikely ?? 0);
                              const p = Number(task.pessimistic ?? 0);
                              const teCalc = (o + 4 * m + p) / 6;

                              return (
                                <tr
                                  key={index}
                                  className="hover:bg-[#fafafa] transition-colors group"
                                >
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
                                      onChange={(e) =>
                                        handleFieldChange(index, "key", e.target.value)
                                      }
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
                                      onChange={(e) =>
                                        handleFieldChange(index, "text", e.target.value)
                                      }
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
                                        onChange={(e) =>
                                          handleFieldChange(index, "duration", e.target.value)
                                        }
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
                                          onChange={(e) =>
                                            handleFieldChange(index, "optimistic", e.target.value)
                                          }
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
                                          onChange={(e) =>
                                            handleFieldChange(index, "mostLikely", e.target.value)
                                          }
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
                                          onChange={(e) =>
                                            handleFieldChange(index, "pessimistic", e.target.value)
                                          }
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
                                        const depTask = editableTasks.find((t) => t.key === depKey);
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
                                              onClick={() => removePredecessor(index, depKey)}
                                              className="p-0.5 hover:bg-[#d8d8d8] rounded-full text-[#525252] hover:text-[#c31833] focus:outline-none"
                                              aria-label={`Remove predecessor ${depKey}`}
                                            >
                                              <X className="w-3 h-3" />
                                            </button>
                                          </span>
                                        );
                                      })}

                                      {/* Predecessor Popover */}
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
                                          className="w-56 p-2 bg-white border border-[#d8d8d8] shadow-md rounded-md"
                                          align="start"
                                        >
                                          <p className="text-xs font-semibold text-[#111111] mb-1.5 pb-1 border-b border-[#eeeeee]">
                                            Select Predecessor Task:
                                          </p>
                                          {candidateTasks.length === 0 ? (
                                            <p className="text-xs text-[#525252] py-2 text-center">
                                              No other tasks available
                                            </p>
                                          ) : (
                                            <div className="max-h-48 overflow-y-auto space-y-1">
                                              {candidateTasks.map((candidate) => {
                                                const isSelected = (task.dependsOn || []).includes(
                                                  candidate.key
                                                );
                                                return (
                                                  <button
                                                    key={candidate.key}
                                                    type="button"
                                                    onClick={() =>
                                                      togglePredecessor(index, candidate.key)
                                                    }
                                                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors text-left ${
                                                      isSelected
                                                        ? "bg-amber-50 text-[#fa9000] font-semibold"
                                                        : "hover:bg-neutral-100 text-[#111111]"
                                                    }`}
                                                  >
                                                    <span className="font-mono">
                                                      <span className="font-bold mr-1.5">
                                                        {candidate.key}
                                                      </span>
                                                      <span className="text-[#525252] truncate">
                                                        {candidate.text}
                                                      </span>
                                                    </span>
                                                    {isSelected && (
                                                      <CheckCircle2 className="w-3.5 h-3.5 text-[#fa9000]" />
                                                    )}
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          )}
                                        </PopoverContent>
                                      </Popover>
                                    </div>
                                  </td>

                                  {/* Delete */}
                                  <td className="py-2 px-3 text-center">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteRow(index)}
                                      className="p-1 text-[#525252] hover:text-[#c31833] hover:bg-red-50 rounded transition-colors focus:outline-none focus:ring-1 focus:ring-[#c31833]"
                                      aria-label={`Delete task ${task.key}`}
                                      title="Delete Task"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  /* JSON Mode */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-[#525252]">
                        Direct JSON array editing with schema validation on apply.
                      </p>
                      <button
                        type="button"
                        onClick={handleFormatJson}
                        className="text-xs text-[#fa9000] hover:underline font-medium"
                      >
                        Format JSON
                      </button>
                    </div>
                    <Textarea
                      value={jsonText}
                      onChange={(e) => {
                        setJsonText(e.target.value);
                        setError(null);
                      }}
                      className="font-mono text-xs min-h-[360px] p-3 border border-[#d8d8d8] rounded bg-white text-[#111111]"
                    />
                  </div>
                )}
              </div>

              {/* Footer */}
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
