import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/useAuth';
import { useTasks } from '../context/useTasks';
import { AppShell } from '../components/layout/AppShell';
import { api, ApiClientError } from '../services/api';
import { TeamMember } from '../types/api';
import {
  UsersIcon,
  CheckCircleIcon,
  ClockIcon,
  LayersIcon,
  MailIcon,
  BriefcaseIcon,
} from '../components/common/Icons';
import styles from './TeamPage.module.css';

function getInitials(name: string): string {
  if (!name) return 'TF';
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const TeamPage: React.FC = () => {
  const { user, token } = useAuth();
  const { tasks } = useTasks();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(token));
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(() => {
    if (!token) return;
    setIsLoading(true);
    setError(null);

    api.team
      .list(token)
      .then((response) => {
        setMembers(response.data || []);
      })
      .catch((err) => {
        if (err instanceof ApiClientError) {
          setError(err.message);
        } else {
          setError('Failed to load team directory from the server.');
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [token]);

  useEffect(() => {
    let isSubscribed = true;
    if (!token) return;

    api.team
      .list(token)
      .then((response) => {
        if (isSubscribed) {
          setMembers(response.data || []);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isSubscribed) {
          if (err instanceof ApiClientError) {
            setError(err.message);
          } else {
            setError('Failed to load team directory.');
          }
          setIsLoading(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [token]);

  // Real owner metrics computed directly from authentic TaskFlow tasks
  const activeTasksCount = useMemo(() => tasks.filter((t) => t.status !== 'Done').length, [tasks]);
  const completedTasksCount = useMemo(() => tasks.filter((t) => t.status === 'Done').length, [tasks]);
  const totalTasksCount = tasks.length;
  const completionRate = useMemo(() => {
    if (totalTasksCount === 0) return 0;
    return Math.round((completedTasksCount / totalTasksCount) * 100);
  }, [totalTasksCount, completedTasksCount]);

  const userInitials = useMemo(() => getInitials(user?.name || ''), [user?.name]);

  return (
    <AppShell title="Team" badge="Workspace">
      <div className={styles.teamContainer}>
        {/* Header Banner */}
        <header className={styles.pageHeader}>
          <div className={styles.headerTitleGroup}>
            <h1 className={styles.pageTitle}>Workspace Team</h1>
            <p className={styles.pageSubtitle}>
              Collaborators and team directory associated with your TaskFlow workspace.
            </p>
          </div>

          <div className={styles.headerStatusBadge}>
            <span className={styles.statusDot} aria-hidden="true" />
            <span>Workspace Active</span>
          </div>
        </header>

        {/* Workspace Summary Metric Strip */}
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>Workspace Members</span>
              <span className={styles.metricIcon}>
                <UsersIcon size={16} />
              </span>
            </div>
            <div className={styles.metricValue}>1</div>
            <div className={styles.metricSubtext}>Authenticated Owner</div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>Active Workload</span>
              <span className={`${styles.metricIcon} ${styles.iconProgress}`}>
                <ClockIcon size={16} />
              </span>
            </div>
            <div className={styles.metricValue}>{activeTasksCount}</div>
            <div className={styles.metricSubtext}>Tasks in progress or to-do</div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>Completed Work</span>
              <span className={`${styles.metricIcon} ${styles.iconDone}`}>
                <CheckCircleIcon size={16} />
              </span>
            </div>
            <div className={styles.metricValue}>{completedTasksCount}</div>
            <div className={styles.metricSubtext}>Delivered on board</div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>Delivery Rate</span>
              <span className={styles.metricIcon}>
                <LayersIcon size={16} />
              </span>
            </div>
            <div className={styles.metricValue}>{completionRate}%</div>
            <div className={styles.metricSubtext}>Across {totalTasksCount} total tasks</div>
          </div>
        </div>

        {/* Workspace Owner Card */}
        <section className={styles.sectionCard} aria-labelledby="owner-title">
          <div className={styles.sectionHeader}>
            <h2 id="owner-title" className={styles.sectionTitle}>
              Workspace Owner
            </h2>
            <span className={styles.badgePrimary}>Authenticated</span>
          </div>

          <div className={styles.ownerBody}>
            <div className={styles.ownerInfoRow}>
              <div className={styles.ownerAvatar} aria-hidden="true">
                {userInitials}
              </div>
              <div className={styles.ownerMeta}>
                <span className={styles.ownerName}>{user?.name || 'Workspace Owner'}</span>
                <span className={styles.ownerEmail}>{user?.email || ''}</span>
                <div className={styles.tagGroup}>
                  <span className={styles.roleTag}>Lead / Admin</span>
                  <span className={styles.statusTag}>Active Session</span>
                </div>
              </div>
            </div>

            {/* Workload Progress Bar */}
            <div className={styles.workloadBox}>
              <div className={styles.workloadHeader}>
                <span className={styles.workloadLabel}>Personal Task Progress</span>
                <span className={styles.workloadStats}>
                  {completedTasksCount} of {totalTasksCount} tasks complete ({completionRate}%)
                </span>
              </div>
              <div
                className={styles.progressBarTrack}
                role="progressbar"
                aria-valuenow={completionRate}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Workspace owner completion progress"
              >
                <div
                  className={styles.progressBarFill}
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Team Members / Directory Section */}
        <section className={styles.sectionCard} aria-labelledby="directory-title">
          <div className={styles.sectionHeader}>
            <div>
              <h2 id="directory-title" className={styles.sectionTitle}>
                Team Directory
              </h2>
              <p className={styles.sectionSubtitle}>
                Registered collaborators and organizational contacts in your workspace database.
              </p>
            </div>
            {members.length > 0 && (
              <span className={styles.countChip}>{members.length} Members</span>
            )}
          </div>

          {isLoading ? (
            <div className={styles.loadingBox}>
              <div className={styles.spinner} role="status" aria-label="Loading directory" />
              <span>Loading team members...</span>
            </div>
          ) : error ? (
            <div className={styles.errorBox}>
              <p className={styles.errorMessage}>{error}</p>
              <button type="button" className={styles.retryButton} onClick={fetchMembers}>
                Retry
              </button>
            </div>
          ) : members.length === 0 ? (
            <div className={styles.emptyStateBox}>
              <div className={styles.emptyIconWrap}>
                <UsersIcon size={24} />
              </div>
              <h3 className={styles.emptyStateTitle}>No additional members found</h3>
              <p className={styles.emptyStateText}>
                No additional team members are currently listed in the database directory.
              </p>
            </div>
          ) : (
            <div className={styles.teamGrid}>
              {members.map((member) => (
                <div key={member._id} className={styles.memberCard}>
                  <div className={styles.memberHeader}>
                    <div className={styles.memberAvatar} aria-hidden="true">
                      {getInitials(member.name)}
                    </div>
                    <div className={styles.memberInfo}>
                      <span className={styles.memberName}>{member.name}</span>
                      <span className={styles.memberRole}>
                        <BriefcaseIcon size={12} />
                        <span>{member.role}</span>
                      </span>
                    </div>
                  </div>

                  <div className={styles.memberEmailRow}>
                    <MailIcon size={12} />
                    <span className={styles.memberEmailText}>{member.email}</span>
                  </div>

                  <div className={styles.memberFooter}>
                    <span className={styles.deptChip}>{member.department || 'General'}</span>
                    {member.isFixture && (
                      <span className={styles.directoryBadge}>Directory</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
};

export default TeamPage;
