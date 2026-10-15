/**
 * Operations Research: Chart Canvas Style Settings
 *
 * Controls background canvas tint, grid line visibility, and grid stroke color.
 */

import { memo } from "react";
import { PertStyles } from "@@/lib/main";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Color } from "../Color";
import { StylingSectionEyebrow } from "./StylingSectionEyebrow";
import { UI_STRINGS } from "@/constants/strings";

interface ChartCanvasSettingsProps {
  styles: PertStyles;
  onChange: <K extends keyof PertStyles>(key: K, value: PertStyles[K]) => void;
}

export const ChartCanvasSettings = memo(
  ({ styles, onChange }: ChartCanvasSettingsProps) => {
    return (
      <div className="space-y-4 pb-4 border-b border-[#d8d8d8]">
        <StylingSectionEyebrow label={UI_STRINGS.sidebar.sections.chartSettings} />
        <div className="flex justify-between items-center">
          <Label htmlFor="chart-bg" className="text-xs font-medium text-[#111111]">
            Chart Background
          </Label>
          <Separator className="flex-1 mx-2" />
          <Color
            color={styles.chartBackground}
            colorName="chartBackground"
            handleChange={onChange}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="disable-grid" className="text-xs font-medium text-[#111111]">
            Disable Grid
          </Label>
          <Switch
            id="disable-grid"
            checked={styles.disableGrid}
            onCheckedChange={(checked) => onChange("disableGrid", checked)}
          />
        </div>
        <div className="flex justify-between items-center">
          <Label htmlFor="grid-color" className="text-xs font-medium text-[#111111]">
            Grid Color
          </Label>
          <Separator className="flex-1 mx-2" />
          <Color
            color={styles.gridColor}
            colorName="gridColor"
            handleChange={onChange}
          />
        </div>
      </div>
    );
  }
);
