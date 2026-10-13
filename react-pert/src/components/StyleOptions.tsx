import { FontSize, PertStyles } from "@@/lib/main";
import { memo, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Color } from "./Color";
import { CopyDrawer } from "./CopyDrawer";
import { Separator } from "./ui/separator";

const fontFamilies = [
  "Arial",
  "Roboto",
  "Helvetica",
  "Times New Roman",
  "sans-serif",
  "system-ui",
];

const fontSizes: FontSize[] = ["sm", "md", "lg", "xl", "2xl", "3xl"];

type StyleOptionsProps = PertStyles & {
  onStyleChange: (key: keyof PertStyles, value: any) => void;
};

/** Section eyebrow used throughout the style panel */
function SectionEyebrow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div style={{ width: 4, height: 16, backgroundColor: "#fa9000", flexShrink: 0 }} />
      <span
        style={{
          fontFamily: "'Roboto', sans-serif",
          fontSize: 11,
          fontWeight: 300,
          color: "#595959",
          textTransform: "uppercase",
          letterSpacing: 1.2,
        }}
      >
        {label}
      </span>
    </div>
  );
}

export const StyleOptions = memo(({ onStyleChange, ...styles }: StyleOptionsProps) => {
  const handleChange = useCallback(
    (key: keyof PertStyles, value: any) => {
      onStyleChange(key, value);
    },
    [onStyleChange]
  );

  return (
    <ScrollArea className="h-[calc(100vh-3.5rem-44px)] px-4 pb-4">
      <div className="space-y-6 pt-4">
        {/* Header row */}
        <div className="flex justify-between items-center">
          <span
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: 13,
              fontWeight: 700,
              color: "#000000",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Chart Properties
          </span>
          <CopyDrawer styles={styles} />
        </div>

        {/* Chart Settings */}
        <div className="space-y-4 pb-4" style={{ borderBottom: "1px solid #d8d8d8" }}>
          <SectionEyebrow label="Chart Settings" />
          <div className="flex justify-between items-center">
            <Label style={{ color: "#333333", fontSize: 14, fontWeight: 400 }}>Chart Background</Label>
            <Separator className="flex-1 mx-2" />
            <Color
              color={styles.chartBackground}
              colorName="chartBackground"
              handleChange={handleChange}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="disable-grid" style={{ color: "#333333", fontSize: 14, fontWeight: 400 }}>Disable Grid</Label>
            <Switch
              id="disable-grid"
              checked={styles.disableGrid}
              onCheckedChange={(checked) => handleChange("disableGrid", checked)}
            />
          </div>
          <div className="flex justify-between items-center">
            <Label htmlFor="grid-color" style={{ color: "#333333", fontSize: 14, fontWeight: 400 }}>Grid Color</Label>
            <Separator className="flex-1 mx-2" />
            <Color
              color={styles.gridColor}
              colorName="gridColor"
              handleChange={handleChange}
            />
          </div>
        </div>

        {/* Task Node Settings */}
        <div className="space-y-4 pb-4" style={{ borderBottom: "1px solid #d8d8d8" }}>
          <SectionEyebrow label="Task Node Settings" />
          <div className="space-y-2">
            <Label style={{ color: "#333333", fontSize: 14, fontWeight: 400 }}>Task Size ({styles.taskSize}px)</Label>
            <Slider
              value={[styles.taskSize || 100]}
              min={70}
              max={200}
              step={1}
              onValueChange={([value]) => handleChange("taskSize", value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="font-family" style={{ color: "#333333", fontSize: 14, fontWeight: 400 }}>Font Family</Label>
            <Select
              value={styles.fontFamily}
              onValueChange={(value) => handleChange("fontFamily", value)}
            >
              <SelectTrigger>
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
            <Label htmlFor="font-size" style={{ color: "#333333", fontSize: 14, fontWeight: 400 }}>Font Size</Label>
            <Select
              value={String(styles.fontSize)}
              onValueChange={(value) => handleChange("fontSize", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select font size" />
              </SelectTrigger>
              <SelectContent>
                {fontSizes.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-between items-center">
            <Label htmlFor="text-color" style={{ color: "#333333", fontSize: 14, fontWeight: 400 }}>Text Color</Label>
            <Separator className="flex-1 mx-2" />
            <Color
              color={styles.textColor}
              colorName="textColor"
              handleChange={handleChange}
            />
          </div>
          <div className="flex justify-between items-center">
            <Label htmlFor="task-background" style={{ color: "#333333", fontSize: 14, fontWeight: 400 }}>Task Background</Label>
            <Separator className="flex-1 mx-2" />
            <Color
              color={styles.taskBackground}
              colorName="taskBackground"
              handleChange={handleChange}
            />
          </div>
        </div>

        {/* Border Settings */}
        <div className="space-y-4 pb-4" style={{ borderBottom: "1px solid #d8d8d8" }}>
          <SectionEyebrow label="Border Settings" />
          <div className="space-y-2">
            <Label style={{ color: "#333333", fontSize: 14, fontWeight: 400 }}>Border Width ({styles.borderWidth}px)</Label>
            <Slider
              value={[styles.borderWidth || 1]}
              min={1}
              max={5}
              step={1}
              onValueChange={([value]) => handleChange("borderWidth", value)}
            />
          </div>
          <div className="space-y-2">
            <Label style={{ color: "#333333", fontSize: 14, fontWeight: 400 }}>Selected Border Width ({styles.selectedBorderWidth}px)</Label>
            <Slider
              value={[styles.selectedBorderWidth || 3]}
              min={1}
              max={5}
              step={1}
              onValueChange={([value]) => handleChange("selectedBorderWidth", value)}
            />
          </div>
          <div className="space-y-2">
            <Label style={{ color: "#333333", fontSize: 14, fontWeight: 400 }}>Hover Border Width ({styles.hoverBorderWidth}px)</Label>
            <Slider
              value={[styles.hoverBorderWidth || 2]}
              min={1}
              max={5}
              step={1}
              onValueChange={([value]) => handleChange("hoverBorderWidth", value)}
            />
          </div>
          <div className="flex justify-between items-center">
            <Label htmlFor="border-color" style={{ color: "#333333", fontSize: 14, fontWeight: 400 }}>Border Color</Label>
            <Separator className="flex-1 mx-2" />
            <Color
              color={styles.borderColor}
              colorName="borderColor"
              handleChange={handleChange}
            />
          </div>
          <div className="flex justify-between items-center">
            <Label htmlFor="selected-border-color" style={{ color: "#333333", fontSize: 14, fontWeight: 400 }}>Selected Border Color</Label>
            <Separator className="flex-1 mx-2" />
            <Color
              color={styles.selectedBorderColor}
              colorName="selectedBorderColor"
              handleChange={handleChange}
            />
          </div>
        </div>

        {/* Arrow Settings */}
        <div className="space-y-4 pb-4" style={{ borderBottom: "1px solid #d8d8d8" }}>
          <SectionEyebrow label="Arrow Settings" />
          <div className="space-y-2">
            <Label style={{ color: "#333333", fontSize: 14, fontWeight: 400 }}>Arrow Width ({styles.arrowWidth}px)</Label>
            <Slider
              value={[styles.arrowWidth || 2]}
              min={1}
              max={5}
              step={1}
              onValueChange={([value]) => handleChange("arrowWidth", value)}
            />
          </div>
          <div className="flex justify-between items-center">
            <Label htmlFor="arrow-color" style={{ color: "#333333", fontSize: 14, fontWeight: 400 }}>Arrow Color</Label>
            <Separator className="flex-1 mx-2" />
            <Color
              color={styles.arrowColor}
              colorName="arrowColor"
              handleChange={handleChange}
            />
          </div>
          <div className="flex justify-between items-center">
            <Label htmlFor="critical-color" style={{ color: "#333333", fontSize: 14, fontWeight: 400 }}>Critical Path Color</Label>
            <Separator className="flex-1 mx-2" />
            <Color
              color={styles.criticalColor}
              colorName="criticalColor"
              handleChange={handleChange}
            />
          </div>
        </div>

        {/* Gap Settings */}
        <div className="space-y-4">
          <SectionEyebrow label="Gap Settings" />
          <div className="space-y-2">
            <Label style={{ color: "#333333", fontSize: 14, fontWeight: 400 }}>Horizontal Gap ({styles.gap?.x ?? styles.taskSize}px)</Label>
            <Slider
              value={[styles.gap?.x ?? styles.taskSize ?? 100]}
              min={50}
              max={300}
              step={10}
              onValueChange={([value]) =>
                handleChange("gap", { ...styles.gap, x: value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label style={{ color: "#333333", fontSize: 14, fontWeight: 400 }}>Vertical Gap ({styles.gap?.y ?? styles.taskSize}px)</Label>
            <Slider
              value={[styles.gap?.y ?? styles.taskSize ?? 100]}
              min={50}
              max={300}
              step={10}
              onValueChange={([value]) =>
                handleChange("gap", { ...styles.gap, y: value })
              }
            />
          </div>
        </div>
      </div>
    </ScrollArea>
  );
});
