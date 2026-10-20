import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '../types/task';
import { useTasks } from '../context/useTasks';
import { AppShell } from '../components/layout/AppShell';
import { BentoHeader } from '../components/dashboard/BentoHeader';
import { KanbanBoard } from '../components/dashboard/KanbanBoard';
import { TaskModal } from '../components/dashboard/TaskModal';
import { Button } from '../components/common/Button';
import { AlertCircleIcon, CheckCircleIcon } from '../components/common/Icons';
import styles from './DashboardPage.module.css';

export const DashboardPage: React.FC = () => {
  const {
    tasks,
    isLoading,
    errorMessage,
    savingTaskIds,
    reloadTasks,
    createTask,
    updateTask,
    deleteTask,
    changeTaskStatus,
  } = useTasks();

  const [successToast, setSuccessToast] = useState<string | null>(null);
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
    reloadTasks();
  };

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
    if (editingTask) {
      await updateTask(editingTask._id, taskData);
      showToast('Task updated successfully');
    } else {
      await createTask(taskData);
      showToast('Task created successfully');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id);
      showToast('Task deleted successfully');
    } catch {
      // Error message is managed in TaskContext
    }
  };

  const handleStatusChange = async (id: string, newStatus: TaskStatus) => {
    try {
      await changeTaskStatus(id, newStatus);
      showToast(`Task moved to ${newStatus}`);
    } catch {
      // Rollback and error message are managed in TaskContext
    }
  };

  // Filter tasks based on search
  const filteredTasks = tasks.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q));
  });

  return (
    <AppShell title="Board" badge="Live">
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

      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSaveTask}
        initialTask={editingTask}
        defaultStatus={defaultModalStatus}
      />
    </AppShell>
  );
};
