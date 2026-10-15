/**
 * Operations Research: Node Border Settings
 *
 * Configures border width, hover state width, selected state width,
 * normal border color, and selected highlight border color.
 */

import { memo } from "react";
import { PertStyles } from "@@/lib/main";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Color } from "../Color";
import { StylingSectionEyebrow } from "./StylingSectionEyebrow";
import { UI_STRINGS } from "@/constants/strings";

interface BorderSettingsProps {
  styles: PertStyles;
  onChange: <K extends keyof PertStyles>(key: K, value: PertStyles[K]) => void;
}

export const BorderSettings = memo(
  ({ styles, onChange }: BorderSettingsProps) => {
    return (
      <div className="space-y-4 pb-4 border-b border-[#d8d8d8]">
        <StylingSectionEyebrow label={UI_STRINGS.sidebar.sections.borderSettings} />
        <div className="space-y-2">
          <Label className="text-xs font-medium text-[#111111]">
            Border Width ({styles.borderWidth}px)
          </Label>
          <Slider
            value={[styles.borderWidth || 1]}
            min={1}
            max={5}
            step={1}
            onValueChange={([value]) => onChange("borderWidth", value)}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-medium text-[#111111]">
            Selected Border Width ({styles.selectedBorderWidth}px)
          </Label>
          <Slider
            value={[styles.selectedBorderWidth || 3]}
            min={1}
            max={5}
            step={1}
            onValueChange={([value]) => onChange("selectedBorderWidth", value)}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-medium text-[#111111]">
            Hover Border Width ({styles.hoverBorderWidth}px)
          </Label>
          <Slider
            value={[styles.hoverBorderWidth || 2]}
            min={1}
            max={5}
            step={1}
            onValueChange={([value]) => onChange("hoverBorderWidth", value)}
          />
        </div>
        <div className="flex justify-between items-center">
          <Label className="text-xs font-medium text-[#111111]">Border Color</Label>
          <Separator className="flex-1 mx-2" />
          <Color
            color={styles.borderColor}
            colorName="borderColor"
            handleChange={onChange}
          />
        </div>
        <div className="flex justify-between items-center">
          <Label className="text-xs font-medium text-[#111111]">Selected Border Color</Label>
          <Separator className="flex-1 mx-2" />
          <Color
            color={styles.selectedBorderColor}
            colorName="selectedBorderColor"
            handleChange={onChange}
          />
        </div>
      </div>
    );
  }
);
