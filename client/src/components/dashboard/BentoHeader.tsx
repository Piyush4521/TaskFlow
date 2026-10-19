import React from 'react';
import { Task } from '../../types/task';
import { PlusIcon, LayersIcon, ClockIcon, CheckCircleIcon } from '../common/Icons';
import { Button } from '../common/Button';
import styles from './BentoHeader.module.css';

interface BentoHeaderProps {
  tasks: Task[];
  onOpenCreateModal: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const BentoHeader: React.FC<BentoHeaderProps> = ({
  tasks,
  onOpenCreateModal,
  searchQuery,
  onSearchChange,
}) => {
  const todoCount = tasks.filter((t) => t.status === 'To-Do').length;
  const progressCount = tasks.filter((t) => t.status === 'In-Progress').length;
  const doneCount = tasks.filter((t) => t.status === 'Done').length;

  return (
    <section className={styles.bentoSection}>
      {/* Top Banner Card */}
      <div className={styles.mainCard}>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>Workspace Kanban</h1>
          <p className={styles.subtitle}>
            Organize, track, and complete your tasks across three dedicated workflow stages.
          </p>
        </div>

        <div className={styles.primaryActionWrapper}>
          <Button
            variant="primary"
            size="md"
            icon={<PlusIcon size={18} />}
            onClick={onOpenCreateModal}
          >
            New Task
          </Button>
        </div>
      </div>

      {/* Bento Metric Insights Zone */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Total Tasks</span>
            <span className={styles.totalIconWrapper}>
              <LayersIcon size={16} />
            </span>
          </div>
          <div className={styles.metricValue}>{tasks.length}</div>
        </div>

        <div className={`${styles.metricCard} ${styles.todoMetric}`}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>To-Do</span>
            <span className={styles.todoIconWrapper}>
              <LayersIcon size={16} />
            </span>
          </div>
          <div className={styles.metricValue}>{todoCount}</div>
        </div>

        <div className={`${styles.metricCard} ${styles.progMetric}`}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>In-Progress</span>
            <span className={styles.progIconWrapper}>
              <ClockIcon size={16} />
            </span>
          </div>
          <div className={styles.metricValue}>{progressCount}</div>
        </div>

        <div className={`${styles.metricCard} ${styles.doneMetric}`}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Completed</span>
            <span className={styles.doneIconWrapper}>
              <CheckCircleIcon size={16} />
            </span>
          </div>
          <div className={styles.metricValue}>{doneCount}</div>
        </div>
      </div>

      {/* Toolbar / Search Filter */}
      <div className={styles.toolbarCard}>
        <div className={styles.searchWrapper}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search tasks by title or details..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search tasks"
          />
          {searchQuery && (
            <button
              type="button"
              className={styles.clearSearchBtn}
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
