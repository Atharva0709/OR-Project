import { useState, useRef, useCallback } from "react";
import { Pert, PertStyles, Task, TaskInput } from "@@/lib/main";
import { Info, ZoomIn, ZoomOut, RotateCcw, Move, PlusCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { THEME } from "@/constants/theme";
import { UI_STRINGS } from "@/constants/strings";

interface PertChartProps {
  styles: PertStyles;
  tasks: TaskInput[];
  handleSelect: (task: Task) => void;
  onOpenDrawer?: () => void;
}

export function PertChart({ styles, tasks, handleSelect, onOpenDrawer }: PertChartProps) {
  const previewRadius = THEME.dimensions.nodePreviewRadius;

  // Pan and Zoom state
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number }>({
    x: 0,
    y: 0,
    panX: 0,
    panY: 0,
  });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Don't drag if clicking buttons or popovers
      if ((e.target as HTMLElement).closest("button, a, input, [role='dialog']")) return;
      setIsDragging(true);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX: pan.x,
        panY: pan.y,
      };
    },
    [pan.x, pan.y]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPan({
        x: dragStartRef.current.panX + dx,
        y: dragStartRef.current.panY + dy,
      });
    },
    [isDragging]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture already released
    }
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setScale((prev) => Math.min(Math.max(Number((prev * zoomFactor).toFixed(2)), 0.25), 3));
  }, []);

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(Number((prev + 0.15).toFixed(2)), 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(Number((prev - 0.15).toFixed(2)), 0.25));
  }, []);

  const handleReset = useCallback(() => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Empty state handling
  if (tasks.length === 0) {
    return (
      <div
        className="relative flex flex-col items-center justify-center h-full w-full p-8 text-center"
        style={{
          minHeight: 400,
          backgroundColor: THEME.colors.canvasMuted,
          fontFamily: THEME.typography.fontFamily,
        }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{ backgroundColor: THEME.colors.canvas, border: `1px solid ${THEME.colors.border}` }}
        >
          <Move style={{ color: THEME.colors.primary, width: 28, height: 28 }} />
        </div>
        <h3
          className="text-lg font-bold mb-2"
          style={{ color: THEME.colors.ink }}
        >
          {UI_STRINGS.app.emptyStateTitle}
        </h3>
        <p
          className="text-sm max-w-sm mb-6"
          style={{ color: THEME.colors.inkMuted }}
        >
          {UI_STRINGS.app.emptyStateSubtitle}
        </p>
        {onOpenDrawer && (
          <button
            type="button"
            onClick={onOpenDrawer}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold shadow-sm transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              backgroundColor: THEME.colors.ink,
              color: THEME.colors.canvas,
            }}
          >
            <PlusCircle className="w-4 h-4" />
            {UI_STRINGS.app.editTasksButton}
          </button>
        )}
      </div>
    );
  }

  return (
    <div
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
      {/* Floating Toolbar: Zoom & Info */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm p-1 rounded-md border border-[#d8d8d8] shadow-sm">
        <button
          type="button"
          onClick={handleZoomIn}
          aria-label={UI_STRINGS.app.zoomIn}
          title={UI_STRINGS.app.zoomIn}
          className="p-1.5 rounded hover:bg-neutral-100 text-[#404040] transition-colors focus:outline-none focus:ring-2 focus:ring-[#fa9000]"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          aria-label={UI_STRINGS.app.zoomOut}
          title={UI_STRINGS.app.zoomOut}
          className="p-1.5 rounded hover:bg-neutral-100 text-[#404040] transition-colors focus:outline-none focus:ring-2 focus:ring-[#fa9000]"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleReset}
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

        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="Node Anatomy Information"
              className="p-1.5 rounded hover:bg-neutral-100 text-[#404040] transition-colors focus:outline-none focus:ring-2 focus:ring-[#fa9000]"
            >
              <Info className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            style={{
              backgroundColor: THEME.colors.canvas,
              border: `1px solid ${THEME.colors.border}`,
              borderRadius: THEME.dimensions.borderRadiusSm,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              width: 350,
            }}
            side="left"
            align="start"
          >
            <div className="p-1 flex flex-col items-center">
              <h2
                style={{
                  fontFamily: THEME.typography.fontFamily,
                  fontWeight: 700,
                  fontSize: THEME.typography.fontSizeLg,
                  marginBottom: 12,
                  color: THEME.colors.ink,
                }}
              >
                Task Node
              </h2>
              <svg
                width={previewRadius}
                height={previewRadius}
                viewBox={`0 0 ${previewRadius} ${previewRadius}`}
                xmlns="http://www.w3.org/2000/svg"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                <g>
                  <rect
                    rx="10"
                    ry="10"
                    width={previewRadius}
                    height={previewRadius}
                    strokeWidth={5}
                    style={{ fill: "transparent", stroke: THEME.colors.border }}
                  />
                  <text
                    x={previewRadius / 2}
                    y={previewRadius / 2}
                    style={{ fill: THEME.colors.ink, fontSize: 13, fontWeight: 600 }}
                  >
                    Task Name
                  </text>

                  <text
                    x={previewRadius / 4}
                    y={previewRadius / 6}
                    style={{ fill: THEME.colors.inkMuted, fontSize: 11 }}
                  >
                    Earliest Start
                  </text>
                  <text
                    x={(3 / 4) * previewRadius}
                    y={previewRadius / 6}
                    style={{ fill: THEME.colors.inkMuted, fontSize: 11 }}
                  >
                    Latest Start
                  </text>
                  <text
                    x={previewRadius / 4}
                    y={(previewRadius * 5) / 6}
                    style={{ fill: THEME.colors.inkMuted, fontSize: 11 }}
                  >
                    Earliest Finish
                  </text>
                  <text
                    x={(3 / 4) * previewRadius}
                    y={(previewRadius * 5) / 6}
                    style={{ fill: THEME.colors.inkMuted, fontSize: 11 }}
                  >
                    Latest Finish
                  </text>

                  <path
                    d={`
                      M 0 ${previewRadius / 3}
                      L ${previewRadius} ${previewRadius / 3}
                      M 0 ${(previewRadius * 2) / 3}
                      L ${previewRadius} ${(previewRadius * 2) / 3}
                      M ${previewRadius / 2} ${(previewRadius * 2) / 3}
                      L ${previewRadius / 2} ${previewRadius}
                      M ${previewRadius / 2} 0
                      L ${previewRadius / 2} ${previewRadius / 3}
                    `}
                    style={{ stroke: THEME.colors.border, strokeWidth: 2, fill: "none" }}
                  />
                </g>
              </svg>

              {/* Legend */}
              <ul
                style={{
                  marginTop: 16,
                  fontSize: 13,
                  textAlign: "justify",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  color: THEME.colors.inkMuted,
                }}
              >
                <li>
                  <strong style={{ color: THEME.colors.ink }}>Earliest Start:</strong> The earliest time a task can begin.
                </li>
                <li>
                  <strong style={{ color: THEME.colors.ink }}>Latest Start:</strong> The latest time a task can begin without delaying the project.
                </li>
                <li>
                  <strong style={{ color: THEME.colors.ink }}>Earliest Finish:</strong> The earliest time a task can complete.
                </li>
                <li>
                  <strong style={{ color: THEME.colors.ink }}>Latest Finish:</strong> The latest time a task can complete without delaying the project.
                </li>
              </ul>
            </div>
          </PopoverContent>
        </Popover>
      </div>

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
