export type TaskStatus = 'To-Do' | 'In-Progress' | 'Done';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
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
