import { PertStyles, TaskInput } from "@@/lib/main";
import { THEME } from "./theme";

/**
 * Initial tasks list starts empty per specification.
 * Sample tasks can be populated using the "Load Example" buttons.
 */
export const initTasks: TaskInput[] = [];

export const initialStyles: PertStyles = {
  disableGrid: false,
  taskSize: 100,
  fontFamily: "system-ui",
  fontSize: "md",
  textColor: THEME.colors.ink,
  chartBackground: "#ffffff00",
  taskBackground: "#aaaeff",
  gridColor: "#83838350",
  borderWidth: 1,
  selectedBorderWidth: 3,
  hoverBorderWidth: 2,
  borderColor: "#615f77",
  selectedBorderColor: "#6868ff",
  criticalColor: THEME.colors.primary,
  arrowColor: "#615f77",
  arrowWidth: 2,
  gap: { x: 100, y: 100 },
};
