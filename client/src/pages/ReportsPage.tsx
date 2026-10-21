import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Task, TaskStatus, TaskPriority } from '../types/task';
import { useTasks } from '../context/useTasks';
import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/common/Button';
import {
  LayersIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertCircleIcon,
  FlagIcon,
  CalendarIcon,
  ArrowRightIcon,
  FilterIcon,
} from '../components/common/Icons';
import styles from './ReportsPage.module.css';

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

function getScheduleDistribution(tasks: Task[]): { dueSoonCount: number; dueLaterCount: number } {
  const now = new Date();
  const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const soon = tasks.filter((t) => {
    if (!t.dueDate || t.status === 'Done' || checkIsOverdue(t.dueDate, t.status)) return false;
    const due = new Date(t.dueDate);
    return due.getTime() <= next7Days.getTime();
  }).length;

  const later = tasks.filter((t) => {
    if (!t.dueDate || t.status === 'Done' || checkIsOverdue(t.dueDate, t.status)) return false;
    const due = new Date(t.dueDate);
    return due.getTime() > next7Days.getTime();
  }).length;

  return { dueSoonCount: soon, dueLaterCount: later };
}

export const ReportsPage: React.FC = () => {
  const { tasks, isLoading, errorMessage, reloadTasks } = useTasks();

  // Interactive Table Filter state
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | TaskStatus>('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<'all' | TaskPriority>('all');

  // Metrics computation from real authentic task records
  const totalCount = tasks.length;
  const todoCount = tasks.filter((t) => t.status === 'To-Do').length;
  const progCount = tasks.filter((t) => t.status === 'In-Progress').length;
  const doneCount = tasks.filter((t) => t.status === 'Done').length;

  const completionPct = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);
  const todoPct = totalCount === 0 ? 0 : Math.round((todoCount / totalCount) * 100);
  const progPct = totalCount === 0 ? 0 : Math.round((progCount / totalCount) * 100);
  const donePct = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  // Priority analytics
  const urgentCount = tasks.filter((t) => t.priority === 'Urgent').length;
  const highCount = tasks.filter((t) => t.priority === 'High').length;
  const medCount = tasks.filter((t) => t.priority === 'Medium' || !t.priority).length;
  const lowCount = tasks.filter((t) => t.priority === 'Low').length;

  const urgentPct = totalCount === 0 ? 0 : Math.round((urgentCount / totalCount) * 100);
  const highPct = totalCount === 0 ? 0 : Math.round((highCount / totalCount) * 100);
  const medPct = totalCount === 0 ? 0 : Math.round((medCount / totalCount) * 100);
  const lowPct = totalCount === 0 ? 0 : Math.round((lowCount / totalCount) * 100);

  // Deadline & Schedule Health
  const overdueCount = tasks.filter((t) => checkIsOverdue(t.dueDate, t.status)).length;
  const scheduledCount = tasks.filter((t) => Boolean(t.dueDate)).length;
  const unscheduledCount = totalCount - scheduledCount;

  const { dueSoonCount, dueLaterCount } = useMemo(() => getScheduleDistribution(tasks), [tasks]);

  // Filtered task modifications list
  const filteredRecentTasks = useMemo<Task[]>(() => {
    return tasks
      .filter((t) => {
        if (selectedStatusFilter !== 'all' && t.status !== selectedStatusFilter) return false;
        if (selectedPriorityFilter !== 'all' && (t.priority || 'Medium') !== selectedPriorityFilter)
          return false;
        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      })
      .slice(0, 10);
  }, [tasks, selectedStatusFilter, selectedPriorityFilter]);

  return (
    <AppShell title="Reports" badge="Analytics">
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

        {/* Page Header */}
        <header className={styles.pageHeader}>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>Reports & Analytics</h1>
            <p className={styles.subtitle}>
              Real-time progress, workload distribution, and deadline health computed from your workspace tasks.
            </p>
          </div>

          <div className={styles.headerStatusBadge}>
            <span className={styles.statusDot} aria-hidden="true" />
            <span>Live Synced</span>
          </div>
        </header>

        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
            <span>Loading analytics...</span>
          </div>
        ) : (
          <>
            {/* Top KPI Metrics Grid */}
            <section className={styles.metricsGrid} aria-label="Task Analytics KPI Summary">
              <div className={styles.metricCard}>
                <div className={styles.metricHeader}>
                  <span className={styles.metricLabel}>Total Tasks</span>
                  <span className={styles.metricIcon}>
                    <LayersIcon size={16} />
                  </span>
                </div>
                <div className={styles.metricValue}>{totalCount}</div>
                <div className={styles.metricSubtext}>Across all columns</div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricHeader}>
                  <span className={styles.metricLabel}>Completion Rate</span>
                  <span className={`${styles.metricIcon} ${styles.iconDone}`}>
                    <CheckCircleIcon size={16} />
                  </span>
                </div>
                <div className={styles.metricValue}>{completionPct}%</div>
                <div className={styles.metricSubtext}>{doneCount} of {totalCount} completed</div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricHeader}>
                  <span className={styles.metricLabel}>In Progress</span>
                  <span className={`${styles.metricIcon} ${styles.iconProg}`}>
                    <ClockIcon size={16} />
                  </span>
                </div>
                <div className={styles.metricValue}>{progCount}</div>
                <div className={styles.metricSubtext}>Active in development</div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricHeader}>
                  <span className={styles.metricLabel}>Overdue Tasks</span>
                  <span className={`${styles.metricIcon} ${overdueCount > 0 ? styles.iconDanger : ''}`}>
                    <AlertCircleIcon size={16} />
                  </span>
                </div>
                <div className={`${styles.metricValue} ${overdueCount > 0 ? styles.valueDanger : ''}`}>
                  {overdueCount}
                </div>
                <div className={styles.metricSubtext}>
                  {overdueCount === 0 ? 'All deadlines on track' : 'Past scheduled deadline'}
                </div>
              </div>
            </section>

            {/* Middle Section: Workflow Breakdown, Priorities, and Schedule */}
            <div className={styles.analyticsGrid}>
              {/* Workflow Stages Distribution */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitleGroup}>
                    <LayersIcon size={16} />
                    <h2 className={styles.cardTitle}>Workflow Distribution</h2>
                  </div>
                  <span className={styles.cardBadge}>{totalCount} Tasks</span>
                </div>

                <div className={styles.distributionList}>
                  <div className={styles.distRow}>
                    <div className={styles.distLabel}>
                      <span className={`${styles.dot} ${styles.dotTodo}`} />
                      <span>To-Do</span>
                    </div>
                    <div className={styles.distValues}>
                      <span className={styles.distCount}>{todoCount}</span>
                      <span className={styles.distPercent}>{todoPct}%</span>
                    </div>
                  </div>

                  <div className={styles.distRow}>
                    <div className={styles.distLabel}>
                      <span className={`${styles.dot} ${styles.dotProg}`} />
                      <span>In-Progress</span>
                    </div>
                    <div className={styles.distValues}>
                      <span className={styles.distCount}>{progCount}</span>
                      <span className={styles.distPercent}>{progPct}%</span>
                    </div>
                  </div>

                  <div className={styles.distRow}>
                    <div className={styles.distLabel}>
                      <span className={`${styles.dot} ${styles.dotDone}`} />
                      <span>Done</span>
                    </div>
                    <div className={styles.distValues}>
                      <span className={styles.distCount}>{doneCount}</span>
                      <span className={styles.distPercent}>{donePct}%</span>
                    </div>
                  </div>
                </div>

                {totalCount > 0 && (
                  <div className={styles.segmentedBar} aria-hidden="true">
                    <div className={styles.segTodo} style={{ width: `${todoPct}%` }} title={`To-Do: ${todoCount}`} />
                    <div className={styles.segProg} style={{ width: `${progPct}%` }} title={`In-Progress: ${progCount}`} />
                    <div className={styles.segDone} style={{ width: `${donePct}%` }} title={`Done: ${doneCount}`} />
                  </div>
                )}
              </div>

              {/* Priority Breakdown */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitleGroup}>
                    <FlagIcon size={16} />
                    <h2 className={styles.cardTitle}>Priority Breakdown</h2>
                  </div>
                  <span className={styles.cardBadge}>Distribution</span>
                </div>

                <div className={styles.priorityGrid}>
                  <div className={`${styles.priorityTile} ${styles.prioUrgent}`}>
                    <div className={styles.priorityTileLabel}>
                      <FlagIcon size={12} />
                      <span>Urgent</span>
                    </div>
                    <div className={styles.priorityTileStats}>
                      <span className={styles.priorityTileCount}>{urgentCount}</span>
                      <span className={styles.priorityTilePct}>{urgentPct}%</span>
                    </div>
                  </div>

                  <div className={`${styles.priorityTile} ${styles.prioHigh}`}>
                    <div className={styles.priorityTileLabel}>
                      <FlagIcon size={12} />
                      <span>High</span>
                    </div>
                    <div className={styles.priorityTileStats}>
                      <span className={styles.priorityTileCount}>{highCount}</span>
                      <span className={styles.priorityTilePct}>{highPct}%</span>
                    </div>
                  </div>

                  <div className={`${styles.priorityTile} ${styles.prioMed}`}>
                    <div className={styles.priorityTileLabel}>
                      <FlagIcon size={12} />
                      <span>Medium</span>
                    </div>
                    <div className={styles.priorityTileStats}>
                      <span className={styles.priorityTileCount}>{medCount}</span>
                      <span className={styles.priorityTilePct}>{medPct}%</span>
                    </div>
                  </div>

                  <div className={`${styles.priorityTile} ${styles.prioLow}`}>
                    <div className={styles.priorityTileLabel}>
                      <FlagIcon size={12} />
                      <span>Low</span>
                    </div>
                    <div className={styles.priorityTileStats}>
                      <span className={styles.priorityTileCount}>{lowCount}</span>
                      <span className={styles.priorityTilePct}>{lowPct}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule & Deadline Health */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitleGroup}>
                    <CalendarIcon size={16} />
                    <h2 className={styles.cardTitle}>Deadline Health</h2>
                  </div>
                  <span className={styles.cardBadge}>
                    {scheduledCount} of {totalCount} Scheduled
                  </span>
                </div>

                <div className={styles.scheduleHealthGrid}>
                  <div className={styles.healthCell}>
                    <span className={styles.healthCellLabel}>Overdue</span>
                    <span className={`${styles.healthCellValue} ${overdueCount > 0 ? styles.valDanger : ''}`}>
                      {overdueCount}
                    </span>
                  </div>

                  <div className={styles.healthCell}>
                    <span className={styles.healthCellLabel}>Due This Week</span>
                    <span className={styles.healthCellValue}>{dueSoonCount}</span>
                  </div>

                  <div className={styles.healthCell}>
                    <span className={styles.healthCellLabel}>Due Later</span>
                    <span className={styles.healthCellValue}>{dueLaterCount}</span>
                  </div>

                  <div className={styles.healthCell}>
                    <span className={styles.healthCellLabel}>Unscheduled</span>
                    <span className={styles.healthCellValue}>{unscheduledCount}</span>
                  </div>
                </div>

                <div className={styles.scheduleSummaryNote}>
                  <span>
                    {totalCount > 0 ? Math.round((scheduledCount / totalCount) * 100) : 0}% of tasks have active calendar due dates.
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Section: Recent Task Activity Table with Interactive Filters */}
            <section className={styles.card}>
              <div className={styles.tableHeaderSection}>
                <div className={styles.cardTitleGroup}>
                  <ClockIcon size={16} />
                  <h2 className={styles.cardTitle}>Recent Task Activity</h2>
                  <span className={styles.countChip}>{filteredRecentTasks.length} shown</span>
                </div>

                {/* Filter Toolbar */}
                <div className={styles.tableFilters}>
                  <div className={styles.filterGroup}>
                    <FilterIcon size={13} className={styles.filterIcon} />
                    <select
                      className={styles.filterSelect}
                      value={selectedStatusFilter}
                      onChange={(e) => setSelectedStatusFilter(e.target.value as 'all' | TaskStatus)}
                      aria-label="Filter by Status"
                    >
                      <option value="all">All Statuses</option>
                      <option value="To-Do">To-Do</option>
                      <option value="In-Progress">In-Progress</option>
                      <option value="Done">Done</option>
                    </select>

                    <select
                      className={styles.filterSelect}
                      value={selectedPriorityFilter}
                      onChange={(e) => setSelectedPriorityFilter(e.target.value as 'all' | TaskPriority)}
                      aria-label="Filter by Priority"
                    >
                      <option value="all">All Priorities</option>
                      <option value="Urgent">Urgent</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  <Link to="/" className={styles.openBoardLink}>
                    <span>View Kanban Board</span>
                    <ArrowRightIcon size={13} />
                  </Link>
                </div>
              </div>

              {filteredRecentTasks.length === 0 ? (
                <div className={styles.emptyTableState}>
                  <p>No tasks match the selected filter criteria.</p>
                </div>
              ) : (
                <div className={styles.tableResponsive}>
                  <table className={styles.dataTable}>
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
                      {filteredRecentTasks.map((t) => {
                        const statusClass =
                          t.status === 'Done'
                            ? styles.badgeDone
                            : t.status === 'In-Progress'
                            ? styles.badgeProg
                            : styles.badgeTodo;

                        const isOverdue = checkIsOverdue(t.dueDate, t.status);

                        return (
                          <tr key={t._id}>
                            <td>
                              <Link to="/" className={styles.taskTitleLink}>
                                {t.title}
                              </Link>
                            </td>
                            <td>
                              <span className={`${styles.statusBadge} ${statusClass}`}>
                                {t.status}
                              </span>
                            </td>
                            <td>
                              <span className={styles.priorityText}>
                                {t.priority || 'Medium'}
                              </span>
                            </td>
                            <td>
                              <span className={`${styles.dueDateText} ${isOverdue ? styles.overdueText : ''}`}>
                                {formatDueDate(t.dueDate)}
                              </span>
                            </td>
                            <td className={styles.mutedText}>
                              {formatRelativeTime(t.updatedAt || t.createdAt)}
                            </td>
                            <td>
                              <Link to="/" className={styles.actionLink}>
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
    </AppShell>
  );
};

export default ReportsPage;
