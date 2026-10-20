import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Task, TaskStatus } from '../types/task';
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
  BarChartIcon,
  ArrowRightIcon,
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
  if (!dueDateStr) return 'No deadline';
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
  const navigate = useNavigate();

  // Metrics computation from real stored tasks
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

  // Recent 5 tasks sorted by updatedAt or createdAt descending
  const recentTasks = useMemo<Task[]>(() => {
    return [...tasks]
      .sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      })
      .slice(0, 5);
  }, [tasks]);

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

        {/* Hero Header */}
        <section className={styles.headerCard}>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>Task Reports & Analytics</h1>
            <p className={styles.subtitle}>
              Real-time distribution, workload balance, completion rates, and deadline health computed directly from your workspace tasks.
            </p>
          </div>

          <div className={styles.headerActions}>
            <Button
              variant="secondary"
              size="md"
              icon={<ArrowRightIcon size={16} />}
              onClick={() => navigate('/')}
            >
              Open Board
            </Button>
            <Button
              variant="subtle"
              size="md"
              onClick={() => navigate('/tasks')}
            >
              View My Tasks
            </Button>
          </div>
        </section>

        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
            <span>Loading workspace analytics...</span>
          </div>
        ) : totalCount === 0 ? (
          <div className={styles.emptyStateBox}>
            <BarChartIcon size={36} style={{ color: 'var(--text-muted)' }} />
            <h2 className={styles.emptyStateTitle}>No task records to report</h2>
            <p className={styles.emptyStateText}>
              Your workspace currently has no tasks. Once tasks are created across workflow stages, live distribution and health reports will appear here automatically.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/')}
              style={{ marginTop: '8px' }}
            >
              Go to Kanban Board
            </Button>
          </div>
        ) : (
          <>
            {/* KPI Summary Grid */}
            <section className={styles.kpiGrid} aria-label="Executive KPI overview">
              <div className={styles.kpiCard}>
                <div className={styles.kpiHeader}>
                  <span className={styles.kpiLabel}>Total Workload</span>
                  <span className={styles.kpiIconWrapper}>
                    <LayersIcon size={16} />
                  </span>
                </div>
                <div className={styles.kpiValue}>{totalCount}</div>
                <div className={styles.kpiSubtext}>Stored tasks in workspace</div>
              </div>

              <div className={styles.kpiCard}>
                <div className={styles.kpiHeader}>
                  <span className={styles.kpiLabel}>Completion Rate</span>
                  <span className={`${styles.kpiIconWrapper} ${styles.doneIcon}`}>
                    <CheckCircleIcon size={16} />
                  </span>
                </div>
                <div className={styles.kpiValue}>{completionPct}%</div>
                <div className={styles.kpiSubtext}>{doneCount} of {totalCount} tasks completed</div>
              </div>

              <div className={styles.kpiCard}>
                <div className={styles.kpiHeader}>
                  <span className={styles.kpiLabel}>Active Pipeline</span>
                  <span className={`${styles.kpiIconWrapper} ${styles.progIcon}`}>
                    <ClockIcon size={16} />
                  </span>
                </div>
                <div className={styles.kpiValue}>{progCount}</div>
                <div className={styles.kpiSubtext}>Currently in progress</div>
              </div>

              <div className={`${styles.kpiCard} ${overdueCount > 0 ? styles.kpiRiskCard : ''}`}>
                <div className={styles.kpiHeader}>
                  <span className={styles.kpiLabel}>Deadline Risk</span>
                  <span className={`${styles.kpiIconWrapper} ${styles.riskIcon}`}>
                    <AlertCircleIcon size={16} />
                  </span>
                </div>
                <div className={styles.kpiValue} style={{ color: overdueCount > 0 ? 'var(--color-danger)' : 'inherit' }}>
                  {overdueCount}
                </div>
                <div className={styles.kpiSubtext}>
                  {overdueCount === 0 ? 'Zero overdue tasks' : 'Tasks requiring attention'}
                </div>
              </div>
            </section>

            {/* Two-Column Analytics Grid */}
            <div className={styles.analyticsGrid}>
              {/* Chart 1: Workflow Stage Distribution */}
              <div className={styles.bentoCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitleGroup}>
                    <BarChartIcon size={18} />
                    <h2 className={styles.cardTitle}>Workflow Stage Distribution</h2>
                  </div>
                  <span className={styles.cardBadge}>By Status</span>
                </div>

                <div className={styles.chartContainer} aria-label="Task status distribution chart">
                  <div className={styles.barRow}>
                    <div className={styles.barLabelGroup}>
                      <span className={styles.barName}>
                        <span className={`${styles.statusIndicatorDot} ${styles.todoDot}`} />
                        <span>To-Do</span>
                      </span>
                      <div className={styles.barStats}>
                        <span className={styles.barCount}>{todoCount}</span>
                        <span className={styles.barPercent}>{todoPct}%</span>
                      </div>
                    </div>
                    <div
                      className={styles.barTrack}
                      role="progressbar"
                      aria-valuenow={todoPct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="To-Do proportion"
                    >
                      <div className={styles.barFillTodo} style={{ width: `${todoPct}%` }} />
                    </div>
                  </div>

                  <div className={styles.barRow}>
                    <div className={styles.barLabelGroup}>
                      <span className={styles.barName}>
                        <span className={`${styles.statusIndicatorDot} ${styles.progDot}`} />
                        <span>In-Progress</span>
                      </span>
                      <div className={styles.barStats}>
                        <span className={styles.barCount}>{progCount}</span>
                        <span className={styles.barPercent}>{progPct}%</span>
                      </div>
                    </div>
                    <div
                      className={styles.barTrack}
                      role="progressbar"
                      aria-valuenow={progPct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="In-Progress proportion"
                    >
                      <div className={styles.barFillProg} style={{ width: `${progPct}%` }} />
                    </div>
                  </div>

                  <div className={styles.barRow}>
                    <div className={styles.barLabelGroup}>
                      <span className={styles.barName}>
                        <span className={`${styles.statusIndicatorDot} ${styles.doneDot}`} />
                        <span>Done</span>
                      </span>
                      <div className={styles.barStats}>
                        <span className={styles.barCount}>{doneCount}</span>
                        <span className={styles.barPercent}>{donePct}%</span>
                      </div>
                    </div>
                    <div
                      className={styles.barTrack}
                      role="progressbar"
                      aria-valuenow={donePct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="Done proportion"
                    >
                      <div className={styles.barFillDone} style={{ width: `${donePct}%` }} />
                    </div>
                  </div>
                </div>

                <div className={styles.disclosureNotice}>
                  <ClockIcon size={14} />
                  <span>
                    Pipeline balance: {progCount} tasks active, {todoCount} waiting in backlog, and {doneCount} completed.
                  </span>
                </div>
              </div>

              {/* Chart 2: Priority Distribution */}
              <div className={styles.bentoCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitleGroup}>
                    <FlagIcon size={18} />
                    <h2 className={styles.cardTitle}>Priority Workload Breakdown</h2>
                  </div>
                  <span className={styles.cardBadge}>By Priority</span>
                </div>

                <div className={styles.chartContainer} aria-label="Task priority distribution chart">
                  <div className={styles.priorityMeterRow}>
                    <div className={styles.priorityHeader}>
                      <span className={`${styles.priorityLabel} ${styles.prioUrgent}`}>Urgent</span>
                      <div className={styles.barStats}>
                        <span className={styles.barCount}>{urgentCount}</span>
                        <span className={styles.barPercent}>{urgentPct}%</span>
                      </div>
                    </div>
                    <div
                      className={styles.barTrack}
                      role="progressbar"
                      aria-valuenow={urgentPct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="Urgent priority proportion"
                    >
                      <div className={styles.barFillUrgent} style={{ width: `${urgentPct}%` }} />
                    </div>
                  </div>

                  <div className={styles.priorityMeterRow}>
                    <div className={styles.priorityHeader}>
                      <span className={`${styles.priorityLabel} ${styles.prioHigh}`}>High</span>
                      <div className={styles.barStats}>
                        <span className={styles.barCount}>{highCount}</span>
                        <span className={styles.barPercent}>{highPct}%</span>
                      </div>
                    </div>
                    <div
                      className={styles.barTrack}
                      role="progressbar"
                      aria-valuenow={highPct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="High priority proportion"
                    >
                      <div className={styles.barFillHigh} style={{ width: `${highPct}%` }} />
                    </div>
                  </div>

                  <div className={styles.priorityMeterRow}>
                    <div className={styles.priorityHeader}>
                      <span className={`${styles.priorityLabel} ${styles.prioMed}`}>Medium</span>
                      <div className={styles.barStats}>
                        <span className={styles.barCount}>{medCount}</span>
                        <span className={styles.barPercent}>{medPct}%</span>
                      </div>
                    </div>
                    <div
                      className={styles.barTrack}
                      role="progressbar"
                      aria-valuenow={medPct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="Medium priority proportion"
                    >
                      <div className={styles.barFillMed} style={{ width: `${medPct}%` }} />
                    </div>
                  </div>

                  <div className={styles.priorityMeterRow}>
                    <div className={styles.priorityHeader}>
                      <span className={`${styles.priorityLabel} ${styles.prioLow}`}>Low</span>
                      <div className={styles.barStats}>
                        <span className={styles.barCount}>{lowCount}</span>
                        <span className={styles.barPercent}>{lowPct}%</span>
                      </div>
                    </div>
                    <div
                      className={styles.barTrack}
                      role="progressbar"
                      aria-valuenow={lowPct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="Low priority proportion"
                    >
                      <div className={styles.barFillLow} style={{ width: `${lowPct}%` }} />
                    </div>
                  </div>
                </div>

                <div className={styles.disclosureNotice}>
                  <FlagIcon size={14} />
                  <span>
                    {urgentCount + highCount > 0
                      ? `${urgentCount + highCount} tasks flagged Urgent or High priority.`
                      : 'No critical or urgent tasks currently pending.'}
                  </span>
                </div>
              </div>
            </div>

            {/* Midsection: Schedule Health & Scope Coverage */}
            <div className={styles.analyticsGrid}>
              {/* Schedule Health Card */}
              <div className={styles.bentoCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitleGroup}>
                    <CalendarIcon size={18} />
                    <h2 className={styles.cardTitle}>Schedule & Deadline Health</h2>
                  </div>
                  <span className={styles.cardBadge}>Deadlines</span>
                </div>

                <div className={styles.healthGrid}>
                  <div className={styles.healthItem}>
                    <span className={styles.healthItemLabel}>Overdue Tasks</span>
                    <span className={styles.healthItemValue} style={{ color: overdueCount > 0 ? 'var(--color-danger)' : 'inherit' }}>
                      {overdueCount}
                    </span>
                  </div>

                  <div className={styles.healthItem}>
                    <span className={styles.healthItemLabel}>Due in Next 7 Days</span>
                    <span className={styles.healthItemValue}>{dueSoonCount}</span>
                  </div>

                  <div className={styles.healthItem}>
                    <span className={styles.healthItemLabel}>Due Later</span>
                    <span className={styles.healthItemValue}>{dueLaterCount}</span>
                  </div>

                  <div className={styles.healthItem}>
                    <span className={styles.healthItemLabel}>Completed</span>
                    <span className={styles.healthItemValue}>{doneCount}</span>
                  </div>
                </div>

                {scheduledCount > 0 && (
                  <div className={styles.segmentedStrip} aria-hidden="true">
                    <div
                      className={styles.segmentOverdue}
                      style={{ width: `${(overdueCount / totalCount) * 100}%` }}
                      title={`${overdueCount} overdue`}
                    />
                    <div
                      className={styles.segmentSoon}
                      style={{ width: `${(dueSoonCount / totalCount) * 100}%` }}
                      title={`${dueSoonCount} due soon`}
                    />
                    <div
                      className={styles.segmentLater}
                      style={{ width: `${(dueLaterCount / totalCount) * 100}%` }}
                      title={`${dueLaterCount} due later`}
                    />
                    <div
                      className={styles.segmentDone}
                      style={{ width: `${(doneCount / totalCount) * 100}%` }}
                      title={`${doneCount} completed`}
                    />
                  </div>
                )}

                <div className={styles.disclosureNotice}>
                  <CalendarIcon size={14} />
                  <span>
                    {scheduledCount} of {totalCount} tasks have assigned due dates ({unscheduledCount} unscheduled, {totalCount > 0 ? Math.round((scheduledCount / totalCount) * 100) : 0}% deadline coverage).
                  </span>
                </div>
              </div>

              {/* Data Transparency & Scope Notice Card */}
              <div className={styles.bentoCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitleGroup}>
                    <LayersIcon size={18} />
                    <h2 className={styles.cardTitle}>Analytics Methodology</h2>
                  </div>
                  <span className={styles.cardBadge}>Real Data</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  <p>
                    All analytics shown on this page are calculated directly from active task documents stored in your MongoDB database under your authenticated user session.
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <li>
                      <strong>Workload & Stages:</strong> Reflect current status assignment across To-Do, In-Progress, and Done.
                    </li>
                    <li>
                      <strong>Priorities:</strong> Derived from explicitly assigned Low, Medium, High, or Urgent priority values.
                    </li>
                    <li>
                      <strong>Deadlines:</strong> Based on calendar date comparisons against today's local midnight.
                    </li>
                    <li>
                      <strong>Integrity:</strong> No fabricated velocity forecasts, simulated charts, or artificial productivity metrics are presented.
                    </li>
                  </ul>
                </div>

                <div className={styles.disclosureNotice}>
                  <CheckCircleIcon size={14} style={{ color: 'var(--color-done)' }} />
                  <span>Synchronized live across Board, Dashboard, My Tasks, and Calendar.</span>
                </div>
              </div>
            </div>

            {/* Bottom Section: Recent Task Modifications */}
            <section className={styles.bentoCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitleGroup}>
                  <ClockIcon size={18} />
                  <h2 className={styles.cardTitle}>Recent Task Modifications</h2>
                </div>
                <Link to="/" style={{ fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span>View on Board</span>
                  <ArrowRightIcon size={14} />
                </Link>
              </div>

              <div className={styles.recentTableWrapper}>
                <table className={styles.recentTable}>
                  <thead>
                    <tr>
                      <th>Task</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Due Date</th>
                      <th>Last Modified</th>
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
                            <Link to="/" className={styles.tableTitleLink} title="Open on Board">
                              {t.title}
                            </Link>
                          </td>
                          <td>
                            <span className={`${styles.statusBadge} ${statusClass}`}>
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
                            <Link
                              to="/"
                              style={{
                                fontSize: '12px',
                                fontWeight: 500,
                                color: 'var(--color-primary)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                textDecoration: 'none',
                              }}
                            >
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
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
};
