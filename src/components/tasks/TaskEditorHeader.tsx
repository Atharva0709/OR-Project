/**
 * Operations Research: Task Editor Header
 *
 * Header banner with eyebrow accent bar, task counter badge,
 * estimation mode switcher (CPM vs PERT), and view tabs (Table vs JSON).
 */

import { memo } from "react";
import { DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { THEME } from "@/constants/theme";
import { UI_STRINGS } from "@/constants/strings";
import { Layers, Sparkles, Table2, Code2 } from "lucide-react";

interface TaskEditorHeaderProps {
  taskCount: number;
  mode: "cpm" | "pert";
  activeTab: "table" | "json";
  onToggleMode: (mode: "cpm" | "pert") => void;
  onSwitchToTable: () => void;
  onSwitchToJson: () => void;
}

export const TaskEditorHeader = memo(
  ({
    taskCount,
    mode,
    activeTab,
    onToggleMode,
    onSwitchToTable,
    onSwitchToJson,
  }: TaskEditorHeaderProps) => {
    return (
      <DrawerHeader
        style={{
          backgroundColor: THEME.colors.navy,
          padding: "14px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
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
              {taskCount} {taskCount === 1 ? "Task" : "Tasks"}
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
              onClick={() => onToggleMode("cpm")}
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
              onClick={() => onToggleMode("pert")}
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
              onClick={activeTab === "table" ? undefined : onSwitchToTable}
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
              onClick={activeTab === "json" ? undefined : onSwitchToJson}
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
    );
  }
);
