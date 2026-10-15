/**
 * Operations Research: Topological Layout Gap Settings
 *
 * Configures horizontal distance between topological ranks and
 * vertical distance between concurrent nodes.
 */

import { memo } from "react";
import { PertStyles } from "@@/lib/main";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { StylingSectionEyebrow } from "./StylingSectionEyebrow";
import { UI_STRINGS } from "@/constants/strings";

interface LayoutGapSettingsProps {
  styles: PertStyles;
  onChange: <K extends keyof PertStyles>(key: K, value: PertStyles[K]) => void;
}

export const LayoutGapSettings = memo(
  ({ styles, onChange }: LayoutGapSettingsProps) => {
    return (
      <div className="space-y-4">
        <StylingSectionEyebrow label={UI_STRINGS.sidebar.sections.gapSettings} />
        <div className="space-y-2">
          <Label className="text-xs font-medium text-[#111111]">
            Horizontal Gap ({styles.gap?.x ?? styles.taskSize}px)
          </Label>
          <Slider
            value={[styles.gap?.x ?? styles.taskSize ?? 100]}
            min={50}
            max={300}
            step={10}
            onValueChange={([value]) =>
              onChange("gap", { ...styles.gap, x: value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-medium text-[#111111]">
            Vertical Gap ({styles.gap?.y ?? styles.taskSize}px)
          </Label>
          <Slider
            value={[styles.gap?.y ?? styles.taskSize ?? 100]}
            min={50}
            max={300}
            step={10}
            onValueChange={([value]) =>
              onChange("gap", { ...styles.gap, y: value })
            }
          />
        </div>
      </div>
    );
  }
);
