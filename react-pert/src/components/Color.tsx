import { HexAlphaColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { PertStyles } from "@@/lib/main";
import { memo } from "react";
import { Input } from "./ui/input";

interface ColorProps {
  color?: string;
  colorName: keyof PertStyles;
  handleChange: (key: keyof PertStyles, value: string) => void;
}

export const Color = memo(function Color({ color = "#ffffff", colorName, handleChange }: ColorProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Select color for ${String(colorName)}`}
          className="w-12 h-6 border rounded-md block transition-all shadow-sm hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#fa9000]"
          style={{ background: color, borderColor: "#d8d8d8" }}
        />
      </PopoverTrigger>
      <PopoverContent className="w-fit p-3 bg-white border border-[#d8d8d8] shadow-lg rounded-md">
        <HexAlphaColorPicker
          color={color}
          onChange={(newColor) => handleChange(colorName, newColor)}
        />
        <Input
          value={color.toUpperCase()}
          aria-label={`Hex code for ${String(colorName)}`}
          onChange={(e) => handleChange(colorName, e.target.value)}
          className="mt-2 text-xs font-mono border rounded p-1 h-7"
        />
      </PopoverContent>
    </Popover>
  );
});
