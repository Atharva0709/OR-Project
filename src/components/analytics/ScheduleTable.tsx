/**
 * Operations Research: Full Schedule Matrix Table
 *
 * Displays all tasks in the project with their computed CPM/PERT schedule values:
 * ES, EF, LS, LF, Total Float (Slack), Free Float, and Criticality.
 */

import { memo } from "react";
import { usePert, setSelectedTask } from "@@/lib/main";
import { SectionEyebrow } from "./SectionEyebrow";

export const ScheduleTable = memo(() => {
  const { tasks } = usePert();
  const taskList = Array.from(tasks.values()).filter(
    (t) => t.index !== -1 && t.text !== "Start" && t.text !== "Finish"
  );

  if (taskList.length === 0) return null;

  return (
    <div className="mt-4">
      <SectionEyebrow label="Schedule Matrix" />
      <div className="overflow-x-auto border border-[#d8d8d8] rounded bg-white mt-1 shadow-sm">
        <table className="w-full text-left text-[11px] border-collapse">
          <thead>
            <tr className="bg-[#f5f5f5] text-[#404040] font-semibold border-b border-[#d8d8d8]">
              <th className="py-1 px-2">Task</th>
              <th className="py-1 px-1.5 text-center">ES</th>
              <th className="py-1 px-1.5 text-center">EF</th>
              <th className="py-1 px-1.5 text-center">LS</th>
              <th className="py-1 px-1.5 text-center">LF</th>
              <th className="py-1 px-1.5 text-center">Float</th>
              <th className="py-1 px-1.5 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eeeeee]">
            {taskList.map((t) => (
              <tr
                key={t.key}
                onClick={() => setSelectedTask(t.key)}
                className="hover:bg-amber-50/50 cursor-pointer transition-colors"
              >
                <td className="py-1 px-2 font-medium text-[#111111]">
                  <span className="font-mono text-[#fa9000] mr-1">{t.key}:</span>
                  <span className="truncate max-w-[70px] inline-block align-bottom">{t.text}</span>
                </td>
                <td className="py-1 px-1.5 text-center font-mono">{t.earlyStart}</td>
                <td className="py-1 px-1.5 text-center font-mono">{t.earlyFinish}</td>
                <td className="py-1 px-1.5 text-center font-mono">{t.lateStart}</td>
                <td className="py-1 px-1.5 text-center font-mono">{t.lateFinish}</td>
                <td className="py-1 px-1.5 text-center font-mono font-semibold">
                  {t.totalFloat}
                </td>
                <td className="py-1 px-1.5 text-center">
                  <span
                    className={`inline-block px-1 py-0.2 rounded text-[9px] font-bold ${
                      t.critical
                        ? "bg-red-50 text-[#c31833] border border-red-200"
                        : "bg-neutral-100 text-[#525252]"
                    }`}
                  >
                    {t.critical ? "CRIT" : "FLOAT"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
