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
    } catch (error) {
      console.error("Copy failed", error);
    }
  };

  return (
    <div className="justify-self-end">
      <Drawer>
        <DrawerTrigger asChild>
          {/* Black pill button */}
          <button
            style={{
              backgroundColor: "#000000",
              color: "#ffffff",
              borderRadius: 18,
              padding: "4px 12px",
              fontSize: 13,
              fontFamily: "'Roboto', sans-serif",
              fontWeight: 400,
              border: "none",
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            Copy Styles
          </button>
        </DrawerTrigger>

        <DrawerContent className="w-full">
          <div className="mx-auto w-full max-w-2xl">
            {/* Night-navy header strip */}
            <DrawerHeader style={{ backgroundColor: "#100e2f", padding: "16px 24px" }}>
              <DrawerTitle style={{ color: "#ffffff", fontFamily: "'Roboto', sans-serif", fontWeight: 700, fontSize: 18 }}>
                Copy Styles
              </DrawerTitle>
              <DrawerDescription style={{ color: "#dddddd", fontSize: 14 }} />
            </DrawerHeader>

            {/* White content area */}
            <div className="p-4 pt-0 relative bg-white">
              <button
                onClick={handleCopyStyles}
                className="group absolute top-4 right-8"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#595959",
                  padding: 4,
                }}
              >
                <Copy style={{ width: 16, height: 16 }} className="transition-opacity group-[.success]:hidden" />
                <Check style={{ width: 16, height: 16, color: "#009e60" }} className="hidden transition-opacity group-[.success]:block" />
              </button>
              <Textarea
                defaultValue={jsonInput}
                id="jsonInput"
                style={{
                  minHeight: 300,
                  resize: "none",
                  fontFamily: "monospace",
                  fontSize: 13,
                  border: "1px solid #d8d8d8",
                  borderRadius: 2,
                  backgroundColor: "#ffffff",
                  color: "#000000",
                }}
                className="overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border"
              />
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
});
