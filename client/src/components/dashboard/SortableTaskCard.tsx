import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, TaskStatus } from '../../types/task';
import { StickyTaskCard } from './StickyTaskCard';

interface SortableTaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: TaskStatus) => void;
  isSaving?: boolean;
}

export const SortableTaskCard: React.FC<SortableTaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  isSaving = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task._id,
    data: {
      type: 'Task',
      task,
      status: task.status,
    },
    disabled: isSaving,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : isSaving ? 0.75 : 1,
    cursor: isSaving ? 'wait' : 'grab',
    touchAction: 'none',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <StickyTaskCard
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
        isSaving={isSaving}
      />
    </div>
  );
};
