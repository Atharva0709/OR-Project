/**
 * Operations Research: Task Node Appearance Settings
 *
 * Configures task size slider, typography font family, font size,
 * text color, and task background fill.
 */

import { memo } from "react";
import { FontSize, PertStyles } from "@@/lib/main";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Color } from "../Color";
import { StylingSectionEyebrow } from "./StylingSectionEyebrow";
import { UI_STRINGS } from "@/constants/strings";

const fontFamilies = [
  "Arial",
  "Roboto",
  "Helvetica",
  "Times New Roman",
  "sans-serif",
  "system-ui",
];

const fontSizes: FontSize[] = ["sm", "md", "lg", "xl", "2xl", "3xl"];

interface TaskNodeSettingsProps {
  styles: PertStyles;
  onChange: <K extends keyof PertStyles>(key: K, value: PertStyles[K]) => void;
}

export const TaskNodeSettings = memo(
  ({ styles, onChange }: TaskNodeSettingsProps) => {
    return (
      <div className="space-y-4 pb-4 border-b border-[#d8d8d8]">
        <StylingSectionEyebrow label={UI_STRINGS.sidebar.sections.taskNodeSettings} />
        <div className="space-y-2">
          <Label className="text-xs font-medium text-[#111111]">
            Task Size ({styles.taskSize}px)
          </Label>
          <Slider
            value={[styles.taskSize || 100]}
            min={70}
            max={200}
            step={1}
            onValueChange={([value]) => onChange("taskSize", value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="font-family" className="text-xs font-medium text-[#111111]">
            Font Family
          </Label>
          <Select
            value={styles.fontFamily}
            onValueChange={(value) => onChange("fontFamily", value)}
          >
            <SelectTrigger id="font-family">
              <SelectValue placeholder="Select font family" />
            </SelectTrigger>
            <SelectContent>
              {fontFamilies.map((font) => (
                <SelectItem key={font} value={font}>
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="font-size" className="text-xs font-medium text-[#111111]">
            Font Size
          </Label>
          <Select
            value={String(styles.fontSize)}
            onValueChange={(value) => onChange("fontSize", value as FontSize)}
          >
            <SelectTrigger id="font-size">
              <SelectValue placeholder="Select font size" />
            </SelectTrigger>
            <SelectContent>
              {fontSizes.map((size) => (
                <SelectItem key={String(size)} value={String(size)}>
                  {String(size)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-between items-center">
          <Label className="text-xs font-medium text-[#111111]">Text Color</Label>
          <Separator className="flex-1 mx-2" />
          <Color
            color={styles.textColor}
            colorName="textColor"
            handleChange={onChange}
          />
        </div>
        <div className="flex justify-between items-center">
          <Label className="text-xs font-medium text-[#111111]">Task Background</Label>
          <Separator className="flex-1 mx-2" />
          <Color
            color={styles.taskBackground}
            colorName="taskBackground"
            handleChange={onChange}
          />
        </div>
      </div>
    );
  }
);
