import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TaskStatus, TaskPriority } from '../types/task';
import { useTasks } from '../context/useTasks';
import { AppShell } from '../components/layout/AppShell';
import { TaskModal } from '../components/dashboard/TaskModal';
import { Button } from '../components/common/Button';
import {
  PlusIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  CheckIcon,
  ClockIcon,
  LayersIcon,
  AlertCircleIcon,
  CalendarIcon,
  FlagIcon,
} from '../components/common/Icons';
import styles from './OverviewPage.module.css';

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
  if (!dueDateStr) return 'No due date';
  const due = new Date(dueDateStr);
  if (isNaN(due.getTime())) return 'Invalid date';
  return due.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: due.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

function getDeadlineLabel(dueDateStr: string): string {
  const due = new Date(dueDateStr);
  const now = new Date();
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const tomorrowEnd = new Date(todayEnd);
  tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

  if (due.getTime() <= todayEnd.getTime()) {
    return 'Due Today';
  }
  if (due.getTime() <= tomorrowEnd.getTime()) {
    return 'Due Tomorrow';
  }

  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return `In ${diffDays} days`;
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

export const OverviewPage: React.FC = () => {
  const { tasks, isLoading, errorMessage, reloadTasks, createTask, changeTaskStatus } = useTasks();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setSuccessToast(message);
    setTimeout(() => {
      setSuccessToast((curr) => (curr === message ? null : curr));
    }, 3000);
  };

  const handleCreateTask = async (taskData: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string | null;
  }) => {
    await createTask(taskData);
    showToast('Task created successfully');
  };

  // Real Summary Metrics
  const total = tasks.length;
  const todoCount = tasks.filter((t) => t.status === 'To-Do').length;
  const progCount = tasks.filter((t) => t.status === 'In-Progress').length;
  const doneCount = tasks.filter((t) => t.status === 'Done').length;
  const completionPct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  // Status Distribution Percentages
  const todoPct = total === 0 ? 0 : Math.round((todoCount / total) * 100);
  const progPct = total === 0 ? 0 : Math.round((progCount / total) * 100);
  const donePct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  // Priority Distribution
  const urgentCount = tasks.filter((t) => t.priority === 'Urgent').length;
  const highCount = tasks.filter((t) => t.priority === 'High').length;
  const medCount = tasks.filter((t) => t.priority === 'Medium' || !t.priority).length;
  const lowCount = tasks.filter((t) => t.priority === 'Low').length;

  // Overdue tasks (excluding Done)
  const overdueTasks = tasks.filter((t) => checkIsOverdue(t.dueDate, t.status));

  // Upcoming Deadlines: (dueDate present, not Done, not overdue, nearest first)
  const upcomingTasks = tasks
    .filter((t) => Boolean(t.dueDate) && t.status !== 'Done' && !checkIsOverdue(t.dueDate, t.status))
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  // Recent Tasks: Ordered by updatedAt or createdAt descending
  const recentTasks = [...tasks]
    .sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return timeB - timeA;
    })
    .slice(0, 5);

  // Priority Focus Task (Fernly-inspired Agenda highlight)
  const focusTask = useMemo(() => {
    if (overdueTasks.length > 0) return { task: overdueTasks[0], reason: 'Overdue Deadline' };
    const urgentHigh = tasks.find(
      (t) => t.status !== 'Done' && (t.priority === 'Urgent' || t.priority === 'High')
    );
    if (urgentHigh) return { task: urgentHigh, reason: `${urgentHigh.priority} Priority Focus` };
    if (upcomingTasks.length > 0) return { task: upcomingTasks[0], reason: 'Upcoming Deadline' };
    const firstActive = tasks.find((t) => t.status !== 'Done');
    if (firstActive) return { task: firstActive, reason: 'Next Up' };
    return null;
  }, [overdueTasks, upcomingTasks, tasks]);

  const handleQuickComplete = async (taskId: string, title: string) => {
    try {
      await changeTaskStatus(taskId, 'Done');
      showToast(`Task "${title}" marked as complete.`);
    } catch {
      // Handled in context
    }
  };

  return (
    <AppShell title="Dashboard" badge="Overview">
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

        {/* Hero Header Card */}
        <section className={styles.headerCard}>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>Workspace Overview</h1>
            <p className={styles.subtitle}>
              Monitor workspace health, task progress, urgent deadlines, and recent activity.
            </p>
          </div>

          <div className={styles.headerActions}>
            <Button
              variant="primary"
              size="md"
              icon={<PlusIcon size={16} />}
              onClick={() => setIsModalOpen(true)}
            >
              New Task
            </Button>
            <Button
              variant="secondary"
              size="md"
              icon={<ArrowRightIcon size={16} />}
              onClick={() => navigate('/')}
            >
              Open Board
            </Button>
          </div>
        </section>

        {/* Priority Focus Action Card */}
        {!isLoading && focusTask && (
          <aside
            className={`${styles.focusCard} ${focusTask.reason.includes('Overdue') ? styles.focusCardUrgent : ''}`}
            aria-label="Immediate priority task"
          >
            <div className={styles.focusLeft}>
              <div className={styles.focusLabelRow}>
                <span
                  className={`${styles.focusBadge} ${focusTask.reason.includes('Overdue') ? styles.focusBadgeUrgent : ''}`}
                >
                  {focusTask.reason}
                </span>
                {focusTask.task.dueDate && (
                  <span className={styles.focusDueText}>
                    Deadline: {formatDueDate(focusTask.task.dueDate)}
                  </span>
                )}
              </div>
              <span className={styles.focusTitle}>{focusTask.task.title}</span>
            </div>

            <div className={styles.focusRight}>
              <Button
                variant="secondary"
                size="sm"
                icon={<CheckIcon size={14} />}
                onClick={() => handleQuickComplete(focusTask.task._id, focusTask.task.title)}
              >
                Mark Complete
              </Button>
              <Button
                variant="subtle"
                size="sm"
                icon={<ArrowRightIcon size={14} />}
                onClick={() => navigate('/')}
              >
                View on Board
              </Button>
            </div>
          </aside>
        )}

        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
            <span>Loading workspace overview...</span>
          </div>
        ) : (
          <>
            {/* Top Stat Cards */}
            <section className={styles.metricsGrid} aria-label="Task Summary Cards">
              <div className={styles.metricCard}>
                <div className={styles.metricHeader}>
                  <span className={styles.metricLabel}>Total Tasks</span>
                  <span className={styles.metricIcon}>
                    <LayersIcon size={16} />
                  </span>
                </div>
                <div className={styles.metricValue}>{total}</div>
                <div className={styles.metricSubtext}>Across all workflow stages</div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricHeader}>
                  <span className={styles.metricLabel}>Completed</span>
                  <span className={`${styles.metricIcon} ${styles.iconDone}`}>
                    <CheckCircleIcon size={16} />
                  </span>
                </div>
                <div className={styles.metricValue}>{doneCount}</div>
                <div className={styles.metricSubtext}>
                  {total === 0 ? '0% finished' : `${completionPct}% of total workload`}
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricHeader}>
                  <span className={styles.metricLabel}>In Progress</span>
                  <span className={`${styles.metricIcon} ${styles.iconProg}`}>
                    <ClockIcon size={16} />
                  </span>
                </div>
                <div className={styles.metricValue}>{progCount}</div>
                <div className={styles.metricSubtext}>Currently active tasks</div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricHeader}>
                  <span className={styles.metricLabel}>To-Do</span>
                  <span className={`${styles.metricIcon} ${styles.iconTodo}`}>
                    <LayersIcon size={16} />
                  </span>
                </div>
                <div className={styles.metricValue}>{todoCount}</div>
                <div className={styles.metricSubtext}>Awaiting development</div>
              </div>
            </section>

            {/* Midsection: Two Columns (Progress/Breakdowns & Attention/Deadlines) */}
            <div className={styles.sectionGrid}>
              {/* Left Column: Progress & Distributions */}
              <div className={styles.columnStack}>
                {/* Completion Progress Card */}
                <div className={styles.bentoCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitleGroup}>
                      <CheckCircleIcon size={16} />
                      <h2 className={styles.cardTitle}>Completion Progress</h2>
                    </div>
                    <span className={styles.cardBadge}>{doneCount} / {total} Tasks</span>
                  </div>

                  <div className={styles.progressSection}>
                    <div className={styles.progressInfoRow}>
                      <span className={styles.progressPercentage}>{completionPct}%</span>
                      <span className={styles.progressFraction}>
                        {total === 0 ? 'No tasks created' : `${total - doneCount} remaining`}
                      </span>
                    </div>

                    <div
                      className={styles.progressBarTrack}
                      role="progressbar"
                      aria-valuenow={completionPct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="Workspace completion progress"
                    >
                      <div
                        className={styles.progressBarFill}
                        style={{ width: `${completionPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Status Segmented Bar */}
                  <div>
                    <div className={styles.breakdownList}>
                      <div className={styles.breakdownRow}>
                        <div className={styles.breakdownLabel}>
                          <span className={`${styles.statusIndicatorDot} ${styles.todoDot}`} />
                          <span>To-Do</span>
                        </div>
                        <div className={styles.breakdownValues}>
                          <span className={styles.breakdownCount}>{todoCount}</span>
                          <span className={styles.breakdownPercent}>{todoPct}%</span>
                        </div>
                      </div>

                      <div className={styles.breakdownRow}>
                        <div className={styles.breakdownLabel}>
                          <span className={`${styles.statusIndicatorDot} ${styles.progDot}`} />
                          <span>In-Progress</span>
                        </div>
                        <div className={styles.breakdownValues}>
                          <span className={styles.breakdownCount}>{progCount}</span>
                          <span className={styles.breakdownPercent}>{progPct}%</span>
                        </div>
                      </div>

                      <div className={styles.breakdownRow}>
                        <div className={styles.breakdownLabel}>
                          <span className={`${styles.statusIndicatorDot} ${styles.doneDot}`} />
                          <span>Done</span>
                        </div>
                        <div className={styles.breakdownValues}>
                          <span className={styles.breakdownCount}>{doneCount}</span>
                          <span className={styles.breakdownPercent}>{donePct}%</span>
                        </div>
                      </div>
                    </div>

                    {total > 0 && (
                      <div className={styles.segmentedBar} aria-hidden="true">
                        <div className={styles.segmentTodo} style={{ width: `${todoPct}%` }} />
                        <div className={styles.segmentProg} style={{ width: `${progPct}%` }} />
                        <div className={styles.segmentDone} style={{ width: `${donePct}%` }} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Priority Breakdown Card */}
                <div className={styles.bentoCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitleGroup}>
                      <FlagIcon size={16} />
                      <h2 className={styles.cardTitle}>Priority Breakdown</h2>
                    </div>
                    <span className={styles.cardBadge}>All Tasks</span>
                  </div>

                  <div className={styles.priorityGrid}>
                    <div className={`${styles.priorityItem} ${styles.prioUrgent}`}>
                      <div className={styles.priorityLabelGroup}>
                        <FlagIcon size={12} />
                        <span>Urgent</span>
                      </div>
                      <span className={styles.priorityCount}>{urgentCount}</span>
                    </div>

                    <div className={`${styles.priorityItem} ${styles.prioHigh}`}>
                      <div className={styles.priorityLabelGroup}>
                        <FlagIcon size={12} />
                        <span>High</span>
                      </div>
                      <span className={styles.priorityCount}>{highCount}</span>
                    </div>

                    <div className={`${styles.priorityItem} ${styles.prioMed}`}>
                      <div className={styles.priorityLabelGroup}>
                        <FlagIcon size={12} />
                        <span>Medium</span>
                      </div>
                      <span className={styles.priorityCount}>{medCount}</span>
                    </div>

                    <div className={`${styles.priorityItem} ${styles.prioLow}`}>
                      <div className={styles.priorityLabelGroup}>
                        <FlagIcon size={12} />
                        <span>Low</span>
                      </div>
                      <span className={styles.priorityCount}>{lowCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Needs Attention & Upcoming Deadlines */}
              <div className={styles.columnStack}>
                {/* Needs Attention (Overdue Tasks) */}
                <div className={styles.bentoCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitleGroup}>
                      <AlertCircleIcon size={16} />
                      <h2 className={styles.cardTitle}>Needs Attention</h2>
                    </div>
                    {overdueTasks.length > 0 && (
                      <span className={`${styles.cardBadge} ${styles.alertBadge}`}>
                        {overdueTasks.length} Overdue
                      </span>
                    )}
                  </div>

                  {overdueTasks.length === 0 ? (
                    <div className={styles.emptyStateBox}>
                      <CheckCircleIcon size={22} style={{ color: 'var(--color-done)' }} />
                      <span className={styles.emptyStateTitle}>All deadlines on track</span>
                      <p className={styles.emptyStateText}>
                        No overdue tasks in your workspace.
                      </p>
                    </div>
                  ) : (
                    <div className={styles.taskItemList}>
                      {overdueTasks.map((t) => (
                        <Link
                          key={t._id}
                          to="/"
                          className={styles.taskItemLink}
                          title={`View "${t.title}" on Board`}
                        >
                          <div className={styles.taskItemLeft}>
                            <span className={styles.taskItemTitle}>{t.title}</span>
                            <div className={styles.taskItemMeta}>
                              <span className={styles.overdueTag}>
                                {formatDueDate(t.dueDate)}
                              </span>
                              <span className={styles.taskStatusTag}>{t.status}</span>
                            </div>
                          </div>
                          <ArrowRightIcon size={14} className={styles.taskArrow} />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Upcoming Deadlines Card */}
                <div className={styles.bentoCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitleGroup}>
                      <CalendarIcon size={16} />
                      <h2 className={styles.cardTitle}>Upcoming Deadlines</h2>
                    </div>
                    <span className={styles.cardBadge}>{upcomingTasks.length} Active</span>
                  </div>

                  {upcomingTasks.length === 0 ? (
                    <div className={styles.emptyStateBox}>
                      <CalendarIcon size={22} style={{ color: 'var(--text-muted)' }} />
                      <span className={styles.emptyStateTitle}>No scheduled deadlines</span>
                      <p className={styles.emptyStateText}>
                        Add due dates when creating tasks to see upcoming delivery schedules.
                      </p>
                    </div>
                  ) : (
                    <div className={styles.taskItemList}>
                      {upcomingTasks.map((t) => (
                        <Link
                          key={t._id}
                          to="/"
                          className={styles.taskItemLink}
                          title={`View "${t.title}" on Board`}
                        >
                          <div className={styles.taskItemLeft}>
                            <span className={styles.taskItemTitle}>{t.title}</span>
                            <div className={styles.taskItemMeta}>
                              <span className={styles.upcomingTag}>
                                {getDeadlineLabel(t.dueDate!)}
                              </span>
                              <span className={styles.taskStatusTag}>{t.status}</span>
                            </div>
                          </div>
                          <ArrowRightIcon size={14} className={styles.taskArrow} />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom: Recent Activity */}
            <section className={styles.bentoCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitleGroup}>
                  <ClockIcon size={16} />
                  <h2 className={styles.cardTitle}>Recent Workspace Activity</h2>
                </div>
                <Link to="/" className={styles.viewBoardLink}>
                  <span>Open Kanban Board</span>
                  <ArrowRightIcon size={14} />
                </Link>
              </div>

              {recentTasks.length === 0 ? (
                <div className={styles.emptyStateBox}>
                  <p>No tasks created yet.</p>
                </div>
              ) : (
                <div className={styles.recentGrid}>
                  {recentTasks.map((t) => (
                    <Link key={t._id} to="/" className={styles.recentItemCard}>
                      <div className={styles.recentItemHeader}>
                        <span className={styles.recentTitle}>{t.title}</span>
                        <span className={`${styles.statusChip} ${styles['chip' + t.status.replace('-', '')]}`}>
                          {t.status}
                        </span>
                      </div>
                      <div className={styles.recentItemFooter}>
                        <span className={styles.recentPriority}>{t.priority || 'Medium'}</span>
                        <span className={styles.recentTime}>
                          {formatRelativeTime(t.updatedAt || t.createdAt)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
        defaultStatus="To-Do"
      />
    </AppShell>
  );
};

export default OverviewPage;
