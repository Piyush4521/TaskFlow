import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, TaskStatus } from '../../types/task';
import { SortableTaskCard } from './SortableTaskCard';
import { ColumnEmptyState } from './ColumnEmptyState';
import { PlusIcon } from '../common/Icons';
import styles from './KanbanColumn.module.css';

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  savingTaskIds?: Set<string>;
  onAddTask: (status?: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onStatusChange: (id: string, newStatus: TaskStatus) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  title,
  tasks,
  savingTaskIds,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onStatusChange,
}) => {
  const statusKey = status.toLowerCase().replace('-', '');
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: 'Column',
      status,
    },
  });

  return (
    <section
      ref={setNodeRef}
      className={`${styles.column} ${styles[statusKey]} ${isOver ? styles.columnOver : ''}`}
      aria-label={`${title} Column`}
    >
      <header className={styles.columnHeader}>
        <div className={styles.titleGroup}>
          <span className={styles.indicatorDot} aria-hidden="true" />
          <h2 className={styles.columnTitle}>{title}</h2>
          <span className={styles.countBadge} aria-label={`${tasks.length} tasks in ${title}`}>
            {tasks.length}
          </span>
        </div>

        <button
          type="button"
          className={styles.quickAddBtn}
          onClick={() => onAddTask(status)}
          aria-label={`Add task to ${title}`}
          title={`Add task to ${title}`}
        >
          <PlusIcon size={16} />
        </button>
      </header>

      <div className={styles.cardsList}>
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <ColumnEmptyState status={status} onAddTask={() => onAddTask(status)} />
          ) : (
            tasks.map((task) => (
              <SortableTaskCard
                key={task._id}
                task={task}
                isSaving={savingTaskIds?.has(task._id)}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onStatusChange={onStatusChange}
              />
            ))
          )}
        </SortableContext>
      </div>
    </section>
  );
};
