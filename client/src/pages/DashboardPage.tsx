import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority } from '../types/task';
import { useAuth } from '../context/useAuth';
import { api, ApiClientError } from '../services/api';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { BentoHeader } from '../components/dashboard/BentoHeader';
import { KanbanBoard } from '../components/dashboard/KanbanBoard';
import { TaskModal } from '../components/dashboard/TaskModal';
import { Button } from '../components/common/Button';
import { AlertCircleIcon, CheckCircleIcon } from '../components/common/Icons';
import styles from './DashboardPage.module.css';

export const DashboardPage: React.FC = () => {
  const { token, logout } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [reloadCounter, setReloadCounter] = useState(0);
  const [savingTaskIds, setSavingTaskIds] = useState<Set<string>>(new Set());

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultModalStatus, setDefaultModalStatus] = useState<TaskStatus>('To-Do');

  const showToast = (message: string) => {
    setSuccessToast(message);
    setTimeout(() => {
      setSuccessToast((curr) => (curr === message ? null : curr));
    }, 3000);
  };

  const handleRetry = () => {
    setIsLoading(true);
    setErrorMessage(null);
    setReloadCounter((c) => c + 1);
  };

  useEffect(() => {
    let isCurrent = true;

    if (!token) return;

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
  }, [token, logout, reloadCounter]);

  const handleOpenCreateModal = (status?: TaskStatus) => {
    setEditingTask(null);
    setDefaultModalStatus(status || 'To-Do');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setDefaultModalStatus(task.status);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleSaveTask = async (taskData: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string | null;
  }) => {
    if (!token) return;

    if (editingTask) {
      const res = await api.tasks.update(token, editingTask._id, {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        dueDate: taskData.dueDate,
      });
      setTasks((prev) => prev.map((t) => (t._id === res.task._id ? res.task : t)));
      showToast('Task updated successfully');
    } else {
      const res = await api.tasks.create(token, {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        dueDate: taskData.dueDate,
      });
      setTasks((prev) => [res.task, ...prev]);
      showToast('Task created successfully');
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!token) return;

    try {
      await api.tasks.delete(token, id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      showToast('Task deleted successfully');
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
    }
  };

  const handleStatusChange = async (id: string, newStatus: TaskStatus) => {
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
      showToast(`Task moved to ${newStatus}`);
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
    } finally {
      setSavingTaskIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // Filter tasks based on search
  const filteredTasks = tasks.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q));
  });

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.mainContent}>
        <div className={styles.contentContainer}>
          {errorMessage && (
            <div className={styles.errorBanner} role="alert">
              <div className={styles.errorBannerContent}>
                <AlertCircleIcon size={18} />
                <span>{errorMessage}</span>
              </div>
              <Button variant="secondary" size="sm" onClick={handleRetry}>
                Retry
              </Button>
            </div>
          )}

          {successToast && (
            <div className={styles.successToast} role="status">
              <CheckCircleIcon size={16} />
              <span>{successToast}</span>
            </div>
          )}

          <BentoHeader
            tasks={tasks}
            onOpenCreateModal={() => handleOpenCreateModal('To-Do')}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner} />
              <span>Loading tasks from server...</span>
            </div>
          ) : (
            <KanbanBoard
              tasks={filteredTasks}
              savingTaskIds={savingTaskIds}
              onAddTask={handleOpenCreateModal}
              onEditTask={handleOpenEditModal}
              onDeleteTask={handleDeleteTask}
              onStatusChange={handleStatusChange}
              onTaskMove={handleStatusChange}
            />
          )}
        </div>
      </main>

      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSaveTask}
        initialTask={editingTask}
        defaultStatus={defaultModalStatus}
      />

      <Footer />
    </div>
  );
};
