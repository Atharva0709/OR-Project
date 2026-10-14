import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PertStyles, Task } from "@@/lib/main";
import { memo, useState } from "react";
import { StyleOptions } from "./StyleOptions";
import { PertDetails } from "./PertDetails";
import { THEME } from "@/constants/theme";
import { UI_STRINGS } from "@/constants/strings";

interface SidebarProps extends PertStyles {
  onStyleChange: <K extends keyof PertStyles>(key: K, value: PertStyles[K]) => void;
  selectedTask: Task | null;
  deadline: number | null;
  setDeadline: (val: number | null) => void;
  targetProbability: number | null;
  setTargetProbability: (val: number | null) => void;
}

export const Sidebar = memo(
  ({
    onStyleChange,
    selectedTask,
    deadline,
    setDeadline,
    targetProbability,
    setTargetProbability,
    ...styles
  }: SidebarProps) => {
    const [tab, setActiveTab] = useState<"details" | "styles">("details");

    return (
      <div
        className="h-[calc(100dvh-56px)] w-full md:w-80 bg-white flex flex-col shadow-sm md:shadow-none"
        style={{ borderRight: `1px solid ${THEME.colors.border}` }}
      >
        <Tabs
          defaultValue="details"
          className="h-full flex flex-col"
          onValueChange={(val) => setActiveTab(val as "details" | "styles")}
          value={tab}
        >
          {/* Flat tab headers with orange underline */}
          <TabsList
            className="w-full grid grid-cols-2 bg-transparent rounded-none"
            style={{ borderBottom: `1px solid ${THEME.colors.border}`, height: 44, padding: 0 }}
          >
            <TabsTrigger
              value="details"
              className="rounded-none h-full text-xs font-semibold data-[state=active]:shadow-none transition-colors"
              style={{
                color: tab === "details" ? THEME.colors.ink : THEME.colors.inkMuted,
                fontFamily: THEME.typography.fontFamily,
                borderBottom:
                  tab === "details"
                    ? `3px solid ${THEME.colors.primary}`
                    : "3px solid transparent",
                backgroundColor: "transparent",
              }}
            >
              {UI_STRINGS.sidebar.tabs.details}
            </TabsTrigger>

            <TabsTrigger
              value="styles"
              className="rounded-none h-full text-xs font-semibold data-[state=active]:shadow-none transition-colors"
              style={{
                color: tab === "styles" ? THEME.colors.ink : THEME.colors.inkMuted,
                fontFamily: THEME.typography.fontFamily,
                borderBottom:
                  tab === "styles"
                    ? `3px solid ${THEME.colors.primary}`
                    : "3px solid transparent",
                backgroundColor: "transparent",
              }}
            >
              {UI_STRINGS.sidebar.tabs.styles}
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="details"
            forceMount={true}
            hidden={"details" !== tab}
            className="flex-1 mt-0"
          >
            <PertDetails
              selectedTask={selectedTask}
              deadline={deadline}
              setDeadline={setDeadline}
              targetProbability={targetProbability}
              setTargetProbability={setTargetProbability}
            />
          </TabsContent>

          <TabsContent
            value="styles"
            forceMount={true}
            hidden={"styles" !== tab}
            className="flex-1 mt-0"
          >
            <StyleOptions {...styles} onStyleChange={onStyleChange} />
          </TabsContent>
        </Tabs>
      </div>
    );
  }
);
