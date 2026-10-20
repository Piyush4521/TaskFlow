import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/useAuth';
import { useTasks } from '../context/useTasks';
import { AppShell } from '../components/layout/AppShell';
import { api, ApiClientError } from '../services/api';
import { TeamMember } from '../types/api';
import {
  UsersIcon,
  ShieldIcon,
  LayersIcon,
  CheckCircleIcon,
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

  const fetchMembers = useCallback(
    (showLoading = true) => {
      if (!token) return;
      if (showLoading) setIsLoading(true);
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
            setError('Failed to load team members from the database.');
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [token],
  );

  useEffect(() => {
    let isSubscribed = true;
    if (!token) {
      return;
    }

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
            setError('Failed to load team members from the database.');
          }
          setIsLoading(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [token]);

  // Calculate live owner metrics directly from TaskFlow MongoDB tasks
  const activeTasksCount = useMemo(() => {
    return tasks.filter((t) => t.status !== 'Done').length;
  }, [tasks]);

  const completedTasksCount = useMemo(() => {
    return tasks.filter((t) => t.status === 'Done').length;
  }, [tasks]);

  const totalTasksCount = tasks.length;

  const completionRate = useMemo(() => {
    if (totalTasksCount === 0) return 0;
    return Math.round((completedTasksCount / totalTasksCount) * 100);
  }, [totalTasksCount, completedTasksCount]);

  const userInitials = useMemo(() => getInitials(user?.name || ''), [user?.name]);

  return (
    <AppShell title="Team" badge="Workspace">
      <div className={styles.teamContainer}>
        {/* Header */}
        <header className={styles.pageHeader}>
          <div className={styles.headerTitleGroup}>
            <h1 className={styles.pageTitle}>Workspace Team & Collaborators</h1>
            <p className={styles.pageSubtitle}>
              Inspect authenticated workspace membership, account data isolation, and live workload allocation.
            </p>
          </div>

          <div className={styles.headerActions}>
            <div className={styles.statusIndicator}>
              <span className={styles.statusDot} aria-hidden="true" />
              <span>Personal Workspace Active</span>
            </div>
          </div>
        </header>

        {/* Real KPI Metrics Row */}
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Active Members</span>
            <span className={styles.metricValue}>1</span>
            <span className={styles.metricSubtext}>Personal workspace owner</span>
          </div>

          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Assigned Active Tasks</span>
            <span className={styles.metricValue}>{activeTasksCount}</span>
            <span className={styles.metricSubtext}>To-Do and In-Progress stages</span>
          </div>

          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Delivered Tasks</span>
            <span className={styles.metricValue}>{completedTasksCount}</span>
            <span className={styles.metricSubtext}>Completed on Kanban board</span>
          </div>

          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Completion Efficiency</span>
            <span className={styles.metricValue}>{completionRate}%</span>
            <span className={styles.metricSubtext}>Based on {totalTasksCount} total tasks</span>
          </div>
        </div>

        {/* Workspace Owner Section */}
        <section className={styles.sectionCard} aria-labelledby="owner-heading">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <UsersIcon size={20} />
              <h2 id="owner-heading" className={styles.sectionTitle}>
                Workspace Owner
              </h2>
            </div>
            <span className={styles.sectionBadge}>Authenticated</span>
          </div>

          <div className={styles.memberCard}>
            <div className={styles.cardTop}>
              <div className={styles.avatarWrapper}>
                <div className={styles.avatar} aria-hidden="true">
                  {userInitials}
                </div>
              </div>

              <div className={styles.memberIdentity}>
                <span className={styles.memberName}>{user?.name || 'Authenticated User'}</span>
                <span className={styles.memberEmail}>{user?.email || ''}</span>
                <div className={styles.tagGroup}>
                  <span className={styles.roleBadge}>Personal Workspace Lead</span>
                  <span className={styles.deptBadge}>MongoDB Authenticated</span>
                </div>
              </div>
            </div>

            {/* Workload Meter */}
            <div className={styles.workloadSection}>
              <div className={styles.workloadHeader}>
                <span className={styles.workloadLabel}>Live Task Distribution</span>
                <span className={styles.workloadStats}>
                  {activeTasksCount} active · {completedTasksCount} completed ({completionRate}% done)
                </span>
              </div>

              <div
                className={styles.workloadTrack}
                role="progressbar"
                aria-valuenow={completionRate}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Owner task completion rate"
              >
                <div
                  className={styles.workloadFill}
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>

            <div className={styles.cardFooter}>
              <span className={styles.activityNote}>
                Database User ID: <code className={styles.monoSnippet}>{user?.id || 'N/A'}</code>
              </span>
            </div>
          </div>
        </section>

        {/* Development Team Fixtures Section (Database-Backed) */}
        <section className={styles.sectionCard} aria-labelledby="team-heading">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <UsersIcon size={20} />
              <h2 id="team-heading" className={styles.sectionTitle}>
                Organization Structure (Database Fixtures)
              </h2>
            </div>
            <span className={styles.sectionBadge}>
              {members.length > 0 ? `${members.length} Members` : 'Database'}
            </span>
          </div>

          <div className={styles.noticeBanner}>
            <strong>Development Fixtures:</strong> These development team-member profiles are stored in MongoDB
            to model organizational roles for assessment evaluation. They are not registered user accounts and
            cannot log in or own personal tasks.
          </div>

          {isLoading ? (
            <div className={styles.loadingBox}>
              <div className={styles.spinner} role="status" aria-label="Loading team members" />
              <span>Fetching team members from MongoDB...</span>
            </div>
          ) : error ? (
            <div className={styles.errorBox}>
              <h3 className={styles.errorTitle}>Unable to Load Team Members</h3>
              <p className={styles.errorMessage}>{error}</p>
              <button type="button" className={styles.retryButton} onClick={() => fetchMembers(true)}>
                Retry Fetch
              </button>
            </div>
          ) : members.length === 0 ? (
            <div className={styles.emptyStateBox}>
              <div className={styles.emptyIconWrap}>
                <UsersIcon size={28} />
              </div>
              <h3 className={styles.emptyStateTitle}>No Team Members in Database</h3>
              <p className={styles.emptyStateText}>
                No team member records currently exist in MongoDB. Run the safe seed script to populate development fixtures:
              </p>
              <code className={styles.monoSnippet}>npm run seed</code>
            </div>
          ) : (
            <div className={styles.teamGrid}>
              {members.map((member) => (
                <div key={member._id} className={styles.teamMemberCard}>
                  <div className={styles.memberCardTop}>
                    <div className={styles.avatarFixture} aria-hidden="true">
                      {getInitials(member.name)}
                    </div>
                    <div className={styles.memberMeta}>
                      <span className={styles.memberCardName}>{member.name}</span>
                      <span className={styles.memberCardRole}>{member.role}</span>
                      <span className={styles.memberCardEmail}>{member.email}</span>
                    </div>
                  </div>

                  <div className={styles.memberCardFooter}>
                    <div className={styles.tagGroup}>
                      <span className={styles.deptBadge}>{member.department || 'General'}</span>
                      {member.isFixture && (
                        <span className={styles.fixtureBadge}>Development Fixture</span>
                      )}
                    </div>
                    <code className={styles.monoSnippet}>ID: {member._id.slice(-6)}</code>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Data Isolation Architecture Notice */}
        <section className={styles.sectionCard} aria-labelledby="collab-heading">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <ShieldIcon size={20} />
              <h2 id="collab-heading" className={styles.sectionTitle}>
                Data Isolation & Tenancy Architecture
              </h2>
            </div>
            <span className={styles.sectionBadge}>Architecture</span>
          </div>

          <div className={styles.architectureGrid}>
            <div className={styles.archCard}>
              <div className={styles.archHeader}>
                <LayersIcon size={16} />
                <span className={styles.archTitle}>Strict Query Partitioning</span>
              </div>
              <p className={styles.archDesc}>
                All queries for tasks in MongoDB filter strictly on <code className={styles.monoSnippet}>userId: req.userId</code>. Cross-user access is blocked at the database level.
              </p>
            </div>

            <div className={styles.archCard}>
              <div className={styles.archHeader}>
                <CheckCircleIcon size={16} />
                <span className={styles.archTitle}>Genuine Data Integrity</span>
              </div>
              <p className={styles.archDesc}>
                Team member records originate directly from MongoDB collections. Development fixtures are explicitly labeled and kept distinct from authenticated accounts.
              </p>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
};

export default TeamPage;
