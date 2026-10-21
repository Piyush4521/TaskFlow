import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Task, TaskStatus } from '../../types/task';
import { KanbanColumn } from './KanbanColumn';
import { StickyTaskCard } from './StickyTaskCard';
import styles from './KanbanBoard.module.css';

interface KanbanBoardProps {
  tasks: Task[];
  savingTaskIds?: Set<string>;
  onAddTask: (status?: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onStatusChange: (id: string, newStatus: TaskStatus) => void;
  onTaskMove: (id: string, newStatus: TaskStatus) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  savingTaskIds,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onTaskMove,
}) => {
  const [activeMobileColumn, setActiveMobileColumn] = useState<TaskStatus>('To-Do');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const todoTasks = tasks.filter((t) => t.status === 'To-Do');
  const progTasks = tasks.filter((t) => t.status === 'In-Progress');
  const doneTasks = tasks.filter((t) => t.status === 'Done');

  const columns: { status: TaskStatus; title: string; tasks: Task[] }[] = [
    { status: 'To-Do', title: 'To-Do', tasks: todoTasks },
    { status: 'In-Progress', title: 'In-Progress', tasks: progTasks },
    { status: 'Done', title: 'Done', tasks: doneTasks },
  ];

  const activeTask = activeTaskId ? tasks.find((t) => t._id === activeTaskId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTaskId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTaskId(null);

    if (!over) return;

    const draggedTaskId = String(active.id);
    const draggedTask = tasks.find((t) => t._id === draggedTaskId);
    if (!draggedTask) return;

    let targetStatus: TaskStatus | null = null;

    if (over.data.current?.status) {
      targetStatus = over.data.current.status as TaskStatus;
    } else if (['To-Do', 'In-Progress', 'Done'].includes(String(over.id))) {
      targetStatus = String(over.id) as TaskStatus;
    } else {
      const overTask = tasks.find((t) => t._id === String(over.id));
      if (overTask) {
        targetStatus = overTask.status;
      }
    }

    if (targetStatus && targetStatus !== draggedTask.status) {
      onTaskMove(draggedTaskId, targetStatus);
    }
  };

  const handleDragCancel = () => {
    setActiveTaskId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className={styles.boardContainer}>
        {/* Mobile Segmented Column Navigator */}
        <nav className={styles.mobileColumnNav} aria-label="Kanban Columns">
          {columns.map((col) => {
            const isActive = activeMobileColumn === col.status;
            return (
              <button
                key={col.status}
                type="button"
                className={`${styles.mobileTab} ${isActive ? styles.activeTab : ''}`}
                onClick={() => setActiveMobileColumn(col.status)}
                aria-selected={isActive}
                role="tab"
              >
                <span className={styles.tabTitle}>{col.title}</span>
                <span className={styles.tabBadge}>{col.tasks.length}</span>
              </button>
            );
          })}
        </nav>

        {/* Kanban Grid */}
        <div className={styles.boardGrid}>
          {columns.map((col) => {
            const isMobileVisible = activeMobileColumn === col.status;
            return (
              <div
                key={col.status}
                className={`${styles.columnWrapper} ${isMobileVisible ? styles.mobileVisible : styles.mobileHidden}`}
              >
                <KanbanColumn
                  status={col.status}
                  title={col.title}
                  tasks={col.tasks}
                  savingTaskIds={savingTaskIds}
                  onAddTask={onAddTask}
                  onEditTask={onEditTask}
                  onDeleteTask={onDeleteTask}
                  onStatusChange={onStatusChange}
                />
              </div>
            );
          })}
        </div>
      </div>

      <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
        {activeTask ? <StickyTaskCard task={activeTask} isDragOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
};
