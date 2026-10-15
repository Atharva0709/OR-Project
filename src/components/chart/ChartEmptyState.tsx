/**
 * Operations Research: Chart Empty State Display
 */

import { memo } from "react";
import { THEME } from "@/constants/theme";
import { UI_STRINGS } from "@/constants/strings";
import { Move, PlusCircle } from "lucide-react";

interface ChartEmptyStateProps {
  onOpenDrawer?: () => void;
}

export const ChartEmptyState = memo(({ onOpenDrawer }: ChartEmptyStateProps) => {
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
        style={{
          backgroundColor: THEME.colors.canvas,
          border: `1px solid ${THEME.colors.border}`,
        }}
      >
        <Move style={{ color: THEME.colors.primary, width: 28, height: 28 }} />
      </div>
      <h3 className="text-lg font-bold mb-2" style={{ color: THEME.colors.ink }}>
        {UI_STRINGS.app.emptyStateTitle}
      </h3>
      <p className="text-sm max-w-sm mb-6" style={{ color: THEME.colors.inkMuted }}>
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
});
