import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Task, TaskStatus, TaskPriority } from '../types/task';
import { useTasks } from '../context/useTasks';
import { AppShell } from '../components/layout/AppShell';
import { TaskModal } from '../components/dashboard/TaskModal';
import { Button } from '../components/common/Button';
import {
  PlusIcon,
  SearchIcon,
  CloseIcon,
  EditIcon,
  TrashIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  FlagIcon,
  CalendarIcon,
  LayersIcon,
} from '../components/common/Icons';
import styles from './MyTasksPage.module.css';

type SortOption =
  | 'updated-desc'
  | 'updated-asc'
  | 'due-asc'
  | 'due-desc'
  | 'prio-desc'
  | 'prio-asc'
  | 'title-asc'
  | 'title-desc';

const PRIORITY_WEIGHTS: Record<TaskPriority, number> = {
  Urgent: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

function checkIsOverdue(dueDateStr?: string | null, status?: TaskStatus): boolean {
  if (!dueDateStr || status === 'Done') return false;
  const due = new Date(dueDateStr);
  if (isNaN(due.getTime())) return false;
  const now = new Date();
  const dueEndOfDay = new Date(due);
  dueEndOfDay.setHours(23, 59, 59, 999);
  return now.getTime() > dueEndOfDay.getTime();
}

function formatDueDate(dueDateStr?: string | null): string {
  if (!dueDateStr) return '—';
  const due = new Date(dueDateStr);
  if (isNaN(due.getTime())) return 'Invalid date';
  return due.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: due.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return 'Recently';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Recently';

  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 172800) return 'Yesterday';

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export const MyTasksPage: React.FC = () => {
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

  const navigate = useNavigate();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all');
  const [sortBy, setSortBy] = useState<SortOption>('updated-desc');

  // Modal & Toast state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setSuccessToast(message);
    setTimeout(() => {
      setSuccessToast((curr) => (curr === message ? null : curr));
    }, 3000);
  };

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
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

  const handleInlineStatusChange = async (id: string, newStatus: TaskStatus) => {
    try {
      await changeTaskStatus(id, newStatus);
      showToast(`Task moved to ${newStatus}`);
    } catch {
      // Rollback is managed in TaskContext
    }
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      await deleteTask(taskToDelete._id);
      showToast('Task deleted successfully');
      setTaskToDelete(null);
    } catch {
      // Error message is managed in TaskContext
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setSortBy('updated-desc');
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    statusFilter !== 'all' ||
    priorityFilter !== 'all' ||
    sortBy !== 'updated-desc';

  // Global counts
  const totalCount = tasks.length;
  const todoCount = tasks.filter((t) => t.status === 'To-Do').length;
  const progCount = tasks.filter((t) => t.status === 'In-Progress').length;
  const doneCount = tasks.filter((t) => t.status === 'Done').length;
  const overdueCount = tasks.filter((t) => checkIsOverdue(t.dueDate, t.status)).length;

  // Filtered and Sorted Tasks
  const filteredTasks = useMemo(() => {
    let result = tasks.filter((t) => {
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesDesc = t.description ? t.description.toLowerCase().includes(q) : false;
        if (!matchesTitle && !matchesDesc) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && t.status !== statusFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== 'all') {
        const taskPrio = t.priority || 'Medium';
        if (taskPrio !== priorityFilter) return false;
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'title-asc') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'title-desc') {
        return b.title.localeCompare(a.title);
      }

      if (sortBy === 'updated-desc') {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      }
      if (sortBy === 'updated-asc') {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return timeA - timeB;
      }

      if (sortBy === 'prio-desc') {
        const weightA = PRIORITY_WEIGHTS[a.priority || 'Medium'];
        const weightB = PRIORITY_WEIGHTS[b.priority || 'Medium'];
        return weightB - weightA;
      }
      if (sortBy === 'prio-asc') {
        const weightA = PRIORITY_WEIGHTS[a.priority || 'Medium'];
        const weightB = PRIORITY_WEIGHTS[b.priority || 'Medium'];
        return weightA - weightB;
      }

      if (sortBy === 'due-asc') {
        // Tasks without due date placed at the end
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }

      if (sortBy === 'due-desc') {
        // Tasks without due date placed at the end
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      }

      return 0;
    });

    return result;
  }, [tasks, searchQuery, statusFilter, priorityFilter, sortBy]);

  return (
    <AppShell title="My Tasks" badge="List">
      <div className={styles.contentContainer}>
        {errorMessage && (
          <div className={styles.errorBanner} role="alert">
            <div className={styles.errorBannerContent}>
              <AlertCircleIcon size={18} />
              <span>{errorMessage}</span>
            </div>
            <Button variant="secondary" size="sm" onClick={reloadTasks}>
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

        {/* Hero Header */}
        <section className={styles.headerCard}>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>My Tasks</h1>
            <p className={styles.subtitle}>
              Inspect, search, filter, and manage your complete task list with inline status updates and quick actions.
            </p>
          </div>

          <div className={styles.headerActions}>
            <Button
              variant="primary"
              size="md"
              icon={<PlusIcon size={18} />}
              onClick={handleOpenCreateModal}
            >
              New Task
            </Button>
            <Button
              variant="secondary"
              size="md"
              icon={<ArrowRightIcon size={18} />}
              onClick={() => navigate('/')}
            >
              Open Board
            </Button>
          </div>
        </section>

        {/* Stats Strip */}
        <section className={styles.statsStrip} aria-label="Task overview metrics">
          <div className={styles.statPill}>
            <span>Total Tasks:</span>
            <span className={styles.statPillCount}>{totalCount}</span>
          </div>
          <div className={styles.statPill}>
            <span>To-Do:</span>
            <span className={styles.statPillCount}>{todoCount}</span>
          </div>
          <div className={styles.statPill}>
            <span>In-Progress:</span>
            <span className={styles.statPillCount}>{progCount}</span>
          </div>
          <div className={styles.statPill}>
            <span>Done:</span>
            <span className={styles.statPillCount}>{doneCount}</span>
          </div>
          {overdueCount > 0 && (
            <div className={`${styles.statPill} ${styles.overdueStatPill}`}>
              <AlertCircleIcon size={14} />
              <span>Overdue:</span>
              <span className={styles.statPillCount}>{overdueCount}</span>
            </div>
          )}
        </section>

        {/* Controls Card: Search, Filters, Sorting */}
        <section className={styles.controlsCard} aria-label="Search and filter controls">
          <div className={styles.searchRow}>
            <div className={styles.searchInputWrapper}>
              <span className={styles.searchIconWrapper} aria-hidden="true">
                <SearchIcon size={16} />
              </span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search tasks by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search tasks"
              />
              {searchQuery && (
                <button
                  type="button"
                  className={styles.clearSearchBtn}
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search query"
                >
                  <CloseIcon size={14} />
                </button>
              )}
            </div>
          </div>

          <div className={styles.filtersRow}>
            <div className={styles.filterGroup}>
              <label className={styles.controlLabel} htmlFor="status-filter">
                <span>Status:</span>
                <select
                  id="status-filter"
                  className={styles.selectInput}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | TaskStatus)}
                >
                  <option value="all">All Statuses ({totalCount})</option>
                  <option value="To-Do">To-Do ({todoCount})</option>
                  <option value="In-Progress">In-Progress ({progCount})</option>
                  <option value="Done">Done ({doneCount})</option>
                </select>
              </label>

              <label className={styles.controlLabel} htmlFor="priority-filter">
                <span>Priority:</span>
                <select
                  id="priority-filter"
                  className={styles.selectInput}
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as 'all' | TaskPriority)}
                >
                  <option value="all">All Priorities</option>
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </label>

              <label className={styles.controlLabel} htmlFor="sort-by">
                <span>Sort:</span>
                <select
                  id="sort-by"
                  className={styles.selectInput}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                >
                  <option value="updated-desc">Recently Updated</option>
                  <option value="updated-asc">Oldest Updated</option>
                  <option value="due-asc">Due Date: Closest First</option>
                  <option value="due-desc">Due Date: Furthest First</option>
                  <option value="prio-desc">Priority: Highest First</option>
                  <option value="prio-asc">Priority: Lowest First</option>
                  <option value="title-asc">Title: A → Z</option>
                  <option value="title-desc">Title: Z → A</option>
                </select>
              </label>
            </div>

            <div className={styles.resultsMeta}>
              <span>Showing {filteredTasks.length} of {totalCount} tasks</span>
              {hasActiveFilters && (
                <button
                  type="button"
                  className={styles.resetBtn}
                  onClick={handleResetFilters}
                >
                  Reset filters
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Content Area */}
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
            <span>Loading your tasks...</span>
          </div>
        ) : totalCount === 0 ? (
          <div className={`${styles.tableCard} ${styles.emptyStateBox}`}>
            <LayersIcon size={32} style={{ color: 'var(--text-muted)' }} />
            <h2 className={styles.emptyStateTitle}>Your task list is empty</h2>
            <p className={styles.emptyStateText}>
              Get organized by creating your first task. Track progress, due dates, and priorities across all workflow stages.
            </p>
            <Button
              variant="primary"
              size="sm"
              icon={<PlusIcon size={16} />}
              onClick={handleOpenCreateModal}
              style={{ marginTop: '8px' }}
            >
              Create First Task
            </Button>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className={`${styles.tableCard} ${styles.emptyStateBox}`}>
            <SearchIcon size={32} style={{ color: 'var(--text-muted)' }} />
            <h2 className={styles.emptyStateTitle}>No matching tasks found</h2>
            <p className={styles.emptyStateText}>
              No tasks matched your current search and filter settings. Try adjusting your query or resetting filters.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleResetFilters}
              style={{ marginTop: '8px' }}
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className={styles.tableCard}>
            {/* Desktop Table View */}
            <div className={styles.tableWrapper}>
              <table className={styles.tasksTable}>
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((t) => {
                    const isSaving = savingTaskIds.has(t._id);
                    const isOverdue = checkIsOverdue(t.dueDate, t.status);
                    const prio = t.priority || 'Medium';
                    const prioClass =
                      prio === 'Urgent'
                        ? styles.prioUrgent
                        : prio === 'High'
                        ? styles.prioHigh
                        : prio === 'Low'
                        ? styles.prioLow
                        : styles.prioMed;

                    const statusSelectClass =
                      t.status === 'Done'
                        ? styles.statusSelectDone
                        : t.status === 'In-Progress'
                        ? styles.statusSelectProg
                        : styles.statusSelectTodo;

                    return (
                      <tr key={t._id}>
                        <td>
                          <div className={styles.taskTitleCell}>
                            <span
                              className={styles.taskTitleText}
                              onClick={() => handleOpenEditModal(t)}
                              title="Click to edit task"
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleOpenEditModal(t);
                                }
                              }}
                            >
                              {t.title}
                            </span>
                            {t.description && (
                              <span className={styles.taskDescPreview} title={t.description}>
                                {t.description}
                              </span>
                            )}
                          </div>
                        </td>

                        <td>
                          <select
                            className={`${styles.statusSelect} ${statusSelectClass} ${isSaving ? styles.savingStatus : ''}`}
                            value={t.status}
                            onChange={(e) => handleInlineStatusChange(t._id, e.target.value as TaskStatus)}
                            disabled={isSaving}
                            aria-label={`Change status for "${t.title}"`}
                          >
                            <option value="To-Do">To-Do</option>
                            <option value="In-Progress">In-Progress</option>
                            <option value="Done">Done</option>
                          </select>
                        </td>

                        <td>
                          <span className={`${styles.priorityBadge} ${prioClass}`}>
                            <FlagIcon size={12} />
                            <span>{prio}</span>
                          </span>
                        </td>

                        <td>
                          <div className={styles.dateCell}>
                            <CalendarIcon size={14} style={{ color: isOverdue ? 'var(--color-danger)' : 'var(--text-muted)' }} />
                            <span style={{ color: isOverdue ? 'var(--color-danger)' : 'inherit', fontWeight: isOverdue ? 600 : 'normal' }}>
                              {formatDueDate(t.dueDate)}
                            </span>
                            {isOverdue && <span className={styles.overdueTag}>Overdue</span>}
                          </div>
                        </td>

                        <td>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {formatRelativeTime(t.updatedAt || t.createdAt)}
                          </span>
                        </td>

                        <td>
                          <div className={styles.actionsCell}>
                            <Button
                              variant="subtle"
                              size="sm"
                              icon={<EditIcon size={14} />}
                              onClick={() => handleOpenEditModal(t)}
                              aria-label={`Edit task "${t.title}"`}
                              title="Edit task"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              icon={<TrashIcon size={14} />}
                              onClick={() => setTaskToDelete(t)}
                              aria-label={`Delete task "${t.title}"`}
                              title="Delete task"
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card-Based List View */}
            <div className={styles.mobileCardList}>
              {filteredTasks.map((t) => {
                const isSaving = savingTaskIds.has(t._id);
                const isOverdue = checkIsOverdue(t.dueDate, t.status);
                const prio = t.priority || 'Medium';
                const prioClass =
                  prio === 'Urgent'
                    ? styles.prioUrgent
                    : prio === 'High'
                    ? styles.prioHigh
                    : prio === 'Low'
                    ? styles.prioLow
                    : styles.prioMed;

                const statusSelectClass =
                  t.status === 'Done'
                    ? styles.statusSelectDone
                    : t.status === 'In-Progress'
                    ? styles.statusSelectProg
                    : styles.statusSelectTodo;

                return (
                  <div key={t._id} className={styles.mobileTaskCard}>
                    <div className={styles.mobileCardTop}>
                      <span
                        className={styles.mobileCardTitle}
                        onClick={() => handleOpenEditModal(t)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleOpenEditModal(t);
                          }
                        }}
                      >
                        {t.title}
                      </span>
                      <select
                        className={`${styles.statusSelect} ${statusSelectClass} ${isSaving ? styles.savingStatus : ''}`}
                        value={t.status}
                        onChange={(e) => handleInlineStatusChange(t._id, e.target.value as TaskStatus)}
                        disabled={isSaving}
                        aria-label={`Change status for "${t.title}"`}
                      >
                        <option value="To-Do">To-Do</option>
                        <option value="In-Progress">In-Progress</option>
                        <option value="Done">Done</option>
                      </select>
                    </div>

                    {t.description && (
                      <p className={styles.taskDescPreview}>{t.description}</p>
                    )}

                    <div className={styles.mobileCardMetaRow}>
                      <span className={`${styles.priorityBadge} ${prioClass}`}>
                        <FlagIcon size={12} />
                        <span>{prio}</span>
                      </span>

                      <div className={styles.dateCell}>
                        <CalendarIcon size={14} style={{ color: isOverdue ? 'var(--color-danger)' : 'var(--text-muted)' }} />
                        <span style={{ color: isOverdue ? 'var(--color-danger)' : 'inherit', fontSize: '12px' }}>
                          {formatDueDate(t.dueDate)}
                        </span>
                        {isOverdue && <span className={styles.overdueTag}>Overdue</span>}
                      </div>

                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Updated {formatRelativeTime(t.updatedAt || t.createdAt)}
                      </span>
                    </div>

                    <div className={styles.mobileCardActions}>
                      <Button
                        variant="subtle"
                        size="sm"
                        icon={<EditIcon size={14} />}
                        onClick={() => handleOpenEditModal(t)}
                        aria-label={`Edit task "${t.title}"`}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<TrashIcon size={14} />}
                        onClick={() => setTaskToDelete(t)}
                        aria-label={`Delete task "${t.title}"`}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSaveTask}
        initialTask={editingTask}
        defaultStatus="To-Do"
      />

      {/* Delete Confirmation Modal */}
      {taskToDelete && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setTaskToDelete(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-delete-title"
        >
          <div className={styles.confirmDialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmHeader}>
              <AlertCircleIcon size={22} />
              <h2 id="confirm-delete-title" className={styles.confirmTitle}>
                Delete Task
              </h2>
            </div>
            <p className={styles.confirmMessage}>
              Are you sure you want to delete <strong>"{taskToDelete.title}"</strong>? This action will permanently remove the task from your workspace.
            </p>
            <div className={styles.confirmActions}>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setTaskToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                icon={<TrashIcon size={16} />}
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Task'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};
