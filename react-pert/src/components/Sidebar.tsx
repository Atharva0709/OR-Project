import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PertStyles, Task } from "@@/lib/main";
import { memo, useState } from "react";
import { StyleOptions } from "./StyleOptions";
import { PertDetails } from "./PertDetails";

type SidebarProps = PertStyles & {
  onStyleChange: (key: keyof PertStyles, value: any) => void;
  selectedTask: Task | null;
};

export const Sidebar = memo(
  ({ onStyleChange, selectedTask, ...styles }: SidebarProps) => {
    const [tab, setActiveTab] = useState("details");

    return (
      <div
        className="h-[calc(100vh-56px)] w-80 bg-[#ffffff] flex flex-col"
        style={{ borderRight: "1px solid #d8d8d8" }}
      >
        <Tabs
          defaultValue="details"
          className="h-full flex flex-col"
          onValueChange={setActiveTab}
          value={tab}
        >
          {/* Flat tab headers — orange underline for active */}
          <TabsList
            className="w-full grid grid-cols-2 bg-transparent rounded-none"
            style={{ borderBottom: "1px solid #d8d8d8", height: 44, padding: 0 }}
          >
            <TabsTrigger
              value="styles"
              className="rounded-none h-full text-sm font-medium data-[state=active]:shadow-none"
              style={{
                color: tab === "styles" ? "#000000" : "#595959",
                fontFamily: "'Roboto', sans-serif",
                fontWeight: tab === "styles" ? 700 : 400,
                borderBottom: tab === "styles" ? "3px solid #fa9000" : "3px solid transparent",
                backgroundColor: "transparent",
              }}
            >
              Styles
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="rounded-none h-full text-sm font-medium data-[state=active]:shadow-none"
              style={{
                color: tab === "details" ? "#000000" : "#595959",
                fontFamily: "'Roboto', sans-serif",
                fontWeight: tab === "details" ? 700 : 400,
                borderBottom: tab === "details" ? "3px solid #fa9000" : "3px solid transparent",
                backgroundColor: "transparent",
              }}
            >
              Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="styles" forceMount={true} hidden={"styles" !== tab} className="flex-1 mt-0">
            <StyleOptions {...styles} onStyleChange={onStyleChange} />
          </TabsContent>
          <TabsContent forceMount={true} value="details" hidden={"details" !== tab} className="flex-1 mt-0">
            <PertDetails selectedTask={selectedTask} />
          </TabsContent>
        </Tabs>
      </div>
    );
  }
);
