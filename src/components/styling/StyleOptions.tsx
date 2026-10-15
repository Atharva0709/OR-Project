/**
 * Operations Research: Style Options Feature Orchestrator
 *
 * Coordinates chart background, grid options, task node typography,
 * border styling, critical path highlighting, and layout gap settings.
 */

import { PertStyles } from "@@/lib/main";
import { memo, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CopyDrawer } from "../CopyDrawer";
import { THEME } from "@/constants/theme";
import { UI_STRINGS } from "@/constants/strings";
import { ChartCanvasSettings } from "./ChartCanvasSettings";
import { TaskNodeSettings } from "./TaskNodeSettings";
import { BorderSettings } from "./BorderSettings";
import { ArrowSettings } from "./ArrowSettings";
import { LayoutGapSettings } from "./LayoutGapSettings";

export interface StyleOptionsProps extends PertStyles {
  onStyleChange: <K extends keyof PertStyles>(key: K, value: PertStyles[K]) => void;
}

export const StyleOptions = memo(({ onStyleChange, ...styles }: StyleOptionsProps) => {
  const handleChange = useCallback(
    <K extends keyof PertStyles>(key: K, value: PertStyles[K]) => {
      onStyleChange(key, value);
    },
    [onStyleChange]
  );

  return (
    <ScrollArea className="h-[calc(100dvh-56px-44px)] px-4 pb-6">
      <div className="space-y-6 pt-4">
        {/* Header row */}
        <div className="flex justify-between items-center">
          <span
            style={{
              fontFamily: THEME.typography.fontFamily,
              fontSize: THEME.typography.fontSizeSm,
              fontWeight: 700,
              color: THEME.colors.ink,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {UI_STRINGS.sidebar.sections.chartProperties}
          </span>
          <CopyDrawer styles={styles} />
        </div>

        {/* 1. Canvas Background & Grid */}
        <ChartCanvasSettings styles={styles} onChange={handleChange} />

        {/* 2. Task Node Typography & Size */}
        <TaskNodeSettings styles={styles} onChange={handleChange} />

        {/* 3. Node Border & Hover/Selection */}
        <BorderSettings styles={styles} onChange={handleChange} />

        {/* 4. Arrow Connectors & Critical Path Colors */}
        <ArrowSettings styles={styles} onChange={handleChange} />

        {/* 5. Topological Layout Gaps */}
        <LayoutGapSettings styles={styles} onChange={handleChange} />
      </div>
    </ScrollArea>
  );
});
