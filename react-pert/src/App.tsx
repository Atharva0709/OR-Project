import { useCallback, useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/Sidebar";
import { PertChart } from "./components/PertChart";
import { ScrollArea, ScrollBar } from "./components/ui/scroll-area";
import { TasksDrawer } from "./components/TasksDrawer";
import { PertStyles, Task, TaskInput } from "@@/lib/main";
import { initialStyles, initTasks } from "./constants/initStates";
import "./index.css";

function App() {
  const [styles, setStyles] = useState(initialStyles);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [tasks, setTasks] = useState(initTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleSetStyles = useCallback((key: keyof PertStyles, value: any) => {
    setStyles((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSetTasks = useCallback((newTasks: TaskInput[]) => {
    setTasks(newTasks);
  }, []);

  const handleSelect = useCallback((Task: Task) => {
    console.log("selected task", Task);
    setSelectedTask(Task);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#ffffff]" style={{ fontFamily: "'Roboto', sans-serif" }}>
      {/* ── Top Navigation Bar ── */}
      <header className="flex items-center justify-between border-b border-[#d8d8d8] px-4" style={{ height: 56 }}>
        {/* Left: Logo block + title */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center px-2.5"
            style={{
              backgroundColor: "#fa9000",
              height: 36,
              borderRadius: 0,
            }}
          >
            <span style={{ color: "#ffffff", fontWeight: 900, fontSize: 13, letterSpacing: 1 }}>PROJECT</span>
          </div>
          <span style={{ color: "#000000", fontWeight: 700, fontSize: 20 }}>Project Analyzer</span>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          {/* Edit Tasks — black pill button */}
          <TasksDrawer tasks={tasks} setTasks={handleSetTasks} />
        </div>
      </header>

      {/* ── Body: Sidebar + Main ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar container */}
        <div
          className={cn(
            "relative transition-all duration-300 ease-in-out flex-shrink-0",
            isSidebarOpen ? "w-80" : "w-0"
          )}
        >
          <div
            className={cn(
              "absolute top-0 left-0 h-full transition-transform duration-300 ease-in-out",
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <Sidebar
              selectedTask={selectedTask}
              {...styles}
              onStyleChange={handleSetStyles}
            />
          </div>

          {/* Sidebar toggle pill */}
          <button
            className="absolute -right-4 top-12 z-50 flex items-center justify-center"
            style={{
              backgroundColor: "#000000",
              color: "#ffffff",
              width: 28,
              height: 28,
              borderRadius: 9999,
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
        </div>

        {/* Main content */}
        <main className="flex flex-col flex-1 px-5 py-4 transition-all duration-300 overflow-hidden">
          {/* Section Eyebrow */}
          <div className="flex items-center gap-3 mb-3">
            <div style={{ width: 8, height: 24, backgroundColor: "#fa9000", flexShrink: 0 }} />
            <span
              style={{
                fontFamily: "'Roboto', sans-serif",
                fontSize: 14,
                fontWeight: 300,
                color: "#595959",
                textTransform: "uppercase",
                letterSpacing: 1.5,
              }}
            >
              Project Analyzer — Critical Path Visualization
            </span>
          </div>

          {/* Chart area — flat, hairline border */}
          <div
            className="flex-1"
            style={{
              border: "1px solid #d8d8d8",
              borderRadius: 0,
              overflow: "hidden",
              minHeight: 0,
            }}
          >
            <ScrollArea className="h-full whitespace-nowrap">
              <PertChart styles={styles} tasks={tasks} handleSelect={handleSelect} />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
