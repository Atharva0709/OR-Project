export type TaskSelectionListener = (taskKey: string | null) => void;

class TaskSelectionService {
  private listener: TaskSelectionListener | null = null;

  register(listener: TaskSelectionListener | null): void {
    this.listener = listener;
  }

  setSelectedTask(taskKey: string | null): void {
    if (this.listener) {
      this.listener(taskKey);
    }
  }
}

export const taskSelectionService = new TaskSelectionService();

export const setSelectedTask = (taskKey: string | null): void => {
  taskSelectionService.setSelectedTask(taskKey);
};
