/**
 * Operations Research: Connector Arrow Settings
 *
 * Configures arrow stroke width, normal connector color,
 * and critical path highlight color.
 */

import { memo } from "react";
import { PertStyles } from "@@/lib/main";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Color } from "../Color";
import { StylingSectionEyebrow } from "./StylingSectionEyebrow";
import { UI_STRINGS } from "@/constants/strings";

interface ArrowSettingsProps {
  styles: PertStyles;
  onChange: <K extends keyof PertStyles>(key: K, value: PertStyles[K]) => void;
}

export const ArrowSettings = memo(
  ({ styles, onChange }: ArrowSettingsProps) => {
    return (
      <div className="space-y-4 pb-4 border-b border-[#d8d8d8]">
        <StylingSectionEyebrow label={UI_STRINGS.sidebar.sections.arrowSettings} />
        <div className="space-y-2">
          <Label className="text-xs font-medium text-[#111111]">
            Arrow Width ({styles.arrowWidth}px)
          </Label>
          <Slider
            value={[styles.arrowWidth || 2]}
            min={1}
            max={5}
            step={1}
            onValueChange={([value]) => onChange("arrowWidth", value)}
          />
        </div>
        <div className="flex justify-between items-center">
          <Label className="text-xs font-medium text-[#111111]">Arrow Color</Label>
          <Separator className="flex-1 mx-2" />
          <Color
            color={styles.arrowColor}
            colorName="arrowColor"
            handleChange={onChange}
          />
        </div>
        <div className="flex justify-between items-center">
          <Label className="text-xs font-medium text-[#111111]">Critical Path Color</Label>
          <Separator className="flex-1 mx-2" />
          <Color
            color={styles.criticalColor}
            colorName="criticalColor"
            handleChange={onChange}
          />
        </div>
      </div>
    );
  }
);
