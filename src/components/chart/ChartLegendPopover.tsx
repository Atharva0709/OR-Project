/**
 * Operations Research: Chart Node Anatomy Legend Popover
 *
 * Explains the standard AON (Activity on Node) layout with ES, EF, LS, LF,
 * Slack (Float), and Task Name.
 */

import { memo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Info } from "lucide-react";
import { THEME } from "@/constants/theme";

export const ChartLegendPopover = memo(() => {
  const previewRadius = THEME.dimensions.nodePreviewRadius;

  return (
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
            Activity Node Anatomy
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
              fontSize: 12,
              textAlign: "justify",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              color: THEME.colors.inkMuted,
            }}
          >
            <li>
              <strong style={{ color: THEME.colors.ink }}>Earliest Start (ES):</strong> The earliest possible time the activity can begin.
            </li>
            <li>
              <strong style={{ color: THEME.colors.ink }}>Latest Start (LS):</strong> The latest time the activity can start without delaying project completion.
            </li>
            <li>
              <strong style={{ color: THEME.colors.ink }}>Earliest Finish (EF):</strong> ES + Duration.
            </li>
            <li>
              <strong style={{ color: THEME.colors.ink }}>Latest Finish (LF):</strong> LS + Duration.
            </li>
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
});
