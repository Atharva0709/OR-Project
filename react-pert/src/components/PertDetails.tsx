import { memo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePert, setSelectedTask, Task } from "@@/lib/main";
import { Separator } from "@/components/ui/separator";

/** Small orange-bar + uppercase section label */
function SectionEyebrow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
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

export const PertDetails = memo(({ selectedTask }: { selectedTask: Task | null }) => {
  const { projectDuration, criticalPaths } = usePert();

  return (
    <ScrollArea className="h-[calc(100vh-3.5rem-44px)] px-4 pb-4">
      {/* Project Duration */}
      <div className="pt-4">
        <SectionEyebrow label="Project Duration" />
        <p style={{ color: "#000000", fontSize: 16, fontWeight: 400 }}>{projectDuration} days</p>
      </div>

      <Separator className="my-3" style={{ backgroundColor: "#d8d8d8" }} />

      {/* Critical Paths */}
      <div>
        <SectionEyebrow label="Critical Paths" />
        <ul style={{ fontSize: 14, color: "#333333", lineHeight: 1.6 }}>
          {criticalPaths.map((cp, index) => (
            <li key={index}>
              {cp.map((p, i) => (
                <span key={i}>
                  {p.text}
                  {i < cp.length - 1 && " → "}
                </span>
              ))}
            </li>
          ))}
        </ul>
      </div>

      <Separator className="my-3" style={{ backgroundColor: "#d8d8d8" }} />

      {/* Select Task by Key */}
      <div>
        <SectionEyebrow label="Select Task by Key" />
        <input
          type="text"
          placeholder="Enter task key"
          onChange={(e) => setSelectedTask(e.target.value ?? null)}
          style={{
            width: "100%",
            backgroundColor: "#ffffff",
            border: "1px solid #595959",
            borderRadius: 22,
            padding: "6px 15px",
            fontSize: 14,
            fontFamily: "'Roboto', sans-serif",
            color: "#000000",
            outline: "none",
          }}
        />
      </div>

      <Separator className="my-3" style={{ backgroundColor: "#d8d8d8" }} />

      {/* Selected Task */}
      <div>
        <SectionEyebrow label="Selected Task" />
        {!selectedTask && (
          <p style={{ color: "#595959", fontSize: 14 }}>Click on a task to view its details</p>
        )}
        {selectedTask && (
          <div style={{ fontSize: 14, color: "#333333", lineHeight: 1.7 }}>
            <p style={{ fontWeight: 700, fontSize: 16, color: "#000000", marginBottom: 4 }}>{selectedTask.text}</p>
            <p>Key: {selectedTask.key}</p>
            <p>Duration: {selectedTask.duration} day(s)</p>
            <p>Depends on: {selectedTask.dependsOn?.join(", ")}</p>
            <p>Early Start: {selectedTask.earlyStart}</p>
            <p>Early Finish: {selectedTask.earlyFinish}</p>
            <p>Late Start: {selectedTask.lateStart}</p>
            <p>Late Finish: {selectedTask.lateFinish}</p>
            <p>Level: {selectedTask.level}</p>
            <p>
              Critical:{" "}
              <span style={{ color: selectedTask.critical ? "#c31833" : "#000000", fontWeight: selectedTask.critical ? 700 : 400 }}>
                {selectedTask.critical ? "Yes" : "No"}
              </span>
            </p>
            <p>Free Float: {selectedTask.freeFloat}</p>
            <p>Total Float: {selectedTask.totalFloat}</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
});
