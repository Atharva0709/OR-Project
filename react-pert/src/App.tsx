import { useCallback, useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Download, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/Sidebar";
import { PertChart } from "./components/PertChart";
import { TasksDrawer } from "./components/TasksDrawer";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { PertStyles, Task, TaskInput } from "@@/lib/main";
import { initialStyles, initTasks } from "./constants/initStates";
import { pertExampleTasks } from "./constants/examples";
import { THEME } from "./constants/theme";
import { UI_STRINGS } from "./constants/strings";
import { StorageService, AppSettings, DEFAULT_APP_SETTINGS } from "./lib/storage";
import "./index.css";

function App() {
  // Load initial states with localStorage persistence & schema validation
  const [styles, setStyles] = useState<PertStyles>(() =>
    StorageService.loadStyles(initialStyles)
  );
  const [tasks, setTasks] = useState<TaskInput[]>(() =>
    StorageService.loadTasks(initTasks)
  );
  const [settings, setSettings] = useState<AppSettings>(() =>
    StorageService.loadSettings(DEFAULT_APP_SETTINGS)
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Sync state changes to localStorage
  useEffect(() => {
    StorageService.saveStyles(styles);
  }, [styles]);

  useEffect(() => {
    StorageService.saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    StorageService.saveSettings(settings);
  }, [settings]);

  const handleSetStyles = useCallback(
    <K extends keyof PertStyles>(key: K, value: PertStyles[K]) => {
      setStyles((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleSetTasks = useCallback((newTasks: TaskInput[]) => {
    setTasks(newTasks);
    setSelectedTask(null);
  }, []);

  const handleSelect = useCallback((task: Task | null) => {
    setSelectedTask(task);
  }, []);

  const handleDeadlineChange = useCallback((val: number | null) => {
    setSettings((prev) => ({ ...prev, deadline: val }));
  }, []);

  const handleTargetProbChange = useCallback((val: number | null) => {
    setSettings((prev) => ({ ...prev, targetProbability: val }));
  }, []);

  const handleEstimationModeChange = useCallback((mode: "cpm" | "pert") => {
    setSettings((prev) => ({ ...prev, estimationMode: mode }));
  }, []);

  const handleLoadSample = useCallback(() => {
    setTasks(pertExampleTasks);
    setSettings((prev) => ({ ...prev, estimationMode: "pert" }));
  }, []);

  const handleExportProject = useCallback(() => {
    StorageService.exportProjectJson(tasks, styles, settings);
  }, [tasks, styles, settings]);

  return (
    <div
      className="flex flex-col min-h-[100dvh] bg-white text-[#111111]"
      style={{ fontFamily: THEME.typography.fontFamily }}
    >
      {/* ── Top Navigation Bar ── */}
      <header
        className="flex items-center justify-between border-b px-4 z-40 bg-white"
        style={{ height: THEME.dimensions.headerHeight, borderColor: THEME.colors.border }}
      >
        {/* Left: Brand logo + Title */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center px-2.5 shadow-sm"
            style={{
              backgroundColor: THEME.colors.primary,
              height: 36,
            }}
          >
            <span
              style={{
                color: THEME.colors.canvas,
                fontWeight: 900,
                fontSize: 13,
                letterSpacing: 1.2,
              }}
            >
              {UI_STRINGS.app.logo}
            </span>
          </div>
          <div>
            <h1
              className="font-bold text-lg leading-tight"
              style={{ color: THEME.colors.ink }}
            >
              {UI_STRINGS.app.title}
            </h1>
            <p className="text-[11px] text-[#525252] hidden sm:block">
              {settings.estimationMode === "pert" ? "3-Point (PERT) Mode" : "Deterministic (CPM) Mode"}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {tasks.length === 0 && (
            <button
              type="button"
              onClick={handleLoadSample}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#111111] bg-neutral-100 hover:bg-neutral-200 border border-[#d8d8d8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#fa9000]"
              title="Load standard PERT 3-point sample project"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#fa9000]" />
              {UI_STRINGS.app.loadExampleButton}
            </button>
          )}

          <button
            type="button"
            onClick={handleExportProject}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#404040] hover:bg-neutral-100 border border-[#d8d8d8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#fa9000]"
            title={UI_STRINGS.app.exportProjectButton}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Export</span>
          </button>

          <TasksDrawer
            tasks={tasks}
            setTasks={handleSetTasks}
            estimationMode={settings.estimationMode}
            onEstimationModeChange={handleEstimationModeChange}
          />
        </div>
      </header>

      {/* ── Main Body: Responsive Sidebar + Canvas ── */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Mobile Sidebar Backdrop */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-20 md:hidden transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar Container */}
        <aside
          className={cn(
            "fixed md:relative top-14 md:top-0 bottom-0 left-0 z-30 md:z-10 bg-white transition-all duration-300 ease-in-out flex-shrink-0 overflow-visible",
            isSidebarOpen
              ? "w-80 translate-x-0"
              : "w-0 -translate-x-full md:translate-x-0"
          )}
        >
          <div className="w-80 h-full overflow-hidden">
            <Sidebar
              selectedTask={selectedTask}
              deadline={settings.deadline}
              setDeadline={handleDeadlineChange}
              targetProbability={settings.targetProbability}
              setTargetProbability={handleTargetProbChange}
              {...styles}
              onStyleChange={handleSetStyles}
            />
          </div>

          {/* Sidebar Toggle Pill */}
          <button
            type="button"
            aria-label={isSidebarOpen ? UI_STRINGS.app.toggleSidebarOpen : UI_STRINGS.app.toggleSidebarClose}
            className="absolute -right-3.5 top-8 z-50 flex items-center justify-center shadow-md focus:outline-none focus:ring-2 focus:ring-[#fa9000]"
            style={{
              backgroundColor: THEME.colors.ink,
              color: THEME.colors.canvas,
              width: 28,
              height: 28,
              borderRadius: THEME.dimensions.borderRadiusPill,
              border: "none",
              cursor: "pointer",
            }}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? (
              <ChevronLeft style={{ width: 14, height: 14 }} />
            ) : (
              <ChevronRight style={{ width: 14, height: 14 }} />
            )}
          </button>
        </aside>

        {/* Chart Viewport */}
        <main className="flex flex-col flex-1 p-3 md:p-4 overflow-hidden bg-neutral-50/50">
          {/* Eyebrow Label & Hint */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div
                style={{
                  width: THEME.dimensions.eyebrowBarWidth,
                  height: THEME.dimensions.eyebrowBarHeight,
                  backgroundColor: THEME.colors.primary,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: THEME.typography.fontFamily,
                  fontSize: 12,
                  fontWeight: 600,
                  color: THEME.colors.inkMuted,
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                }}
              >
                {UI_STRINGS.app.subtitle}
              </span>
            </div>

            <span className="text-[11px] text-[#525252] hidden lg:block">
              {UI_STRINGS.app.panZoomHint}
            </span>
          </div>

          {/* Interactive Chart Container */}
          <div
            className="flex-1 bg-white relative rounded-none overflow-hidden"
            style={{
              border: `1px solid ${THEME.colors.border}`,
              minHeight: 0,
            }}
          >
            <ErrorBoundary fallbackTitle="PERT Chart Calculation Error">
              <PertChart
                styles={styles}
                tasks={tasks}
                handleSelect={handleSelect}
                onOpenDrawer={handleLoadSample}
              />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
