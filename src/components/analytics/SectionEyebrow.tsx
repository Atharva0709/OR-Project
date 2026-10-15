/**
 * Operations Research: Section Eyebrow Label with Accent Bar
 */

import { memo } from "react";
import { THEME } from "@/constants/theme";

interface SectionEyebrowProps {
  label: string;
}

export const SectionEyebrow = memo(({ label }: SectionEyebrowProps) => {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div
        style={{
          width: THEME.dimensions.eyebrowBarWidth,
          height: 16,
          backgroundColor: THEME.colors.primary,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: THEME.typography.fontFamily,
          fontSize: THEME.typography.fontSizeXs,
          fontWeight: 700,
          color: THEME.colors.inkMuted,
          textTransform: "uppercase",
          letterSpacing: 1.2,
        }}
      >
        {label}
      </span>
    </div>
  );
});
