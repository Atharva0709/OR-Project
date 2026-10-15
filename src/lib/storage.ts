import { PertStyles, TaskInput } from "@@/lib/main";

export interface AppSettings {
  deadline: number | null;
  targetProbability: number | null;
  estimationMode: "cpm" | "pert";
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  deadline: null,
  targetProbability: null,
  estimationMode: "cpm",
};

const STORAGE_KEYS = {
  tasks: "pert_project_tasks_v2",
  styles: "pert_project_styles_v2",
  settings: "pert_project_settings_v2",
} as const;

/**
 * Validates a potential TaskInput object.
 */
function isValidTaskInput(item: unknown): item is TaskInput {
  if (typeof item !== "object" || item === null) return false;
  const t = item as Record<string, unknown>;
  if (typeof t.key !== "string" && typeof t.key !== "number") return false;
  if (typeof t.text !== "string") return false;

  const hasThreePoint =
    t.optimistic !== undefined || t.mostLikely !== undefined || t.pessimistic !== undefined;

  if (hasThreePoint) {
    if (
      typeof t.optimistic !== "number" ||
      typeof t.mostLikely !== "number" ||
      typeof t.pessimistic !== "number"
    ) {
      return false;
    }
  } else if (t.duration !== undefined) {
    if (typeof t.duration !== "number") return false;
  }

  if (t.dependsOn !== undefined && !Array.isArray(t.dependsOn)) {
    return false;
  }

  return true;
}

export const StorageService = {
  loadTasks(fallback: TaskInput[]): TaskInput[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.tasks);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return fallback;

      const validTasks: TaskInput[] = [];
      for (const item of parsed) {
        if (isValidTaskInput(item)) {
          validTasks.push({
            key: String(item.key),
            text: String(item.text),
            duration: item.duration !== undefined ? Number(item.duration) : undefined,
            optimistic: item.optimistic !== undefined ? Number(item.optimistic) : undefined,
            mostLikely: item.mostLikely !== undefined ? Number(item.mostLikely) : undefined,
            pessimistic: item.pessimistic !== undefined ? Number(item.pessimistic) : undefined,
            dependsOn: Array.isArray(item.dependsOn) ? item.dependsOn.map(String) : [],
          });
        }
      }
      return validTasks;
    } catch (err: unknown) {
      console.warn("StorageService: Failed to load tasks from localStorage", err);
      return fallback;
    }
  },

  saveTasks(tasks: TaskInput[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
    } catch (err: unknown) {
      console.warn("StorageService: Failed to save tasks to localStorage", err);
    }
  },

  loadStyles(fallback: PertStyles): PertStyles {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.styles);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      if (typeof parsed !== "object" || parsed === null) return fallback;
      return { ...fallback, ...parsed };
    } catch (err: unknown) {
      console.warn("StorageService: Failed to load styles from localStorage", err);
      return fallback;
    }
  },

  saveStyles(styles: PertStyles): void {
    try {
      localStorage.setItem(STORAGE_KEYS.styles, JSON.stringify(styles));
    } catch (err: unknown) {
      console.warn("StorageService: Failed to save styles to localStorage", err);
    }
  },

  loadSettings(fallback: AppSettings): AppSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.settings);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      if (typeof parsed !== "object" || parsed === null) return fallback;

      return {
        deadline: typeof parsed.deadline === "number" ? parsed.deadline : null,
        targetProbability:
          typeof parsed.targetProbability === "number" ? parsed.targetProbability : null,
        estimationMode:
          parsed.estimationMode === "pert" || parsed.estimationMode === "cpm"
            ? parsed.estimationMode
            : "cpm",
      };
    } catch (err: unknown) {
      console.warn("StorageService: Failed to load settings from localStorage", err);
      return fallback;
    }
  },

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
    } catch (err: unknown) {
      console.warn("StorageService: Failed to save settings to localStorage", err);
    }
  },

  exportProjectJson(tasks: TaskInput[], styles: PertStyles, settings: AppSettings): void {
    const payload = {
      version: "2.0.0",
      timestamp: new Date().toISOString(),
      tasks,
      styles,
      settings,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `project-pert-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  parseImportedProject(
    jsonString: string
  ): { tasks: TaskInput[]; styles?: PertStyles; settings?: AppSettings } | null {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        // Direct array of tasks
        const tasks: TaskInput[] = [];
        for (const item of parsed) {
          if (isValidTaskInput(item)) {
            tasks.push(item);
          }
        }
        return { tasks };
      }

      if (typeof parsed === "object" && parsed !== null && Array.isArray(parsed.tasks)) {
        const tasks: TaskInput[] = [];
        for (const item of parsed.tasks) {
          if (isValidTaskInput(item)) {
            tasks.push(item);
          }
        }
        return {
          tasks,
          styles: typeof parsed.styles === "object" ? parsed.styles : undefined,
          settings: typeof parsed.settings === "object" ? parsed.settings : undefined,
        };
      }
      return null;
    } catch (err: unknown) {
      console.warn("StorageService: parseImportedProject failed", err);
      return null;
    }
  },
};
