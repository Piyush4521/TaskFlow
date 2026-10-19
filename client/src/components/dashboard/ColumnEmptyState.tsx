import React from 'react';
import { TaskStatus } from '../../types/task';
import { ClockIcon, LayersIcon, CheckCircleIcon } from '../common/Icons';
import styles from './ColumnEmptyState.module.css';

interface ColumnEmptyStateProps {
  status: TaskStatus;
  onAddTask?: () => void;
}

export const ColumnEmptyState: React.FC<ColumnEmptyStateProps> = ({ status, onAddTask }) => {
  const getContent = () => {
    switch (status) {
      case 'To-Do':
        return {
          icon: <LayersIcon size={24} />,
          title: 'No pending tasks',
          message: 'Add a new task to organize your upcoming work.',
          actionText: 'Add First Task',
        };
      case 'In-Progress':
        return {
          icon: <ClockIcon size={24} />,
          title: 'Nothing in progress',
          message: 'Move an active task here when you start working.',
          actionText: null,
        };
      case 'Done':
        return {
          icon: <CheckCircleIcon size={24} />,
          title: 'No completed tasks',
          message: 'Finished tasks will collect here as you complete work.',
          actionText: null,
        };
    }
  };

  const { icon, title, message, actionText } = getContent();

  return (
    <div className={styles.emptyContainer}>
      <div className={styles.iconCircle}>{icon}</div>
      <h4 className={styles.title}>{title}</h4>
      <p className={styles.message}>{message}</p>
      {actionText && onAddTask && (
        <button type="button" onClick={onAddTask} className={styles.emptyActionBtn}>
          {actionText}
        </button>
      )}
    </div>
  );
};
