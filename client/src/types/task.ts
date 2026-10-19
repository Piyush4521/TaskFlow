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
