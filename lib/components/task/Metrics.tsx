import { Task } from "../../types/global.types";
import { TaskDimensions } from "../../types/task.types";

interface TaskMetricsProps {
  task: Task;
  x: number;
  y: number;
  dimensions: TaskDimensions;
}

const formatVal = (v: number): string => {
  if (v === undefined || isNaN(v)) return "0";
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
};

const Metrics: React.FC<TaskMetricsProps> = ({ task, x, y, dimensions }) => {
  const { halfRadius, twoThirdsRadius } = dimensions;
  return (
    <>
      <text x={x - halfRadius} y={y - twoThirdsRadius} fill="black">
        {formatVal(task.earlyStart)}
      </text>
      <text x={x + halfRadius} y={y - twoThirdsRadius} fill="black">
        {formatVal(task.earlyFinish)}
      </text>
      <text x={x - halfRadius} y={y + twoThirdsRadius} fill="black">
        {formatVal(task.lateStart)}
      </text>
      <text x={x + halfRadius} y={y + twoThirdsRadius} fill="black">
        {formatVal(task.lateFinish)}
      </text>
    </>
  );
};

export default Metrics;
