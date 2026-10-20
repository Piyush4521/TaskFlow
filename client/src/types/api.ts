import { User } from './auth';
import { Task } from './task';

export interface ApiErrorDetail {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  message?: string;
  errors?: ApiErrorDetail[];
}

export interface RegisterResponse {
  success: true;
  message: string;
  user: User;
}

export interface LoginResponse {
  success: true;
  message: string;
  token: string;
  user: User;
}

export interface TasksResponse {
  success: true;
  count: number;
  tasks: Task[];
}

export interface SingleTaskResponse {
  success: true;
  message: string;
  task: Task;
}

export interface DeleteTaskResponse {
  success: true;
  message: string;
}

export interface TeamMember {
  _id: string;
  name: string;
  role: string;
  email: string;
  department: string;
  isFixture: boolean;
  source: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamMembersResponse {
  success: true;
  count: number;
  data: TeamMember[];
}
