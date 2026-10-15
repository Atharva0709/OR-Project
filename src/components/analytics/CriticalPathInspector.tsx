/**
 * Operations Research: Critical Path Inspector Component
 *
 * Visualizes critical path sequences, allows interactive task selection,
 * and highlights variance risks across multiple critical paths.
 */

import { memo } from "react";
import { setSelectedTask, CriticalPath } from "@@/lib/main";
import { SectionEyebrow } from "./SectionEyebrow";
import { UI_STRINGS } from "@/constants/strings";
import { AlertCircle } from "lucide-react";

interface CriticalPathInspectorProps {
  criticalPaths: CriticalPath[];
  highestVariancePathNote?: string;
}

export const CriticalPathInspector = memo(
  ({ criticalPaths, highestVariancePathNote }: CriticalPathInspectorProps) => {
    return (
      <div>
        <SectionEyebrow label={UI_STRINGS.sidebar.labels.criticalPaths} />
        {criticalPaths.length === 0 ? (
          <p className="text-xs text-[#525252]">No critical path identified.</p>
        ) : (
          <ul className="text-xs text-[#111111] space-y-2 mt-1">
            {criticalPaths.map((cp, index) => (
              <li key={index} className="p-2 rounded bg-neutral-50 border border-[#d8d8d8]/60">
                <span className="font-semibold text-[#fa9000] mr-1.5">
                  Path #{index + 1}:
                </span>
                {cp.map((p, i) => (
                  <span key={i}>
                    <button
                      type="button"
                      onClick={() => setSelectedTask(p.key)}
                      className="font-medium hover:underline focus:outline-none focus:ring-1 focus:ring-[#fa9000]"
                    >
                      {p.text}
                    </button>
                    {i < cp.length - 1 && <span className="text-[#9e9e9e] mx-1">→</span>}
                  </span>
                ))}
              </li>
            ))}
          </ul>
        )}

        {highestVariancePathNote && (
          <div className="mt-2.5 p-2 rounded bg-amber-50/80 border border-amber-200 flex items-start gap-1.5 text-[11px] text-amber-900 leading-snug">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span>{highestVariancePathNote}</span>
          </div>
        )}
      </div>
    );
  }
);
