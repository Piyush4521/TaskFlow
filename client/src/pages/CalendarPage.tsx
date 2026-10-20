import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Task, TaskStatus, TaskPriority } from '../types/task';
import { useTasks } from '../context/useTasks';
import { AppShell } from '../components/layout/AppShell';
import { TaskModal } from '../components/dashboard/TaskModal';
import { Button } from '../components/common/Button';
import {
  PlusIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  FlagIcon,
  EditIcon,
} from '../components/common/Icons';
import styles from './CalendarPage.module.css';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getTaskDateKey(dueDateStr?: string | null): string | null {
  if (!dueDateStr) return null;
  if (dueDateStr.includes('T')) {
    return dueDateStr.split('T')[0];
  }
  const d = new Date(dueDateStr);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
}

function checkIsOverdue(dueDateStr?: string | null, status?: TaskStatus): boolean {
  if (!dueDateStr || status === 'Done') return false;
  const due = new Date(dueDateStr);
  if (isNaN(due.getTime())) return false;
  const now = new Date();
  const dueEndOfDay = new Date(due);
  dueEndOfDay.setHours(23, 59, 59, 999);
  return now.getTime() > dueEndOfDay.getTime();
}

function formatDateHeading(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTodayDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const CalendarPage: React.FC = () => {
  const { tasks, isLoading, errorMessage, reloadTasks, createTask, updateTask } = useTasks();
  const navigate = useNavigate();

  // Current calendar view month and selected day
  const todayKey = formatTodayDateKey();
  const [viewDate, setViewDate] = useState<Date>(() => new Date());
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);

  // Modal and toast state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setSuccessToast(message);
    setTimeout(() => {
      setSuccessToast((curr) => (curr === message ? null : curr));
    }, 3000);
  };

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  const handlePrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setViewDate(now);
    setSelectedDateKey(todayKey);
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

  // Group tasks by dateKey: "YYYY-MM-DD"
  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const task of tasks) {
      const key = getTaskDateKey(task.dueDate);
      if (key) {
        const list = map.get(key) || [];
        list.push(task);
        map.set(key, list);
      }
    }
    return map;
  }, [tasks]);

  // Compute month days matrix
  const calendarDays = useMemo(() => {
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: {
      dayNumber: number;
      dateKey: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      tasks: Task[];
    }[] = [];

    // Leading days from previous month
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const dayNumber = daysInPrevMonth - i;
      const prevDate = new Date(viewYear, viewMonth - 1, dayNumber);
      const dateKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
      days.push({
        dayNumber,
        dateKey,
        isCurrentMonth: false,
        isToday: dateKey === todayKey,
        tasks: tasksByDate.get(dateKey) || [],
      });
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        dayNumber: day,
        dateKey,
        isCurrentMonth: true,
        isToday: dateKey === todayKey,
        tasks: tasksByDate.get(dateKey) || [],
      });
    }

    // Trailing days from next month to complete 35 or 42 cells
    const totalSlots = days.length <= 35 ? 35 : 42;
    const remaining = totalSlots - days.length;
    for (let day = 1; day <= remaining; day++) {
      const nextDate = new Date(viewYear, viewMonth + 1, day);
      const dateKey = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        dayNumber: day,
        dateKey,
        isCurrentMonth: false,
        isToday: dateKey === todayKey,
        tasks: tasksByDate.get(dateKey) || [],
      });
    }

    return days;
  }, [viewYear, viewMonth, todayKey, tasksByDate]);

  // Tasks for the currently selected day
  const selectedDayTasks = tasksByDate.get(selectedDateKey) || [];

  // Summary counts for current month
  const currentMonthTaskCount = useMemo(() => {
    let count = 0;
    const monthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
    for (const [key, list] of tasksByDate.entries()) {
      if (key.startsWith(monthPrefix)) {
        count += list.length;
      }
    }
    return count;
  }, [viewYear, viewMonth, tasksByDate]);

  const monthHeadingText = viewDate.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  return (
    <AppShell title="Calendar" badge="Schedule">
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
            <h1 className={styles.title}>Task Calendar</h1>
            <p className={styles.subtitle}>
              Visualize and manage task deadlines across your workflow stages with date alignment and day details.
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
              onClick={() => navigate('/')}
            >
              Open Board
            </Button>
          </div>
        </section>

        {/* Month Navigation Toolbar */}
        <section className={styles.toolbarCard} aria-label="Month navigation toolbar">
          <div className={styles.monthNavGroup}>
            <div className={styles.navBtnGroup}>
              <button
                type="button"
                className={styles.navIconBtn}
                onClick={handlePrevMonth}
                aria-label="Previous month"
                title="Previous month"
              >
                <ArrowLeftIcon size={16} />
              </button>
              <button
                type="button"
                className={styles.navIconBtn}
                onClick={handleNextMonth}
                aria-label="Next month"
                title="Next month"
              >
                <ArrowRightIcon size={16} />
              </button>
              <button
                type="button"
                className={styles.todayBtn}
                onClick={handleToday}
                aria-label="Jump to current month and today"
              >
                Today
              </button>
            </div>

            <h2 className={styles.monthHeading}>{monthHeadingText}</h2>
          </div>

          <div className={styles.monthMeta}>
            <span className={styles.monthBadge}>
              {currentMonthTaskCount} {currentMonthTaskCount === 1 ? 'Task' : 'Tasks'} Scheduled
            </span>
            <Link to="/tasks" style={{ fontSize: '13px', fontWeight: 600 }}>
              View in My Tasks
            </Link>
          </div>
        </section>

        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
            <span>Loading task calendar...</span>
          </div>
        ) : (
          <div className={styles.calendarLayout}>
            {/* Left: Month Calendar Card */}
            <div className={styles.calendarCard}>
              {/* Weekday Row */}
              <div className={styles.weekdayHeaderRow}>
                {WEEKDAYS.map((day) => (
                  <div key={day} className={styles.weekdayHeaderCell}>
                    {day}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className={styles.daysGrid} role="grid" aria-label="Month calendar view">
                {calendarDays.map((cell) => {
                  const isSelected = cell.dateKey === selectedDateKey;
                  const cellClass = [
                    styles.dayCell,
                    !cell.isCurrentMonth ? styles.otherMonthCell : '',
                    isSelected ? styles.selectedCell : '',
                  ]
                    .filter(Boolean)
                    .join(' ');

                  const visibleTasks = cell.tasks.slice(0, 2);
                  const overflowCount = cell.tasks.length - visibleTasks.length;

                  return (
                    <div
                      key={cell.dateKey}
                      className={cellClass}
                      onClick={() => setSelectedDateKey(cell.dateKey)}
                      role="gridcell"
                      tabIndex={0}
                      aria-selected={isSelected}
                      aria-label={`${cell.dateKey}, ${cell.tasks.length} tasks`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedDateKey(cell.dateKey);
                        }
                      }}
                    >
                      <div className={styles.cellTopRow}>
                        <span
                          className={`${styles.dayNumber} ${cell.isToday ? styles.todayNumber : ''}`}
                        >
                          {cell.dayNumber}
                        </span>

                        {cell.tasks.length > 0 && (
                          <span
                            className={styles.cellTaskCountBadge}
                            title={`${cell.tasks.length} tasks due`}
                          >
                            {cell.tasks.length}
                          </span>
                        )}
                      </div>

                      {cell.tasks.length > 0 && (
                        <div className={styles.cellTaskChips}>
                          {visibleTasks.map((t) => {
                            const chipClass =
                              t.status === 'Done'
                                ? styles.chipDone
                                : t.status === 'In-Progress'
                                ? styles.chipProg
                                : styles.chipTodo;

                            return (
                              <div
                                key={t._id}
                                className={`${styles.taskChip} ${chipClass}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditModal(t);
                                }}
                                title={`${t.title} (${t.status}, ${t.priority || 'Medium'}) — click to edit`}
                              >
                                {t.title}
                              </div>
                            );
                          })}

                          {overflowCount > 0 && (
                            <span className={styles.moreTasksPill}>
                              +{overflowCount} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Selected Day Detail Panel */}
            <aside className={styles.detailPanelCard} aria-label="Selected day task details">
              <div className={styles.panelHeader}>
                <div>
                  <h3 className={styles.panelDateTitle}>
                    {formatDateHeading(selectedDateKey)}
                  </h3>
                  <p className={styles.panelSubtitle}>
                    {selectedDayTasks.length} {selectedDayTasks.length === 1 ? 'task scheduled' : 'tasks scheduled'}
                  </p>
                </div>

                <Button
                  variant="subtle"
                  size="sm"
                  icon={<PlusIcon size={14} />}
                  onClick={handleOpenCreateModal}
                  aria-label="Add new task"
                  title="Add task"
                >
                  Add Task
                </Button>
              </div>

              {selectedDayTasks.length === 0 ? (
                <div className={styles.emptyStateBox}>
                  <CalendarIcon size={28} style={{ color: 'var(--text-muted)' }} />
                  <span className={styles.emptyStateTitle}>No tasks for this day</span>
                  <p className={styles.emptyStateText}>
                    You have no deadlines scheduled for {selectedDateKey}. Click 'Add Task' to plan ahead.
                  </p>
                </div>
              ) : (
                <div className={styles.panelTasksList}>
                  {selectedDayTasks.map((t) => {
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

                    const statusClass =
                      t.status === 'Done'
                        ? styles.badgeDone
                        : t.status === 'In-Progress'
                        ? styles.badgeProg
                        : styles.badgeTodo;

                    return (
                      <div key={t._id} className={styles.panelTaskCard}>
                        <div className={styles.panelTaskTop}>
                          <span
                            className={styles.panelTaskTitle}
                            onClick={() => handleOpenEditModal(t)}
                            title="Click to edit task"
                          >
                            {t.title}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(t)}
                            style={{ color: 'var(--text-muted)', display: 'flex', padding: '2px' }}
                            title="Edit task"
                            aria-label={`Edit task "${t.title}"`}
                          >
                            <EditIcon size={14} />
                          </button>
                        </div>

                        {t.description && (
                          <p className={styles.panelTaskDesc}>{t.description}</p>
                        )}

                        <div className={styles.panelTaskMeta}>
                          <span className={`${styles.statusBadge} ${statusClass}`}>
                            {t.status}
                          </span>

                          <span className={`${styles.priorityBadge} ${prioClass}`}>
                            <FlagIcon size={12} />
                            <span>{prio}</span>
                          </span>

                          {isOverdue && (
                            <span className={styles.overdueTag}>Overdue</span>
                          )}
                        </div>

                        <div className={styles.panelTaskActions}>
                          <Link
                            to="/"
                            style={{
                              fontSize: '12px',
                              fontWeight: 500,
                              color: 'var(--color-primary)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span>View on Board</span>
                            <ArrowRightIcon size={12} />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </aside>
          </div>
        )}
      </div>

      {/* Task Modal for creation and editing */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSaveTask}
        initialTask={editingTask}
        defaultStatus="To-Do"
      />
    </AppShell>
  );
};
