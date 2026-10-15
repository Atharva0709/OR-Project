/**
 * Operations Research: Chart Pan & Zoom Hook
 *
 * Manages 2D viewport translation (pan) and scaling (zoom) with pointer capture,
 * mouse wheel interpolation, and boundary clamps.
 */

import { useState, useRef, useCallback } from "react";

export function useChartPanZoom() {
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
      // Don't drag if clicking buttons, inputs, links, or popover dialogs
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
      // Pointer capture might already be released
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

  return {
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
  };
}
