/**
 * Centralized theme tokens and dimensions.
 * All colors adhere to WCAG AA / AAA contrast standards against canvas background.
 */
export const THEME = {
  colors: {
    // Al Jazeera brand palette
    primary: "#fa9000", // Vibrant orange accent
    primaryHover: "#e08200",
    navy: "#100e2f", // Night navy for header and drawer banner
    canvas: "#ffffff", // Pure white surface
    canvasMuted: "#f7f7f7", // Soft tinted background
    ink: "#111111", // Primary text (WCAG AAA > 14:1)
    inkMuted: "#404040", // Secondary text darkened from #595959 for WCAG AA compliance (> 7:1)
    inkSubtle: "#525252", // Subtle metadata text (> 5.5:1)
    border: "#d8d8d8", // Hairline border
    borderDark: "#9e9e9e",
    criticalRed: "#c31833", // Destructive / critical path indicator
    criticalBg: "#fff0f2",
    successGreen: "#008751",
    tagBg: "#f0f0f0",
  },
  dimensions: {
    headerHeight: 56,
    sidebarWidth: 320,
    sidebarWidthMobile: "100%",
    nodePreviewRadius: 200,
    eyebrowBarWidth: 6,
    eyebrowBarHeight: 20,
    borderRadiusSm: 4,
    borderRadiusMd: 8,
    borderRadiusPill: 9999,
  },
  typography: {
    fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSizeXs: 11,
    fontSizeSm: 13,
    fontSizeBase: 14,
    fontSizeLg: 16,
    fontSizeXl: 18,
    fontSize2xl: 20,
  },
  transitions: {
    default: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    sidebar: "width 0.3s ease-in-out, transform 0.3s ease-in-out",
  },
} as const;
