import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/useAuth';
import { useTasks } from '../context/useTasks';
import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/common/Button';
import {
  UsersIcon,
  PlusIcon,
  CloseIcon,
  CheckIcon,
} from '../components/common/Icons';
import styles from './TeamPage.module.css';

type Department = 'all' | 'engineering' | 'design' | 'product' | 'management';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: 'engineering' | 'design' | 'product' | 'management';
  activeTasks: number;
  completedTasks: number;
  capacityPct: number;
  isOwner?: boolean;
  isCustom?: boolean;
}

const STORAGE_CUSTOM_MEMBERS_KEY = 'taskflow_team_members';

const INITIAL_COLLABORATORS: TeamMember[] = [
  {
    id: 'collab-1',
    name: 'Elena Rostova',
    email: 'elena.rostova@taskflow.dev',
    role: 'Staff Systems Engineer',
    department: 'engineering',
    activeTasks: 4,
    completedTasks: 12,
    capacityPct: 65,
  },
  {
    id: 'collab-2',
    name: 'Marcus Chen',
    email: 'marcus.chen@taskflow.dev',
    role: 'Senior Product Designer',
    department: 'design',
    activeTasks: 2,
    completedTasks: 9,
    capacityPct: 40,
  },
  {
    id: 'collab-3',
    name: 'Priya Sharma',
    email: 'priya.sharma@taskflow.dev',
    role: 'Frontend Architect',
    department: 'engineering',
    activeTasks: 5,
    completedTasks: 14,
    capacityPct: 80,
  },
  {
    id: 'collab-4',
    name: 'Alex Rivera',
    email: 'alex.rivera@taskflow.dev',
    role: 'Product Operations Lead',
    department: 'management',
    activeTasks: 3,
    completedTasks: 7,
    capacityPct: 50,
  },
];

export const TeamPage: React.FC = () => {
  const { user } = useAuth();
  const { tasks } = useTasks();

  const [activeDept, setActiveDept] = useState<Department>('all');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteDept, setInviteDept] = useState<'engineering' | 'design' | 'product' | 'management'>('engineering');
  const [inviteRole, setInviteRole] = useState('Software Engineer');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Load custom invited members from localStorage
  const [customMembers, setCustomMembers] = useState<TeamMember[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CUSTOM_MEMBERS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Calculate live owner metrics directly from TaskFlow tasks
  const ownerActiveCount = useMemo(() => {
    return tasks.filter((t) => t.status !== 'Done').length;
  }, [tasks]);

  const ownerDoneCount = useMemo(() => {
    return tasks.filter((t) => t.status === 'Done').length;
  }, [tasks]);

  const ownerCapacityPct = useMemo(() => {
    if (tasks.length === 0) return 0;
    // Normalized capacity based on a 10-active-task benchmark
    return Math.min(100, Math.round((ownerActiveCount / 10) * 100));
  }, [tasks.length, ownerActiveCount]);

  // Authenticated user as Workspace Lead
  const ownerMember: TeamMember = useMemo(() => {
    return {
      id: user?.id || 'owner-me',
      name: user?.name || 'Workspace Owner',
      email: user?.email || 'owner@taskflow.dev',
      role: 'Workspace Lead & Owner',
      department: 'engineering',
      activeTasks: ownerActiveCount,
      completedTasks: ownerDoneCount,
      capacityPct: ownerCapacityPct,
      isOwner: true,
    };
  }, [user, ownerActiveCount, ownerDoneCount, ownerCapacityPct]);

  const allMembers = useMemo(() => {
    return [ownerMember, ...INITIAL_COLLABORATORS, ...customMembers];
  }, [ownerMember, customMembers]);

  const filteredMembers = useMemo(() => {
    if (activeDept === 'all') return allMembers;
    return allMembers.filter((m) => m.department === activeDept);
  }, [allMembers, activeDept]);

  // Overall workspace stats
  const totalActiveTasks = useMemo(() => {
    return allMembers.reduce((sum, m) => sum + m.activeTasks, 0);
  }, [allMembers]);

  const totalCompletedTasks = useMemo(() => {
    return allMembers.reduce((sum, m) => sum + m.completedTasks, 0);
  }, [allMembers]);

  // Handle ESC key for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isInviteModalOpen) {
        setIsInviteModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInviteModalOpen]);

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    const newMember: TeamMember = {
      id: `custom-${Date.now()}`,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole.trim() || 'Team Member',
      department: inviteDept,
      activeTasks: 1,
      completedTasks: 0,
      capacityPct: 20,
      isCustom: true,
    };

    const updated = [...customMembers, newMember];
    setCustomMembers(updated);
    try {
      localStorage.setItem(STORAGE_CUSTOM_MEMBERS_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage exception
    }

    setInviteName('');
    setInviteEmail('');
    setIsInviteModalOpen(false);

    setFeedbackMsg(`Invitation sent to ${newMember.email} successfully.`);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleRemoveMember = (id: string) => {
    const updated = customMembers.filter((m) => m.id !== id);
    setCustomMembers(updated);
    try {
      localStorage.setItem(STORAGE_CUSTOM_MEMBERS_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  return (
    <AppShell title="Team" badge="Workspace">
      <div className={styles.teamContainer}>
        {/* Header */}
        <header className={styles.pageHeader}>
          <div className={styles.headerTitleGroup}>
            <h1 className={styles.pageTitle}>Workspace Team</h1>
            <p className={styles.pageSubtitle}>
              Collaborate across departments, monitor member workload capacity, and invite new contributors.
            </p>
          </div>

          <div className={styles.headerActions}>
            <div className={styles.statusIndicator}>
              <span className={styles.statusDot} aria-hidden="true" />
              <span>{allMembers.length} active in workspace</span>
            </div>

            <Button
              variant="primary"
              size="md"
              icon={<PlusIcon size={16} />}
              onClick={() => setIsInviteModalOpen(true)}
            >
              Invite Member
            </Button>
          </div>
        </header>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div className={styles.feedbackToast} role="status">
            <CheckIcon size={16} />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Top KPI Metrics Row */}
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Total Members</span>
            <span className={styles.metricValue}>{allMembers.length}</span>
            <span className={styles.metricSubtext}>Across 4 departments</span>
          </div>

          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>In-Progress Workload</span>
            <span className={styles.metricValue}>{totalActiveTasks}</span>
            <span className={styles.metricSubtext}>Active tasks across team</span>
          </div>

          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Completed Tasks</span>
            <span className={styles.metricValue}>{totalCompletedTasks}</span>
            <span className={styles.metricSubtext}>Total delivered work</span>
          </div>

          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Your Live Load</span>
            <span className={styles.metricValue}>{ownerCapacityPct}%</span>
            <span className={styles.metricSubtext}>
              {ownerActiveCount} active tasks on your board
            </span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className={styles.filterRow}>
          <div className={styles.filterTabs} role="tablist" aria-label="Department filters">
            {(['all', 'engineering', 'design', 'product', 'management'] as Department[]).map(
              (dept) => (
                <button
                  key={dept}
                  type="button"
                  role="tab"
                  aria-selected={activeDept === dept}
                  className={`${styles.filterTabBtn} ${activeDept === dept ? styles.filterTabBtnActive : ''}`}
                  onClick={() => setActiveDept(dept)}
                >
                  {dept.charAt(0).toUpperCase() + dept.slice(1)}
                </button>
              )
            )}
          </div>

          <span className={styles.memberCountNotice}>
            Showing {filteredMembers.length} of {allMembers.length} members
          </span>
        </div>

        {/* Team Grid */}
        <div className={styles.teamGrid}>
          {filteredMembers.map((member) => {
            const initials = member.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <div key={member.id} className={styles.memberCard}>
                <div className={styles.cardTop}>
                  <div className={styles.avatarWrapper}>
                    <div
                      className={`${styles.avatar} ${member.isOwner ? styles.avatarOwner : ''}`}
                      aria-hidden="true"
                    >
                      {initials}
                    </div>
                    <span className={styles.onlineBadge} title="Active" />
                  </div>

                  <div className={styles.memberIdentity}>
                    <span className={styles.memberName} title={member.name}>
                      {member.name}
                    </span>
                    <span className={styles.memberEmail} title={member.email}>
                      {member.email}
                    </span>
                    <div className={styles.tagGroup}>
                      <span className={styles.deptBadge}>{member.department}</span>
                      <span className={styles.roleBadge}>{member.role}</span>
                    </div>
                  </div>
                </div>

                {/* Workload Meter */}
                <div className={styles.workloadSection}>
                  <div className={styles.workloadHeader}>
                    <span className={styles.workloadLabel}>Workload Capacity</span>
                    <span className={styles.workloadStats}>
                      {member.activeTasks} active · {member.completedTasks} done
                    </span>
                  </div>

                  <div
                    className={styles.workloadTrack}
                    role="progressbar"
                    aria-valuenow={member.capacityPct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${member.name} workload capacity`}
                  >
                    <div
                      className={`${styles.workloadFill} ${member.capacityPct >= 75 ? styles.workloadFillHigh : ''}`}
                      style={{ width: `${member.capacityPct}%` }}
                    />
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.activityNote}>
                    {member.isOwner ? 'Live TaskFlow Data' : 'Collaborator'}
                  </span>
                  {member.isCustom && (
                    <button
                      type="button"
                      className={styles.removeMemberBtn}
                      onClick={() => handleRemoveMember(member.id)}
                      title="Remove invited member"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Invite Member Modal */}
        {isInviteModalOpen && (
          <div
            className={styles.modalBackdrop}
            onClick={() => setIsInviteModalOpen(false)}
            aria-hidden="true"
          >
            <div
              className={styles.modalDialog}
              role="dialog"
              aria-modal="true"
              aria-labelledby="invite-modal-title"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UsersIcon size={20} />
                  <h2 id="invite-modal-title" className={styles.modalTitle}>
                    Invite Team Member
                  </h2>
                </div>
                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={() => setIsInviteModalOpen(false)}
                  aria-label="Close invite modal"
                >
                  <CloseIcon size={18} />
                </button>
              </div>

              <form onSubmit={handleInviteSubmit} className={styles.modalForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="invite-name" className={styles.label}>
                    Full Name
                  </label>
                  <input
                    id="invite-name"
                    type="text"
                    className={styles.input}
                    placeholder="e.g. Jordan Lee"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="invite-email" className={styles.label}>
                    Work Email
                  </label>
                  <input
                    id="invite-email"
                    type="email"
                    className={styles.input}
                    placeholder="jordan.lee@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="invite-dept" className={styles.label}>
                    Department
                  </label>
                  <select
                    id="invite-dept"
                    className={styles.select}
                    value={inviteDept}
                    onChange={(e) => setInviteDept(e.target.value as any)}
                  >
                    <option value="engineering">Engineering</option>
                    <option value="design">Design</option>
                    <option value="product">Product</option>
                    <option value="management">Management</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="invite-role" className={styles.label}>
                    Workspace Role
                  </label>
                  <input
                    id="invite-role"
                    type="text"
                    className={styles.input}
                    placeholder="e.g. Frontend Engineer, Product Designer"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                  />
                </div>

                <div className={styles.modalActions}>
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={() => setIsInviteModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="md">
                    Send Invitation
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default TeamPage;
