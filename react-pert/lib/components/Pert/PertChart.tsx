import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePertContext } from "../../context/pertContext";
import { ChartSVG } from "./ChartSVG";
import Error from "../Error";
import { PertStyles } from "../../types/pert.types";
import { DEFAULT_ERROR_DIMENSIONS } from "../../constants/pert.constants";
import { usePertDimensions } from "../../hooks/usePertDimensions";
import { FONT_SIZES } from "../../constants/font.constants";
import { Task, TaskInput } from "../../types/global.types";
import { taskSelectionService } from "../../context/taskSelection";

export interface PertChartProps {
  tasks: TaskInput[];
  styles: PertStyles;
  taskSize?: number;
  onSelect?: (task: Task) => void;
}

export const PertChart: React.FC<PertChartProps> = ({ tasks, onSelect, styles }) => {
  const { pertData, calculatePertResults, error } = usePertContext();
  const tasksHashRef = useRef<string>();
  const [selectedTask, setSelectedTaskState] = useState<string | null>(null);
  const [hoveredTask, setHoveredTaskState] = useState<string | null>(null);

  useEffect(() => {
    const handler = (taskKey: string | null) => {
      if (!taskKey) {
        setSelectedTaskState(null);
        return;
      }

      const task = pertData.tasks.get(taskKey) ?? null;
      setSelectedTaskState(task ? taskKey : null);
      if (task) {
        onSelect?.(task);
      }
    };

    taskSelectionService.register(handler);
    return () => {
      taskSelectionService.register(null);
    };
  }, [onSelect, pertData.tasks]);

  useEffect(() => {
    const tasksHash = JSON.stringify(tasks);
    if (tasksHashRef.current !== tasksHash) {
      calculatePertResults(tasks);
      taskSelectionService.setSelectedTask(null);
      tasksHashRef.current = tasksHash;
    }
  }, [tasks, calculatePertResults]);

  const setHoveredTask = useCallback((taskKey: string | null) => {
    setHoveredTaskState(taskKey);
  }, []);

  const { gap: customGap, taskSize, fontSize } = styles;

  const customTaskSize = Math.max(taskSize ?? 100, 70);

  const gap = useMemo(
    () => ({
      x: Math.max(customTaskSize, customGap?.x ?? 0),
      y: Math.max(customTaskSize, customGap?.y ?? 0),
    }),
    [customGap?.x, customGap?.y, customTaskSize]
  );

  const size = usePertDimensions({ taskSize: customTaskSize, gap });

  const customFontSize = useMemo(() => {
    if (!fontSize) return FONT_SIZES.default;
    if (typeof fontSize === "number") return `${fontSize}px`;
    return FONT_SIZES[fontSize as keyof typeof FONT_SIZES] || fontSize;
  }, [fontSize]);

  if (error) {
    return <Error error={error} />;
  }

  return (
    <ChartSVG
      size={error ? DEFAULT_ERROR_DIMENSIONS : size}
      pertData={pertData}
      selectedTask={selectedTask}
      hoveredTask={hoveredTask}
      setHoveredTask={setHoveredTask}
      styles={{ ...styles, fontSize: customFontSize, taskSize: customTaskSize, gap }}
    />
  );
};

export default PertChart;
