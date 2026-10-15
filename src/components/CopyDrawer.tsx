import { memo } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import { PertStyles } from "@@/lib/main";
import { Check, Copy } from "lucide-react";
import { THEME } from "@/constants/theme";

interface CopyDrawerProps {
  styles: PertStyles;
}

export const CopyDrawer = memo(({ styles }: CopyDrawerProps) => {
  const jsonInput = JSON.stringify(styles, null, 2);

  const handleCopyStyles = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    try {
      const input = document.createElement("textarea");
      input.value = JSON.stringify(styles, null, 2);
      document.body.appendChild(input);
      input.select();
      input.setSelectionRange(0, 99999);

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(input.value);
        button.classList.add("success");
        setTimeout(() => {
          button.classList.remove("success");
        }, 2000);
      }

      document.body.removeChild(input);
    } catch (error: unknown) {
      console.error("Copy failed", error);
    }
  };

  return (
    <div className="justify-self-end">
      <Drawer>
        <DrawerTrigger asChild>
          <button
            type="button"
            aria-label="Open Copy Styles Dialog"
            style={{
              backgroundColor: THEME.colors.ink,
              color: THEME.colors.canvas,
              borderRadius: THEME.dimensions.borderRadiusPill,
              padding: "4px 12px",
              fontSize: 12,
              fontFamily: THEME.typography.fontFamily,
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
              lineHeight: 1,
            }}
            className="hover:opacity-85 shadow-sm active:scale-95 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#fa9000]"
          >
            Copy Styles
          </button>
        </DrawerTrigger>

        <DrawerContent className="w-full">
          <div className="mx-auto w-full max-w-2xl">
            <DrawerHeader style={{ backgroundColor: THEME.colors.navy, padding: "16px 24px" }}>
              <DrawerTitle
                style={{
                  color: THEME.colors.canvas,
                  fontFamily: THEME.typography.fontFamily,
                  fontWeight: 700,
                  fontSize: 18,
                }}
              >
                Copy Styles JSON
              </DrawerTitle>
              <DrawerDescription style={{ color: "#d0d0d0", fontSize: 13 }}>
                Copy current chart styling parameters in JSON format.
              </DrawerDescription>
            </DrawerHeader>

            <div className="p-4 pt-0 relative bg-white">
              <button
                type="button"
                onClick={handleCopyStyles}
                aria-label="Copy JSON to clipboard"
                className="group absolute top-4 right-8 p-1.5 text-[#404040] hover:text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#fa9000] rounded"
              >
                <Copy style={{ width: 16, height: 16 }} className="transition-opacity group-[.success]:hidden" />
                <Check style={{ width: 16, height: 16, color: THEME.colors.successGreen }} className="hidden transition-opacity group-[.success]:block" />
              </button>
              <Textarea
                defaultValue={jsonInput}
                id="jsonStylesInput"
                aria-label="Styles JSON Content"
                style={{
                  minHeight: 300,
                  resize: "none",
                  fontFamily: "monospace",
                  fontSize: 13,
                  border: `1px solid ${THEME.colors.border}`,
                  borderRadius: THEME.dimensions.borderRadiusSm,
                  backgroundColor: THEME.colors.canvas,
                  color: THEME.colors.ink,
                }}
                className="overflow-y-auto"
              />
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
});
