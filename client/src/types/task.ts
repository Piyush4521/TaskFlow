export type TaskStatus = 'To-Do' | 'In-Progress' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
}

export interface ColumnDefinition {
  id: TaskStatus;
  title: string;
  description: string;
  accentColor: string;
  emptyTitle: string;
  emptyMessage: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
}

export interface TaskContextType {
  tasks: Task[];
  isLoading: boolean;
  errorMessage: string | null;
  savingTaskIds: Set<string>;
  reloadTasks: () => void;
  createTask: (data: CreateTaskInput) => Promise<Task>;
  updateTask: (id: string, data: UpdateTaskInput) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  changeTaskStatus: (id: string, newStatus: TaskStatus) => Promise<void>;
  clearError: () => void;
}
