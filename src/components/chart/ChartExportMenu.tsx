/**
 * Operations Research: Chart Export Utility (SVG & High-Res PNG)
 *
 * Allows saving the current network visualization as a vector SVG file
 * or high-resolution PNG image.
 */

import { memo, useCallback } from "react";
import { Download } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ChartExportMenuProps {
  svgContainerRef: React.RefObject<HTMLDivElement | null>;
}

export const ChartExportMenu = memo(({ svgContainerRef }: ChartExportMenuProps) => {
  const handleExportSvg = useCallback(() => {
    if (!svgContainerRef.current) return;
    const svgEl = svgContainerRef.current.querySelector("svg");
    if (!svgEl) return;

    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgEl);
    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `or-network-diagram-${new Date().toISOString().slice(0, 10)}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [svgContainerRef]);

  const handleExportPng = useCallback(() => {
    if (!svgContainerRef.current) return;
    const svgEl = svgContainerRef.current.querySelector("svg");
    if (!svgEl) return;

    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgEl);
    const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      // Scale up 2x for sharp retina rendering
      const scaleFactor = 2;
      const bbox = svgEl.getBoundingClientRect();
      canvas.width = (bbox.width || 1200) * scaleFactor;
      canvas.height = (bbox.height || 800) * scaleFactor;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (!blob) return;
          const pngUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = pngUrl;
          a.download = `or-network-diagram-${new Date().toISOString().slice(0, 10)}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(pngUrl);
        });
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [svgContainerRef]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Export Chart"
          title="Export Chart (SVG/PNG)"
          className="p-1.5 rounded hover:bg-neutral-100 text-[#404040] transition-colors focus:outline-none focus:ring-2 focus:ring-[#fa9000]"
        >
          <Download className="w-4 h-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        className="w-44 p-1.5 bg-white border border-[#d8d8d8] shadow-md rounded-md z-50 text-xs"
      >
        <p className="px-2 py-1 text-[11px] font-semibold text-[#525252] border-b border-[#eeeeee]">
          Export Diagram
        </p>
        <button
          type="button"
          onClick={handleExportSvg}
          className="w-full text-left px-2 py-1.5 hover:bg-neutral-100 rounded text-[#111111] transition-colors flex items-center justify-between"
        >
          <span>Vector SVG</span>
          <span className="text-[10px] text-[#525252]">.svg</span>
        </button>
        <button
          type="button"
          onClick={handleExportPng}
          className="w-full text-left px-2 py-1.5 hover:bg-neutral-100 rounded text-[#111111] transition-colors flex items-center justify-between"
        >
          <span>High-Res PNG</span>
          <span className="text-[10px] text-[#525252]">.png</span>
        </button>
      </PopoverContent>
    </Popover>
  );
});
