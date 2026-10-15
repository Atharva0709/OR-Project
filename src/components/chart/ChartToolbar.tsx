/**
 * Operations Research: Chart Floating Control Toolbar
 *
 * Provides canvas navigation (Zoom In/Out, Reset View), scale readout,
 * export triggers, and node anatomy legend access.
 */

import { memo } from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { UI_STRINGS } from "@/constants/strings";
import { ChartLegendPopover } from "./ChartLegendPopover";
import { ChartExportMenu } from "./ChartExportMenu";

interface ChartToolbarProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  svgContainerRef: React.RefObject<HTMLDivElement | null>;
}

export const ChartToolbar = memo(
  ({ scale, onZoomIn, onZoomOut, onReset, svgContainerRef }: ChartToolbarProps) => {
    return (
      <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm p-1 rounded-md border border-[#d8d8d8] shadow-sm">
        <button
          type="button"
          onClick={onZoomIn}
          aria-label={UI_STRINGS.app.zoomIn}
          title={UI_STRINGS.app.zoomIn}
          className="p-1.5 rounded hover:bg-neutral-100 text-[#404040] transition-colors focus:outline-none focus:ring-2 focus:ring-[#fa9000]"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onZoomOut}
          aria-label={UI_STRINGS.app.zoomOut}
          title={UI_STRINGS.app.zoomOut}
          className="p-1.5 rounded hover:bg-neutral-100 text-[#404040] transition-colors focus:outline-none focus:ring-2 focus:ring-[#fa9000]"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onReset}
          aria-label={UI_STRINGS.app.resetZoom}
          title={UI_STRINGS.app.resetZoom}
          className="p-1.5 rounded hover:bg-neutral-100 text-[#404040] transition-colors focus:outline-none focus:ring-2 focus:ring-[#fa9000]"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <span className="text-[11px] font-mono text-[#525252] px-1 min-w-[36px] text-center">
          {Math.round(scale * 100)}%
        </span>

        <div className="w-[1px] h-4 bg-[#d8d8d8] mx-0.5" />

        <ChartExportMenu svgContainerRef={svgContainerRef} />

        <ChartLegendPopover />
      </div>
    );
  }
);
