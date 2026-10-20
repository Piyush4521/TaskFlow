import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Task, TaskStatus, CreateTaskInput, UpdateTaskInput } from '../types/task';
import { TaskContext } from './taskContextDef';
import { useAuth } from './useAuth';
import { api, ApiClientError } from '../services/api';

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user, logout } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadCounter, setReloadCounter] = useState(0);
  const [savingTaskIds, setSavingTaskIds] = useState<Set<string>>(new Set());

  const currentUserId = user?.id || null;
  const [prevUserId, setPrevUserId] = useState<string | null>(currentUserId);

  // Clear tasks when user logs out or account changes
  if (currentUserId !== prevUserId) {
    setPrevUserId(currentUserId);
    setTasks([]);
    setIsLoading(Boolean(token && currentUserId));
    setErrorMessage(null);
    setSavingTaskIds(new Set());
  }

  // Load tasks when user/token is authenticated
  useEffect(() => {
    let isCurrent = true;

    if (!token || !currentUserId) {
      return;
    }

    api.tasks
      .list(token)
      .then((res) => {
        if (isCurrent) {
          setTasks(res.tasks || []);
        }
      })
      .catch((err) => {
        if (!isCurrent) return;
        if (err instanceof ApiClientError) {
          if (err.isAuthError) {
            logout(true);
            return;
          }
          setErrorMessage(err.message);
        } else {
          setErrorMessage('Failed to load tasks. Please try again.');
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [token, currentUserId, logout, reloadCounter]);

  const reloadTasks = useCallback(() => {
    setIsLoading(true);
    setErrorMessage(null);
    setReloadCounter((c) => c + 1);
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const createTask = useCallback(
    async (taskData: CreateTaskInput): Promise<Task> => {
      if (!token) {
        throw new Error('Authentication required to create tasks.');
      }
      try {
        const res = await api.tasks.create(token, taskData);
        setTasks((prev) => [res.task, ...prev]);
        return res.task;
      } catch (err) {
        if (err instanceof ApiClientError && err.isAuthError) {
          logout(true);
        }
        throw err;
      }
    },
    [token, logout]
  );

  const updateTask = useCallback(
    async (id: string, taskData: UpdateTaskInput): Promise<Task> => {
      if (!token) {
        throw new Error('Authentication required to update tasks.');
      }
      try {
        const res = await api.tasks.update(token, id, taskData);
        setTasks((prev) => prev.map((t) => (t._id === res.task._id ? res.task : t)));
        return res.task;
      } catch (err) {
        if (err instanceof ApiClientError && err.isAuthError) {
          logout(true);
        }
        throw err;
      }
    },
    [token, logout]
  );

  const deleteTask = useCallback(
    async (id: string): Promise<void> => {
      if (!token) {
        throw new Error('Authentication required to delete tasks.');
      }
      try {
        await api.tasks.delete(token, id);
        setTasks((prev) => prev.filter((t) => t._id !== id));
      } catch (err) {
        if (err instanceof ApiClientError) {
          if (err.isAuthError) {
            logout(true);
            return;
          }
          setErrorMessage(err.message);
        } else {
          setErrorMessage('Failed to delete task. Please try again.');
        }
        throw err;
      }
    },
    [token, logout]
  );

  const changeTaskStatus = useCallback(
    async (id: string, newStatus: TaskStatus): Promise<void> => {
      if (!token) return;
      if (savingTaskIds.has(id)) return;

      const task = tasks.find((t) => t._id === id);
      if (!task || task.status === newStatus) return;

      const originalStatus = task.status;

      // Optimistic status update
      setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, status: newStatus } : t)));
      setSavingTaskIds((prev) => new Set(prev).add(id));

      try {
        const res = await api.tasks.update(token, id, { status: newStatus });
        setTasks((prev) => prev.map((t) => (t._id === id ? res.task : t)));
      } catch (err) {
        // Rollback to original status on error
        setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, status: originalStatus } : t)));
        if (err instanceof ApiClientError) {
          if (err.isAuthError) {
            logout(true);
            return;
          }
          setErrorMessage(`Failed to update task: ${err.message}. Reverted to ${originalStatus}.`);
        } else {
          setErrorMessage(`Failed to move task. Reverted to ${originalStatus}.`);
        }
        throw err;
      } finally {
        setSavingTaskIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [token, tasks, savingTaskIds, logout]
  );

  const contextValue = useMemo(
    () => ({
      tasks,
      isLoading,
      errorMessage,
      savingTaskIds,
      reloadTasks,
      createTask,
      updateTask,
      deleteTask,
      changeTaskStatus,
      clearError,
    }),
    [
      tasks,
      isLoading,
      errorMessage,
      savingTaskIds,
      reloadTasks,
      createTask,
      updateTask,
      deleteTask,
      changeTaskStatus,
      clearError,
    ]
  );

  return <TaskContext.Provider value={contextValue}>{children}</TaskContext.Provider>;
};
