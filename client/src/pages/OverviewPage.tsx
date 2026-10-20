import React, { useState } from 'react';
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
  const { tasks, isLoading, errorMessage, reloadTasks, createTask } = useTasks();
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

  // Summary Metrics
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

  // Needs Attention: Overdue tasks (excluding Done)
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
              Monitor workspace health, task progress, urgent deadlines, and recent activity across your personal projects.
            </p>
          </div>

          <div className={styles.headerActions}>
            <Button
              variant="primary"
              size="md"
              icon={<PlusIcon size={18} />}
              onClick={() => setIsModalOpen(true)}
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
                  <span className={styles.metricIconWrapper}>
                    <LayersIcon size={16} />
                  </span>
                </div>
                <div className={styles.metricValue}>{total}</div>
                <div className={styles.metricSubtext}>Across all workflow stages</div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricHeader}>
                  <span className={styles.metricLabel}>Completed</span>
                  <span className={`${styles.metricIconWrapper} ${styles.doneIcon}`}>
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
                  <span className={`${styles.metricIconWrapper} ${styles.progIcon}`}>
                    <ClockIcon size={16} />
                  </span>
                </div>
                <div className={styles.metricValue}>{progCount}</div>
                <div className={styles.metricSubtext}>Currently active tasks</div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricHeader}>
                  <span className={styles.metricLabel}>To-Do</span>
                  <span className={`${styles.metricIconWrapper} ${styles.todoIcon}`}>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Completion Progress Card */}
                <div className={styles.bentoCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitleGroup}>
                      <CheckCircleIcon size={18} />
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
                      <FlagIcon size={18} />
                      <h2 className={styles.cardTitle}>Priority Breakdown</h2>
                    </div>
                    <span className={styles.cardBadge}>All Tasks</span>
                  </div>

                  <div className={styles.priorityGrid}>
                    <div className={`${styles.priorityItem} ${styles.prioUrgent}`}>
                      <div className={styles.priorityLabelGroup}>
                        <FlagIcon size={14} />
                        <span>Urgent</span>
                      </div>
                      <span className={styles.priorityCount}>{urgentCount}</span>
                    </div>

                    <div className={`${styles.priorityItem} ${styles.prioHigh}`}>
                      <div className={styles.priorityLabelGroup}>
                        <FlagIcon size={14} />
                        <span>High</span>
                      </div>
                      <span className={styles.priorityCount}>{highCount}</span>
                    </div>

                    <div className={`${styles.priorityItem} ${styles.prioMed}`}>
                      <div className={styles.priorityLabelGroup}>
                        <FlagIcon size={14} />
                        <span>Medium</span>
                      </div>
                      <span className={styles.priorityCount}>{medCount}</span>
                    </div>

                    <div className={`${styles.priorityItem} ${styles.prioLow}`}>
                      <div className={styles.priorityLabelGroup}>
                        <FlagIcon size={14} />
                        <span>Low</span>
                      </div>
                      <span className={styles.priorityCount}>{lowCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Needs Attention & Upcoming Deadlines */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Needs Attention (Overdue Tasks) */}
                <div className={styles.bentoCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitleGroup}>
                      <AlertCircleIcon size={18} />
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
                      <CheckCircleIcon size={24} style={{ color: 'var(--color-done)' }} />
                      <span className={styles.emptyStateTitle}>All deadlines on track</span>
                      <p className={styles.emptyStateText}>
                        You have no overdue tasks. Active tasks are progressing within scheduled dates.
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
                              <span>Stage: {t.status}</span>
                              <span>•</span>
                              <span>Priority: {t.priority || 'Medium'}</span>
                            </div>
                          </div>
                          <div className={styles.taskItemRight}>
                            <span className={styles.overdueTag}>
                              Due {formatDueDate(t.dueDate)}
                            </span>
                            <ArrowRightIcon size={14} />
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Upcoming Deadlines */}
                <div className={styles.bentoCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitleGroup}>
                      <CalendarIcon size={18} />
                      <h2 className={styles.cardTitle}>Upcoming Deadlines</h2>
                    </div>
                    <span className={styles.cardBadge}>Next Deadlines</span>
                  </div>

                  {upcomingTasks.length === 0 ? (
                    <div className={styles.emptyStateBox}>
                      <CalendarIcon size={24} style={{ color: 'var(--text-muted)' }} />
                      <span className={styles.emptyStateTitle}>No upcoming deadlines</span>
                      <p className={styles.emptyStateText}>
                        No pending tasks scheduled with future due dates. Assign due dates when creating or editing tasks.
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
                              <span>Stage: {t.status}</span>
                              <span>•</span>
                              <span>Priority: {t.priority || 'Medium'}</span>
                            </div>
                          </div>
                          <div className={styles.taskItemRight}>
                            <span className={styles.upcomingTag}>
                              {getDeadlineLabel(t.dueDate!)} ({formatDueDate(t.dueDate)})
                            </span>
                            <ArrowRightIcon size={14} />
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Section: Recent Tasks */}
            <section className={styles.bentoCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitleGroup}>
                  <LayersIcon size={18} />
                  <h2 className={styles.cardTitle}>Recent Tasks</h2>
                </div>
                <Link to="/" style={{ fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span>View All on Board</span>
                  <ArrowRightIcon size={14} />
                </Link>
              </div>

              {recentTasks.length === 0 ? (
                <div className={styles.emptyStateBox}>
                  <LayersIcon size={28} style={{ color: 'var(--text-muted)' }} />
                  <span className={styles.emptyStateTitle}>Your workspace is empty</span>
                  <p className={styles.emptyStateText}>
                    Create your first task to populate your workspace dashboard and Kanban board.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<PlusIcon size={16} />}
                    onClick={() => setIsModalOpen(true)}
                    style={{ marginTop: '8px' }}
                  >
                    Create First Task
                  </Button>
                </div>
              ) : (
                <div className={styles.recentTableWrapper}>
                  <table className={styles.recentTable}>
                    <thead>
                      <tr>
                        <th>Task</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Due Date</th>
                        <th>Last Updated</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTasks.map((t) => {
                        const statusClass =
                          t.status === 'Done'
                            ? styles.badgeDone
                            : t.status === 'In-Progress'
                            ? styles.badgeProg
                            : styles.badgeTodo;

                        return (
                          <tr key={t._id}>
                            <td>
                              <Link to="/" className={styles.tableTitleLink} title="Open in Board">
                                {t.title}
                              </Link>
                            </td>
                            <td>
                              <span className={`${styles.tableStatusBadge} ${statusClass}`}>
                                {t.status}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontSize: '12px', fontWeight: 500 }}>
                                {t.priority || 'Medium'}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontSize: '12px', color: checkIsOverdue(t.dueDate, t.status) ? 'var(--color-danger)' : 'inherit' }}>
                                {formatDueDate(t.dueDate)}
                              </span>
                            </td>
                            <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              {formatRelativeTime(t.updatedAt || t.createdAt)}
                            </td>
                            <td>
                              <Link to="/" className={styles.tableActionLink} title="View in Board">
                                <span>Board</span>
                                <ArrowRightIcon size={12} />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
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
