import React from 'react';
import { Task, TaskStatus } from '../../types/task';
import {
  EditIcon,
  TrashIcon,
  CheckIcon,
  ArrowRightIcon,
  CalendarIcon,
  FlagIcon,
  AlertCircleIcon,
} from '../common/Icons';
import styles from './StickyTaskCard.module.css';

interface StickyTaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, newStatus: TaskStatus) => void;
  isSaving?: boolean;
  isDragOverlay?: boolean;
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

function formatDueDate(dueDateStr?: string | null): string | null {
  if (!dueDateStr) return null;
  const due = new Date(dueDateStr);
  if (isNaN(due.getTime())) return null;
  return due.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: due.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

export const StickyTaskCard: React.FC<StickyTaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  isSaving = false,
  isDragOverlay = false,
}) => {
  const statusClassName = styles[task.status.toLowerCase().replace('-', '')];
  const isOverdue = checkIsOverdue(task.dueDate, task.status);
  const formattedDueDate = formatDueDate(task.dueDate);

  const priority = task.priority || 'Medium';
  const priorityClass = styles[`priority${priority}`] || styles.priorityMedium;

  const getNextStatus = (): TaskStatus | null => {
    if (task.status === 'To-Do') return 'In-Progress';
    if (task.status === 'In-Progress') return 'Done';
    return null;
  };

  const getPrevStatus = (): TaskStatus | null => {
    if (task.status === 'Done') return 'In-Progress';
    if (task.status === 'In-Progress') return 'To-Do';
    return null;
  };

  const nextStatus = getNextStatus();
  const prevStatus = getPrevStatus();

  return (
    <article
      className={`${styles.card} ${statusClassName} ${isOverdue ? styles.overdueCard : ''} ${isDragOverlay ? styles.dragOverlay : ''}`}
    >
      <div className={styles.cardHeader}>
        <div className={styles.statusGroup}>
          <span className={styles.statusPill}>{task.status}</span>
          {isSaving && <span className={styles.savingBadge}>Saving...</span>}
        </div>

        {!isDragOverlay && onEdit && onDelete && (
          <div
            className={styles.cardActions}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => onEdit(task)}
              disabled={isSaving}
              title="Edit task"
              aria-label={`Edit task: ${task.title}`}
            >
              <EditIcon size={14} />
            </button>
            <button
              type="button"
              className={`${styles.iconBtn} ${styles.deleteBtn}`}
              onClick={() => onDelete(task._id)}
              disabled={isSaving}
              title="Delete task"
              aria-label={`Delete task: ${task.title}`}
            >
              <TrashIcon size={14} />
            </button>
          </div>
        )}
      </div>

      <h3 className={styles.title}>{task.title}</h3>

      {task.description && <p className={styles.description}>{task.description}</p>}

      <div className={styles.metaRow}>
        <span className={`${styles.priorityBadge} ${priorityClass}`}>
          <FlagIcon size={11} aria-hidden="true" />
          <span>{priority}</span>
        </span>

        {formattedDueDate && (
          <span
            className={`${styles.dueDateBadge} ${isOverdue ? styles.overdueBadge : ''}`}
            aria-label={isOverdue ? `Overdue, due on ${formattedDueDate}` : `Due on ${formattedDueDate}`}
            title={isOverdue ? `Overdue: deadline was ${formattedDueDate}` : `Due on ${formattedDueDate}`}
          >
            {isOverdue ? (
              <AlertCircleIcon size={12} aria-hidden="true" />
            ) : (
              <CalendarIcon size={12} aria-hidden="true" />
            )}
            <span>{isOverdue ? `Overdue: ${formattedDueDate}` : formattedDueDate}</span>
          </span>
        )}
      </div>

      {!isDragOverlay && onStatusChange && (
        <div
          className={styles.cardFooter}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className={styles.statusControls}>
            {prevStatus && (
              <button
                type="button"
                className={styles.statusShiftBtn}
                onClick={() => onStatusChange(task._id, prevStatus)}
                disabled={isSaving}
                title={`Move to ${prevStatus}`}
                aria-label={`Move ${task.title} back to ${prevStatus}`}
              >
                Move to {prevStatus}
              </button>
            )}

            {nextStatus && (
              <button
                type="button"
                className={`${styles.statusShiftBtn} ${styles.primaryShift}`}
                onClick={() => onStatusChange(task._id, nextStatus)}
                disabled={isSaving}
                title={`Move to ${nextStatus}`}
                aria-label={`Move ${task.title} forward to ${nextStatus}`}
              >
                <span>{nextStatus === 'Done' ? 'Mark Done' : 'Start'}</span>
                {nextStatus === 'Done' ? <CheckIcon size={12} /> : <ArrowRightIcon size={12} />}
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  );
};
