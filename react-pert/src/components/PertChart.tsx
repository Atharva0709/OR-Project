import { Pert, PertStyles, Task, TaskInput } from "@@/lib/main";
import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface PertChartProps {
  styles: PertStyles;
  tasks: TaskInput[];
  handleSelect: (task: Task) => void;
}

export function PertChart({ styles, tasks, handleSelect }: PertChartProps) {
  const raduis = 200;
  return (
    <div className="overflow-hidden grid place-items-center realtive">
      <div className="absolute top-0 right-0 m-4">
        <Popover>
          <PopoverTrigger asChild>
            <Info
              size={24}
              style={{ color: "#595959" }}
              className="cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
            />
          </PopoverTrigger>
          <PopoverContent
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #d8d8d8",
              borderRadius: 2,
              boxShadow: "none",
              width: 350,
            }}
            side="left"
            align="start"
          >
            <div className="p-0 flex flex-col items-center">
              <h2 style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 12, color: "#000000" }}>
                Task Node
              </h2>
              <svg
                width={raduis}
                height={raduis}
                viewBox={`0 0 ${raduis} ${raduis}`}
                xmlns="http://www.w3.org/2000/svg"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                <g>
                  <rect
                    rx="10"
                    ry="10"
                    width={raduis}
                    height={raduis}
                    strokeWidth={5}
                    style={{ fill: "transparent", stroke: "#d8d8d8" }}
                  />
                  <text x={raduis / 2} y={raduis / 2} style={{ fill: "#000000", fontSize: 13 }}>
                    Task Name
                  </text>

                  <text x={raduis / 4} y={raduis / 6} style={{ fill: "#000000", fontSize: 11 }}>
                    Earliest Start
                  </text>
                  <text x={(3 / 4) * raduis} y={raduis / 6} style={{ fill: "#000000", fontSize: 11 }}>
                    Latest Start
                  </text>
                  <text x={raduis / 4} y={(raduis * 5) / 6} style={{ fill: "#000000", fontSize: 11 }}>
                    Earliest Finish
                  </text>
                  <text x={(3 / 4) * raduis} y={(raduis * 5) / 6} style={{ fill: "#000000", fontSize: 11 }}>
                    Latest Finish
                  </text>

                  <path
                    d={`
                      M ${0} ${raduis / 3}
                      L ${raduis} ${raduis / 3}
                      M ${0} ${(raduis * 2) / 3}
                      L ${raduis} ${(raduis * 2) / 3}
                      M ${raduis / 2} ${(raduis * 2) / 3}
                      L ${raduis / 2} ${raduis}
                      M ${raduis / 2} ${0}
                      L ${raduis / 2} ${raduis / 3}
                    `}
                    style={{ stroke: "#d8d8d8", strokeWidth: 2, fill: "none" }}
                  />
                </g>
              </svg>

              {/* Legend */}
              <ul style={{ marginTop: 16, fontSize: 13, textAlign: "justify", display: "flex", flexDirection: "column", gap: 8, color: "#333333" }}>
                <li>
                  <strong style={{ color: "#000000" }}>Earliest Start:</strong> The earliest time a task can start
                </li>
                <li>
                  <strong style={{ color: "#000000" }}>Latest Start:</strong> The latest time a task can start without delaying the project
                </li>
                <li>
                  <strong style={{ color: "#000000" }}>Earliest Finish:</strong> The earliest time a task can finish
                </li>
                <li>
                  <strong style={{ color: "#000000" }}>Latest Finish:</strong> The latest time a task can finish without delaying the project
                </li>
              </ul>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <Pert tasks={tasks} styles={styles} onSelect={handleSelect} />
    </div>
  );
}
