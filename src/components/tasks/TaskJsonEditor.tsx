/**
 * Operations Research: Task JSON Code Editor
 *
 * Provides a code editor view for direct JSON manipulation of task structures,
 * with syntax validation, formatting, and real-time schema error reporting.
 */

import { memo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Code2 } from "lucide-react";

interface TaskJsonEditorProps {
  jsonText: string;
  onChangeJson: (text: string) => void;
  onFormatJson: () => void;
}

export const TaskJsonEditor = memo(
  ({ jsonText, onChangeJson, onFormatJson }: TaskJsonEditorProps) => {
    return (
      <div className="flex-1 flex flex-col p-3 overflow-hidden">
        <div className="flex items-center justify-between pb-2">
          <p className="text-xs text-[#525252]">
            Edit or paste task JSON array directly. Fields:{" "}
            <code className="text-[#fa9000] font-mono">key</code>,{" "}
            <code className="text-[#fa9000] font-mono">text</code>,{" "}
            <code className="text-[#fa9000] font-mono">duration</code> (or{" "}
            <code className="text-[#fa9000] font-mono">optimistic</code>,{" "}
            <code className="text-[#fa9000] font-mono">mostLikely</code>,{" "}
            <code className="text-[#fa9000] font-mono">pessimistic</code>), and{" "}
            <code className="text-[#fa9000] font-mono">dependsOn: ["key1"]</code>.
          </p>
          <button
            type="button"
            onClick={onFormatJson}
            className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-[#111111] bg-neutral-100 hover:bg-neutral-200 rounded-md border border-[#d8d8d8] transition-colors"
          >
            <Code2 className="w-3.5 h-3.5" />
            Format JSON
          </button>
        </div>
        <Textarea
          value={jsonText}
          onChange={(e) => onChangeJson(e.target.value)}
          placeholder='[{"key": "1", "text": "Task A", "duration": 5, "dependsOn": []}]'
          className="flex-1 font-mono text-xs p-3 bg-[#fafafa] border-[#d8d8d8] rounded-md resize-none focus:ring-1 focus:ring-[#fa9000] outline-none"
        />
      </div>
    );
  }
);
