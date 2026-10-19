import React, { useState, useEffect } from 'react';
import { Task, TaskStatus } from '../../types/task';
import { CloseIcon, AlertCircleIcon } from '../common/Icons';
import { Button } from '../common/Button';
import { ApiClientError } from '../../services/api';
import styles from './TaskModal.module.css';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: { title: string; description: string; status: TaskStatus }) => Promise<void> | void;
  initialTask?: Task | null;
  defaultStatus?: TaskStatus;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialTask,
  defaultStatus = 'To-Do',
}) => {
  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 id="task-modal-title" className={styles.modalTitle}>
            {initialTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close modal"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <TaskModalForm
          key={initialTask?._id || 'new'}
          initialTask={initialTask}
          defaultStatus={defaultStatus}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
};

interface TaskModalFormProps {
  initialTask?: Task | null;
  defaultStatus: TaskStatus;
  onClose: () => void;
  onSubmit: (taskData: { title: string; description: string; status: TaskStatus }) => Promise<void> | void;
}

const TaskModalForm: React.FC<TaskModalFormProps> = ({
  initialTask,
  defaultStatus,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [status, setStatus] = useState<TaskStatus>(initialTask?.status || defaultStatus);
  const [titleError, setTitleError] = useState('');
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setTitleError('Task title is required');
      return;
    }
    if (trimmedTitle.length < 2) {
      setTitleError('Task title must be at least 2 characters');
      return;
    }
    if (trimmedTitle.length > 120) {
      setTitleError('Task title cannot exceed 120 characters');
      return;
    }

    setIsSubmitting(true);
    setTitleError('');
    setServerError('');

    try {
      await onSubmit({
        title: trimmedTitle,
        description: description.trim(),
        status,
      });
      onClose();
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.fieldErrors?.title) {
          setTitleError(err.fieldErrors.title);
        } else {
          setServerError(err.message);
        }
      } else {
        setServerError('Failed to save task. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {serverError && (
        <div className={styles.errorNotice} role="alert">
          <AlertCircleIcon size={16} />
          <span>{serverError}</span>
        </div>
      )}

      <div className={styles.fieldGroup}>
        <label htmlFor="task-title" className={styles.label}>
          Title <span className={styles.requiredMark}>*</span>
        </label>
        <input
          id="task-title"
          type="text"
          className={`${styles.input} ${titleError ? styles.inputError : ''}`}
          placeholder="e.g. Design user registration flow"
          value={title}
          disabled={isSubmitting}
          onChange={(e) => {
            setTitle(e.target.value);
            if (titleError) setTitleError('');
          }}
          autoFocus
        />
        {titleError && <p className={styles.errorText}>{titleError}</p>}
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="task-description" className={styles.label}>
          Description <span className={styles.optionalMark}>(Optional)</span>
        </label>
        <textarea
          id="task-description"
          className={styles.textarea}
          placeholder="Provide context, acceptance criteria, or notes..."
          rows={3}
          value={description}
          disabled={isSubmitting}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="task-status" className={styles.label}>
          Workflow Stage
        </label>
        <select
          id="task-status"
          className={styles.select}
          value={status}
          disabled={isSubmitting}
          onChange={(e) => setStatus(e.target.value as TaskStatus)}
        >
          <option value="To-Do">To-Do</option>
          <option value="In-Progress">In-Progress</option>
          <option value="Done">Done</option>
        </select>
      </div>

      <div className={styles.actions}>
        <Button variant="secondary" size="md" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="primary" size="md" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialTask ? 'Save Changes' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};
