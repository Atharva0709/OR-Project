import { memo, useState, useEffect, useCallback } from "react";
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
import { initTasks } from "@/constants/initStates";
import {
  AlertCircle,
  Plus,
  Trash2,
  RotateCcw,
  Code2,
  Table2,
  X,
  CheckCircle2,
  Info,
} from "lucide-react";

interface TasksDrawerProps {
  tasks?: TaskInput[];
  setTasks: (tasks: TaskInput[]) => void;
}

/**
 * Validates tasks for uniqueness, valid durations, existing dependencies, and circular references.
 */
function validateTasksList(tasks: TaskInput[]): { isValid: boolean; error: string | null } {
  if (tasks.length === 0) {
    return { isValid: false, error: "Task list is empty. Please add at least one task." };
  }

  const keys = new Set<string>();
  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    const key = (t.key ?? "").toString().trim();
    if (!key) {
      return { isValid: false, error: `Row #${i + 1}: Task ID / Key cannot be empty.` };
    }
    if (keys.has(key)) {
      return { isValid: false, error: `Duplicate Task ID "${key}" detected at Row #${i + 1}. Task IDs must be unique.` };
    }
    keys.add(key);

    const dur = Number(t.duration);
    if (isNaN(dur) || dur < 0) {
      return { isValid: false, error: `Task "${key}": Duration must be a valid number ≥ 0.` };
    }
  }

  // Predecessor verification
  for (const t of tasks) {
    const taskKey = (t.key ?? "").toString().trim();
    if (t.dependsOn && t.dependsOn.length > 0) {
      for (const rawDep of t.dependsOn) {
        const dep = (rawDep ?? "").toString().trim();
        if (dep === taskKey) {
          return { isValid: false, error: `Task "${taskKey}" cannot depend on itself.` };
        }
        if (!keys.has(dep)) {
          return { isValid: false, error: `Task "${taskKey}" depends on Task ID "${dep}", which does not exist.` };
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
        // dep -> key (dep must finish before key can start)
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
      error: "Circular dependency detected! Tasks cannot form a closed loop (e.g., A → B → A).",
    };
  }

  return { isValid: true, error: null };
}

/** Generates a smart next key and label */
function getNextKeyAndName(tasks: TaskInput[]): { key: string; text: string } {
  // If all keys are integers, find max + 1
  const numKeys = tasks
    .map((t) => Number(t.key))
    .filter((n) => !isNaN(n) && Number.isInteger(n));

  if (numKeys.length > 0) {
    const nextNum = Math.max(...numKeys) + 1;
    // Next letter for name if names are letters
    const nextLetter = String.fromCharCode(64 + ((nextNum - 1) % 26) + 1);
    return { key: String(nextNum), text: nextLetter };
  }

  let counter = tasks.length + 1;
  while (tasks.some((t) => t.key === String(counter))) {
    counter++;
  }
  return { key: String(counter), text: `Task ${counter}` };
}

export const TasksDrawer = memo(({ tasks, setTasks }: TasksDrawerProps) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"table" | "json">("table");
  const [editableTasks, setEditableTasks] = useState<TaskInput[]>([]);
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Synchronize on drawer open
  useEffect(() => {
    if (open) {
      const current = tasks && tasks.length > 0 ? tasks : initTasks;
      // Deep clone so edits don't mutate parent until applied
      const cloned: TaskInput[] = current.map((t) => ({
        key: t.key,
        text: t.text,
        duration: Number(t.duration),
        dependsOn: t.dependsOn ? [...t.dependsOn] : [],
      }));
      setEditableTasks(cloned);
      setJsonText(JSON.stringify(cloned, null, 2));
      setError(null);
      setSuccess(false);
      setActiveTab("table");
    }
  }, [open, tasks]);

  // Handle row field changes
  const handleFieldChange = useCallback(
    (index: number, field: keyof TaskInput, value: any) => {
      setEditableTasks((prev) => {
        const updated = [...prev];
        const target = { ...updated[index] };

        if (field === "duration") {
          target.duration = value === "" ? 0 : Number(value);
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
      // Also remove deleted key from any other task's dependsOn
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
        duration: 1,
        dependsOn: [],
      },
    ]);
    setError(null);
  }, [editableTasks]);

  // Reset to initial sample tasks
  const handleResetToDefault = useCallback(() => {
    const cloned: TaskInput[] = initTasks.map((t) => ({
      key: t.key,
      text: t.text,
      duration: Number(t.duration),
      dependsOn: t.dependsOn ? [...t.dependsOn] : [],
    }));
    setEditableTasks(cloned);
    setJsonText(JSON.stringify(cloned, null, 2));
    setError(null);
  }, []);

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
      const formatted: TaskInput[] = parsed.map((t) => ({
        key: String(t.key ?? ""),
        text: String(t.text ?? ""),
        duration: Number(t.duration ?? 0),
        dependsOn: Array.isArray(t.dependsOn) ? t.dependsOn.map(String) : [],
      }));
      setEditableTasks(formatted);
      setActiveTab("table");
      setError(null);
    } catch (err: any) {
      setError(err.message || "Invalid JSON syntax. Fix errors before switching to Table.");
    }
  }, [jsonText]);

  // Format JSON text
  const handleFormatJson = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (err: any) {
      setError("Cannot format: " + err.message);
    }
  }, [jsonText]);

  // Save / Apply Changes
  const handleApply = useCallback(() => {
    let tasksToApply: TaskInput[] = [];

    if (activeTab === "table") {
      tasksToApply = editableTasks.map((t) => ({
        key: String(t.key).trim(),
        text: String(t.text).trim(),
        duration: Number(t.duration),
        dependsOn: (t.dependsOn || []).map((d) => String(d).trim()).filter(Boolean),
      }));
    } else {
      try {
        const parsed = JSON.parse(jsonText);
        if (!Array.isArray(parsed)) {
          throw new Error("JSON must be an array of tasks.");
        }
        tasksToApply = parsed.map((t) => ({
          key: String(t.key ?? "").trim(),
          text: String(t.text ?? "").trim(),
          duration: Number(t.duration ?? 0),
          dependsOn: Array.isArray(t.dependsOn)
            ? t.dependsOn.map((d: any) => String(d).trim()).filter(Boolean)
            : [],
        }));
      } catch (err: any) {
        setError("Invalid JSON format: " + err.message);
        return;
      }
    }

    // Comprehensive validation
    const validation = validateTasksList(tasksToApply);
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
  }, [activeTab, editableTasks, jsonText, setTasks]);

  return (
    <div className="justify-self-end">
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          {/* Black pill button */}
          <button
            style={{
              backgroundColor: "#000000",
              color: "#ffffff",
              borderRadius: 18,
              padding: "7px 18px",
              fontSize: 14,
              fontFamily: "'Roboto', sans-serif",
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
              lineHeight: 1,
              transition: "opacity 0.15s ease",
            }}
            className="hover:opacity-85 shadow-sm active:scale-95"
          >
            Edit Tasks
          </button>
        </DrawerTrigger>

        <DrawerContent className="w-full max-h-[92vh] flex flex-col bg-white">
          <div className="mx-auto w-full max-w-5xl flex flex-col flex-1 overflow-hidden">
            {/* Header banner */}
            <DrawerHeader
              style={{
                backgroundColor: "#100e2f",
                padding: "16px 24px",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
              }}
              className="flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2.5">
                  <div style={{ width: 6, height: 20, backgroundColor: "#fa9000" }} />
                  <DrawerTitle
                    style={{
                      color: "#ffffff",
                      fontFamily: "'Roboto', sans-serif",
                      fontWeight: 700,
                      fontSize: 18,
                      letterSpacing: 0.5,
                    }}
                  >
                    Edit Project Tasks
                  </DrawerTitle>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-[#fa9000] font-medium ml-2">
                    {editableTasks.length} {editableTasks.length === 1 ? "Task" : "Tasks"}
                  </span>
                </div>
                <DrawerDescription
                  style={{
                    color: "#bebebe",
                    fontSize: 13,
                    fontFamily: "'Roboto', sans-serif",
                    marginTop: 4,
                  }}
                >
                  Enter task IDs, names, durations (days), and precedence relationships below.
                </DrawerDescription>
              </div>

              {/* View Switcher: Table vs JSON */}
              <div className="flex items-center bg-white/10 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={activeTab === "table" ? undefined : handleSwitchToTable}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    activeTab === "table"
                      ? "bg-white text-[#100e2f] shadow-sm font-semibold"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  <Table2 className="w-3.5 h-3.5" />
                  Table View
                </button>
                <button
                  type="button"
                  onClick={activeTab === "json" ? undefined : handleSwitchToJson}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    activeTab === "json"
                      ? "bg-white text-[#100e2f] shadow-sm font-semibold"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  JSON View
                </button>
              </div>
            </DrawerHeader>

            {/* Error banner if validation failed */}
            {error && (
              <div
                className="flex items-center gap-2.5 px-6 py-2.5 bg-[#fdf2f2] border-b border-[#f5c6cb] text-[#c31833] text-sm animate-in fade-in duration-200"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#c31833]" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Main Editor Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 bg-[#ffffff]">
              {activeTab === "table" ? (
                <div className="space-y-3">
                  {/* Table Action Bar */}
                  <div className="flex items-center justify-between pb-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAddNewTask}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white bg-[#fa9000] hover:bg-[#e08200] transition-colors shadow-sm active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        Add New Task
                      </button>
                      <button
                        type="button"
                        onClick={handleResetToDefault}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#595959] border border-[#d8d8d8] hover:bg-[#f0f0f0] transition-colors"
                        title="Reload the 10 standard demonstration tasks"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Load Sample Tasks
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      {editableTasks.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearAll}
                          className="text-xs text-[#595959] hover:text-[#c31833] transition-colors underline-offset-2 hover:underline"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Tasks Table */}
                  <div className="border border-[#d8d8d8] rounded-md overflow-hidden bg-white shadow-sm">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead>
                        <tr
                          style={{ backgroundColor: "#f9f9f9" }}
                          className="border-b border-[#d8d8d8] text-[#595959] text-xs font-semibold uppercase tracking-wider"
                        >
                          <th className="py-2.5 px-3 w-12 text-center">#</th>
                          <th className="py-2.5 px-3 w-32">Task ID / Key</th>
                          <th className="py-2.5 px-3 w-44">Task Name / Label</th>
                          <th className="py-2.5 px-3 w-32">Duration (Days)</th>
                          <th className="py-2.5 px-3">Predecessors (Depends On)</th>
                          <th className="py-2.5 px-3 w-16 text-center">Delete</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#eeeeee]">
                        {editableTasks.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-[#595959]">
                              <p className="font-medium text-base text-[#333333]">No tasks defined yet.</p>
                              <p className="text-xs mt-1 text-[#595959]">
                                Click "Add New Task" above or "Load Sample Tasks" to get started.
                              </p>
                              <button
                                type="button"
                                onClick={handleAddNewTask}
                                className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-[#fa9000] hover:bg-[#e08200]"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                Add First Task
                              </button>
                            </td>
                          </tr>
                        ) : (
                          editableTasks.map((task, index) => {
                            const isKeyEmpty = !task.key || !task.key.trim();
                            const isDurationInvalid =
                              task.duration === undefined ||
                              isNaN(Number(task.duration)) ||
                              Number(task.duration) < 0;

                            // Candidate predecessors for this task (all other tasks)
                            const candidateTasks = editableTasks.filter(
                              (_, otherIdx) => otherIdx !== index
                            );

                            return (
                              <tr
                                key={index}
                                className="hover:bg-[#fafafa] transition-colors group"
                              >
                                {/* Row Index */}
                                <td className="py-2 px-3 text-center text-xs font-mono text-[#595959]">
                                  {index + 1}
                                </td>

                                {/* Task ID / Key */}
                                <td className="py-2 px-3">
                                  <input
                                    type="text"
                                    value={task.key}
                                    placeholder="e.g. 1, A"
                                    onChange={(e) =>
                                      handleFieldChange(index, "key", e.target.value)
                                    }
                                    className={`w-full px-2.5 py-1.5 text-xs font-mono rounded border transition-colors outline-none focus:ring-1 focus:ring-[#fa9000] ${
                                      isKeyEmpty
                                        ? "border-[#c31833] bg-[#fff5f5]"
                                        : "border-[#d8d8d8] bg-white hover:border-[#bebebe]"
                                    }`}
                                  />
                                </td>

                                {/* Task Name / Text */}
                                <td className="py-2 px-3">
                                  <input
                                    type="text"
                                    value={task.text}
                                    placeholder="Task Description"
                                    onChange={(e) =>
                                      handleFieldChange(index, "text", e.target.value)
                                    }
                                    className="w-full px-2.5 py-1.5 text-xs rounded border border-[#d8d8d8] bg-white hover:border-[#bebebe] transition-colors outline-none focus:ring-1 focus:ring-[#fa9000]"
                                  />
                                </td>

                                {/* Duration */}
                                <td className="py-2 px-3">
                                  <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={task.duration}
                                    onChange={(e) =>
                                      handleFieldChange(index, "duration", e.target.value)
                                    }
                                    className={`w-full px-2.5 py-1.5 text-xs rounded border transition-colors outline-none focus:ring-1 focus:ring-[#fa9000] ${
                                      isDurationInvalid
                                        ? "border-[#c31833] bg-[#fff5f5]"
                                        : "border-[#d8d8d8] bg-white hover:border-[#bebebe]"
                                    }`}
                                  />
                                </td>

                                {/* Predecessors / Dependencies */}
                                <td className="py-2 px-3">
                                  <div className="flex flex-wrap items-center gap-1.5 min-h-[30px]">
                                    {/* Existing selected predecessor pills */}
                                    {task.dependsOn && task.dependsOn.length > 0 ? (
                                      task.dependsOn.map((depKey) => {
                                        const depTask = editableTasks.find((t) => t.key === depKey);
                                        const label = depTask ? `${depKey} (${depTask.text})` : depKey;
                                        return (
                                          <span
                                            key={depKey}
                                            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-[#f0f0f0] text-[#333333] border border-[#d8d8d8]"
                                          >
                                            <span className="font-mono text-[11px] font-semibold text-[#100e2f]">
                                              {label}
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() => removePredecessor(index, depKey)}
                                              className="text-[#595959] hover:text-[#c31833] ml-0.5 focus:outline-none"
                                              title="Remove dependency"
                                            >
                                              <X className="w-3 h-3 stroke-[2.5]" />
                                            </button>
                                          </span>
                                        );
                                      })
                                    ) : (
                                      <span className="text-xs text-[#595959] italic pr-1">
                                        Starts at 0 (No dependencies)
                                      </span>
                                    )}

                                    {/* Predecessor selector popover */}
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <button
                                          type="button"
                                          className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded border border-dashed border-[#bebebe] text-[#595959] hover:border-[#fa9000] hover:text-[#fa9000] transition-colors"
                                          title="Add or remove predecessors"
                                        >
                                          <Plus className="w-3 h-3" />
                                          <span>Add</span>
                                        </button>
                                      </PopoverTrigger>
                                      <PopoverContent
                                        className="w-64 p-3 bg-white border border-[#d8d8d8] rounded-md shadow-lg"
                                        align="start"
                                      >
                                        <div className="mb-2">
                                          <p className="text-xs font-bold text-[#100e2f] uppercase tracking-wide">
                                            Select Predecessors
                                          </p>
                                          <p className="text-[11px] text-[#595959]">
                                            Tasks that must finish before "{task.text || task.key}" begins:
                                          </p>
                                        </div>

                                        <div className="max-h-48 overflow-y-auto space-y-1 divide-y divide-[#f5f5f5]">
                                          {candidateTasks.length === 0 ? (
                                            <p className="text-xs text-[#595959] italic py-2 text-center">
                                              No other tasks available.
                                            </p>
                                          ) : (
                                            candidateTasks.map((candidate) => {
                                              const isChecked = Boolean(
                                                task.dependsOn?.includes(candidate.key)
                                              );
                                              return (
                                                <label
                                                  key={candidate.key}
                                                  className="flex items-center gap-2 py-1.5 px-1 hover:bg-[#f9f9f9] rounded cursor-pointer text-xs"
                                                >
                                                  <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() =>
                                                      togglePredecessor(index, candidate.key)
                                                    }
                                                    className="rounded border-[#d8d8d8] text-[#fa9000] focus:ring-[#fa9000]"
                                                  />
                                                  <span className="font-mono font-bold text-[#100e2f] w-7">
                                                    {candidate.key}
                                                  </span>
                                                  <span className="flex-1 truncate text-[#333333]">
                                                    {candidate.text}
                                                  </span>
                                                  <span className="text-[10px] text-[#595959]">
                                                    {candidate.duration}d
                                                  </span>
                                                </label>
                                              );
                                            })
                                          )}
                                        </div>
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                </td>

                                {/* Delete row */}
                                <td className="py-2 px-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteRow(index)}
                                    className="p-1 rounded text-[#595959] hover:text-[#c31833] hover:bg-[#fff0f0] transition-colors"
                                    title="Delete this task"
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
                /* JSON Raw Editor */
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1">
                    <p className="text-xs text-[#595959]">
                      Directly edit or paste an array of task objects below:
                    </p>
                    <button
                      type="button"
                      onClick={handleFormatJson}
                      className="px-2.5 py-1 text-xs rounded border border-[#d8d8d8] hover:bg-[#f0f0f0] text-[#333333] transition-colors"
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
                    placeholder='[ { "key": "1", "duration": 5, "text": "A", "dependsOn": ["8"] } ]'
                    style={{
                      minHeight: 320,
                      resize: "none",
                      fontFamily: "monospace",
                      fontSize: 13,
                      border: "1px solid #d8d8d8",
                      borderRadius: 4,
                      backgroundColor: "#ffffff",
                      color: "#000000",
                    }}
                    className="overflow-y-auto"
                  />
                </div>
              )}
            </div>

            {/* Footer Toolbar */}
            <div
              style={{
                borderTop: "1px solid #d8d8d8",
                backgroundColor: "#fcfcfc",
                padding: "14px 24px",
              }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2 text-xs text-[#595959]">
                <Info className="w-4 h-4 flex-shrink-0 text-[#fa9000]" />
                <span>
                  The Critical Path and PERT network diagram will re-calculate automatically upon saving.
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <DrawerClose asChild>
                  <button
                    type="button"
                    style={{
                      borderRadius: 18,
                      padding: "7px 18px",
                      fontSize: 14,
                      fontFamily: "'Roboto', sans-serif",
                      fontWeight: 400,
                      border: "1px solid #d8d8d8",
                      backgroundColor: "#ffffff",
                      color: "#333333",
                      cursor: "pointer",
                      lineHeight: 1,
                    }}
                    className="hover:bg-[#f0f0f0] transition-colors"
                  >
                    Cancel
                  </button>
                </DrawerClose>

                <button
                  type="button"
                  onClick={handleApply}
                  style={{
                    backgroundColor: success ? "#009e60" : "#fa9000",
                    color: "#ffffff",
                    borderRadius: 18,
                    padding: "7px 22px",
                    fontSize: 14,
                    fontFamily: "'Roboto', sans-serif",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    lineHeight: 1,
                    transition: "all 0.2s ease",
                  }}
                  className="shadow-sm hover:opacity-90 active:scale-95 inline-flex items-center gap-1.5"
                >
                  {success ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Applied!
                    </>
                  ) : (
                    "Apply Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
});
