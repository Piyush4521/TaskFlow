import React from 'react';
import { Task, TaskStatus } from '../../types/task';
import { EditIcon, TrashIcon, CheckIcon, ArrowRightIcon } from '../common/Icons';
import styles from './StickyTaskCard.module.css';

interface StickyTaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, newStatus: TaskStatus) => void;
  isSaving?: boolean;
  isDragOverlay?: boolean;
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
      className={`${styles.card} ${statusClassName} ${isDragOverlay ? styles.dragOverlay : ''}`}
    >
      <div className={styles.tape} aria-hidden="true" />

      <div className={styles.cardHeader}>
        <div className={styles.statusGroup}>
          <span className={styles.statusPill}>{task.status}</span>
          {isSaving && <span className={styles.savingBadge}>Saving...</span>}
        </div>

        {!isDragOverlay && onEdit && onDelete && (
          <div className={styles.cardActions} onPointerDown={(e) => e.stopPropagation()}>
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

      {!isDragOverlay && onStatusChange && (
        <div className={styles.cardFooter} onPointerDown={(e) => e.stopPropagation()}>
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
