/**
 * Operations Research: Interactive Topological Network Chart
 *
 * Orchestrates 2D pan/zoom viewport transformations, floating navigation controls,
 * SVG/PNG exports, and the core SVG topological node graph.
 */

import { useRef } from "react";
import { Pert, PertStyles, Task, TaskInput } from "@@/lib/main";
import { useChartPanZoom } from "./useChartPanZoom";
import { ChartToolbar } from "./ChartToolbar";
import { ChartEmptyState } from "./ChartEmptyState";

export interface PertChartProps {
  styles: PertStyles;
  tasks: TaskInput[];
  handleSelect: (task: Task) => void;
  onOpenDrawer?: () => void;
}

export function PertChart({
  styles,
  tasks,
  handleSelect,
  onOpenDrawer,
}: PertChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const {
    scale,
    pan,
    isDragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleWheel,
    handleZoomIn,
    handleZoomOut,
    handleReset,
  } = useChartPanZoom();

  if (tasks.length === 0) {
    return <ChartEmptyState onOpenDrawer={onOpenDrawer} />;
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden w-full h-full select-none"
      style={{
        cursor: isDragging ? "grabbing" : "grab",
        touchAction: "none",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
    >
      {/* Floating Toolbar: Zoom, Reset, Export, Legend */}
      <ChartToolbar
        scale={scale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
        svgContainerRef={containerRef}
      />

      {/* Canvas with Pan & Zoom Transform */}
      <div
        className="origin-top-left transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          width: "max-content",
          height: "max-content",
          minWidth: "100%",
          minHeight: "100%",
          display: "grid",
          placeItems: "center",
          padding: 32,
        }}
      >
        <Pert tasks={tasks} styles={styles} onSelect={handleSelect} />
      </div>
    </div>
  );
}
