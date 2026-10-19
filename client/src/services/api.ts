import {
  ApiErrorResponse,
  RegisterResponse,
  LoginResponse,
  TasksResponse,
  SingleTaskResponse,
  DeleteTaskResponse,
} from '../types/api';
import { TaskStatus } from '../types/task';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');

export class ApiClientError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;
  isNetworkError: boolean;
  isAuthError: boolean;
  isRateLimited: boolean;

  constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.isNetworkError = status === 0;
    this.isAuthError = status === 401;
    this.isRateLimited = status === 429;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    // Check if JSON response
    const contentType = res.headers.get('content-type') || '';
    let data: unknown = null;
    if (contentType.includes('application/json')) {
      data = await res.json().catch(() => null);
    }

    if (!res.ok) {
      const errorBody = data as ApiErrorResponse | null;
      let message = errorBody?.message;

      // Extract field-level errors if provided
      let fieldErrors: Record<string, string> | undefined;
      if (errorBody?.errors && Array.isArray(errorBody.errors)) {
        fieldErrors = {};
        for (const err of errorBody.errors) {
          if (err.field && err.message) {
            fieldErrors[err.field] = err.message;
          }
        }
        if (!message) {
          message = errorBody.errors.map((e) => e.message).join(', ');
        }
      }

      if (!message) {
        if (res.status === 401) message = 'Invalid email or password';
        else if (res.status === 404) message = 'Requested resource not found';
        else if (res.status === 409) message = 'Email is already registered';
        else if (res.status === 429) message = 'Too many requests, please try again later';
        else if (res.status >= 500) message = 'An unexpected server error occurred. Please try again.';
        else message = `Request failed with status ${res.status}`;
      }

      throw new ApiClientError(res.status, message, fieldErrors);
    }

    return data as T;
  } catch (err) {
    if (err instanceof ApiClientError) {
      throw err;
    }

    // Network error or fetch failure
    throw new ApiClientError(
      0,
      'Unable to connect to the server. Please check your internet connection and verify the backend is running.'
    );
  }
}

export const api = {
  auth: {
    register: (payload: { name: string; email: string; password: string }) =>
      request<RegisterResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    login: (payload: { email: string; password: string }) =>
      request<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },

  tasks: {
    list: (token: string) =>
      request<TasksResponse>('/api/tasks', { method: 'GET' }, token),

    create: (
      token: string,
      payload: { title: string; description?: string; status?: TaskStatus }
    ) =>
      request<SingleTaskResponse>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(payload),
      }, token),

    getById: (token: string, id: string) =>
      request<SingleTaskResponse>(`/api/tasks/${id}`, { method: 'GET' }, token),

    update: (
      token: string,
      id: string,
      payload: { title?: string; description?: string; status?: TaskStatus }
    ) =>
      request<SingleTaskResponse>(`/api/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }, token),

    delete: (token: string, id: string) =>
      request<DeleteTaskResponse>(`/api/tasks/${id}`, { method: 'DELETE' }, token),
  },
};
