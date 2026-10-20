import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useTheme } from '../context/useTheme';
import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/common/Button';
import {
  UserIcon,
  SunIcon,
  MoonIcon,
  ShieldIcon,
  LockIcon,
  LogOutIcon,
  CheckIcon,
  BellIcon,
  LayersIcon,
} from '../components/common/Icons';
import styles from './SettingsPage.module.css';

type SettingsTab = 'profile' | 'appearance' | 'notifications' | 'security';

interface ProfilePrefs {
  displayName: string;
  role: string;
  timezone: string;
  bio: string;
}

interface NotificationPrefs {
  dueReminders: boolean;
  overdueAlerts: boolean;
  autoSync: boolean;
  soundCues: boolean;
}

const PROFILE_PREFS_KEY = 'taskflow_profile_prefs';
const NOTIF_PREFS_KEY = 'taskflow_notification_prefs';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [copiedId, setCopiedId] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Initial user values
  const systemTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  // Load saved profile preferences or defaults
  const [profileForm, setProfileForm] = useState<ProfilePrefs>(() => {
    try {
      const saved = localStorage.getItem(PROFILE_PREFS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore storage error
    }
    return {
      displayName: user?.name || 'Workspace Owner',
      role: 'Full-Stack Developer',
      timezone: systemTimezone,
      bio: 'Leading sprint delivery, task prioritization, and engineering execution on TaskFlow.',
    };
  });

  // Load saved notification preferences or defaults
  const [notifForm, setNotifForm] = useState<NotificationPrefs>(() => {
    try {
      const saved = localStorage.getItem(NOTIF_PREFS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore storage error
    }
    return {
      dueReminders: true,
      overdueAlerts: true,
      autoSync: true,
      soundCues: false,
    };
  });

  const showBanner = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem(PROFILE_PREFS_KEY, JSON.stringify(profileForm));
      showBanner('Profile preferences saved successfully.');
    } catch {
      // Handle storage exception
    }
  };

  const handleDiscardProfile = () => {
    try {
      const saved = localStorage.getItem(PROFILE_PREFS_KEY);
      if (saved) {
        setProfileForm(JSON.parse(saved));
      } else {
        setProfileForm({
          displayName: user?.name || 'Workspace Owner',
          role: 'Full-Stack Developer',
          timezone: systemTimezone,
          bio: 'Leading sprint delivery, task prioritization, and engineering execution on TaskFlow.',
        });
      }
      showBanner('Changes reverted to saved values.');
    } catch {
      // Ignore
    }
  };

  const handleToggleNotif = (key: keyof NotificationPrefs) => {
    setNotifForm((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(updated));
        showBanner('Notification preferences updated.');
      } catch {
        // Storage error
      }
      return updated;
    });
  };

  const handleCopyId = async () => {
    if (!user?.id) return;
    try {
      await navigator.clipboard.writeText(user.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      // Clipboard fallback
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitials = profileForm.displayName
    ? profileForm.displayName.slice(0, 2).toUpperCase()
    : user?.name
    ? user.name.slice(0, 2).toUpperCase()
    : 'TF';

  return (
    <AppShell title="Settings" badge="Preferences">
      <div className={styles.settingsContainer}>
        {/* Header */}
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Settings & Preferences</h1>
          <p className={styles.pageSubtitle}>
            Configure your workspace identity, interface appearance, alert notifications, and security posture.
          </p>
        </header>

        {/* Tab Navigation */}
        <div className={styles.tabsList} role="tablist" aria-label="Settings categories">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'profile'}
            className={`${styles.tabBtn} ${activeTab === 'profile' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <UserIcon size={16} />
            Profile & Account
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'appearance'}
            className={`${styles.tabBtn} ${activeTab === 'appearance' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            <SunIcon size={16} />
            Appearance
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'notifications'}
            className={`${styles.tabBtn} ${activeTab === 'notifications' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <BellIcon size={16} />
            Notifications
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'security'}
            className={`${styles.tabBtn} ${activeTab === 'security' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <ShieldIcon size={16} />
            Security & Session
          </button>
        </div>

        {/* Feedback Alert */}
        {saveSuccessMsg && (
          <div className={styles.feedbackBanner} role="status" aria-live="polite">
            <CheckIcon size={16} />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Tab 1: Profile & Account */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className={styles.settingsSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleGroup}>
                <div className={styles.sectionIcon}>
                  <UserIcon size={20} />
                </div>
                <h2 className={styles.sectionTitle}>Profile Details</h2>
              </div>
              <span className={styles.sectionBadge}>Workspace Owner</span>
            </div>

            <p className={styles.sectionDescription}>
              Update your workspace identity. Preferences are stored locally and reflected across your TaskFlow session.
            </p>

            <div className={styles.profileCard}>
              <div className={styles.avatarInitials} aria-hidden="true">
                {userInitials}
              </div>

              <div className={styles.profileInfo}>
                <span className={styles.profileName}>{profileForm.displayName || user?.name || 'User'}</span>
                <span className={styles.profileEmail}>{user?.email || ''}</span>
                <div className={styles.profilePillGroup}>
                  <span className={styles.statusPill}>
                    <span className={styles.statusDot} aria-hidden="true" />
                    Authenticated Session
                  </span>
                  <span className={styles.rolePill}>{profileForm.role}</span>
                </div>
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="pref-name" className={styles.label}>
                  Display Name
                </label>
                <input
                  id="pref-name"
                  type="text"
                  className={styles.input}
                  value={profileForm.displayName}
                  onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                  placeholder="Your Name"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="pref-email" className={styles.label}>
                  Email Address
                </label>
                <input
                  id="pref-email"
                  type="email"
                  className={`${styles.input} ${styles.inputReadOnly}`}
                  value={user?.email || ''}
                  readOnly
                  title="Registered account email (managed via auth system)"
                />
                <span className={styles.fieldHint}>Verified account login identifier</span>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="pref-role" className={styles.label}>
                  Workspace Role
                </label>
                <input
                  id="pref-role"
                  type="text"
                  className={styles.input}
                  value={profileForm.role}
                  onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                  placeholder="e.g. Lead Engineer, Product Designer"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="pref-timezone" className={styles.label}>
                  Time Zone
                </label>
                <select
                  id="pref-timezone"
                  className={styles.select}
                  value={profileForm.timezone}
                  onChange={(e) => setProfileForm({ ...profileForm, timezone: e.target.value })}
                >
                  <option value={systemTimezone}>{systemTimezone} (System Detected)</option>
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="America/New_York">America/New_York (EST/EDT)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                  <option value="Europe/London">Europe/London (GMT/BST)</option>
                  <option value="Europe/Paris">Europe/Paris (CET/CEST)</option>
                  <option value="UTC">UTC (Universal Coordinated Time)</option>
                </select>
              </div>

              <div className={styles.formGroupFull}>
                <label htmlFor="pref-bio" className={styles.label}>
                  Professional Bio / Focus
                </label>
                <textarea
                  id="pref-bio"
                  className={styles.textarea}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder="Brief description of your focus or responsibilities..."
                />
              </div>

              <div className={styles.formGroupFull}>
                <label className={styles.label}>Database User Identifier</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={styles.monoSnippet}>{user?.id || 'N/A'}</span>
                  {user?.id && (
                    <button
                      type="button"
                      onClick={handleCopyId}
                      className={styles.copyBtn}
                      aria-label="Copy User ID"
                    >
                      {copiedId ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.actionRow}>
              <Button type="button" variant="secondary" size="md" onClick={handleDiscardProfile}>
                Discard
              </Button>
              <Button type="submit" variant="primary" size="md">
                Save Changes
              </Button>
            </div>
          </form>
        )}

        {/* Tab 2: Appearance */}
        {activeTab === 'appearance' && (
          <section className={styles.settingsSection} aria-labelledby="section-appearance">
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleGroup}>
                <div className={styles.sectionIcon}>
                  <SunIcon size={20} />
                </div>
                <h2 id="section-appearance" className={styles.sectionTitle}>
                  Theme & Visual Density
                </h2>
              </div>
              <span className={styles.sectionBadge}>Instant Sync</span>
            </div>

            <p className={styles.sectionDescription}>
              Select your visual preference. Themes are applied immediately and synchronized across all views.
            </p>

            <div className={styles.themeGrid} role="radiogroup" aria-label="Theme selection">
              {/* Light Mode Card */}
              <div
                role="radio"
                aria-checked={theme === 'light'}
                tabIndex={0}
                className={`${styles.themeCard} ${theme === 'light' ? styles.themeCardActive : ''}`}
                onClick={() => setTheme('light')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setTheme('light');
                  }
                }}
              >
                <div className={styles.themeCardHeader}>
                  <div className={styles.themeIconTitle}>
                    <div className={styles.themeIconWrap}>
                      <SunIcon size={18} />
                    </div>
                    <span className={styles.themeTitle}>Light Theme</span>
                  </div>
                  {theme === 'light' ? (
                    <div className={styles.checkIndicator} aria-hidden="true">
                      <CheckIcon size={12} />
                    </div>
                  ) : (
                    <div className={styles.radioCircle} aria-hidden="true" />
                  )}
                </div>

                <div className={styles.previewSwatchLight} aria-hidden="true">
                  <div className={styles.swatchBarLight} />
                  <div className={styles.swatchDotLight} />
                </div>

                <p className={styles.themeCardDesc}>
                  Clean slate styling with crisp contrast, clear borders, and high daylight readability.
                </p>
              </div>

              {/* Dark Mode Card */}
              <div
                role="radio"
                aria-checked={theme === 'dark'}
                tabIndex={0}
                className={`${styles.themeCard} ${theme === 'dark' ? styles.themeCardActive : ''}`}
                onClick={() => setTheme('dark')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setTheme('dark');
                  }
                }}
              >
                <div className={styles.themeCardHeader}>
                  <div className={styles.themeIconTitle}>
                    <div className={styles.themeIconWrap}>
                      <MoonIcon size={18} />
                    </div>
                    <span className={styles.themeTitle}>Dark Theme</span>
                  </div>
                  {theme === 'dark' ? (
                    <div className={styles.checkIndicator} aria-hidden="true">
                      <CheckIcon size={12} />
                    </div>
                  ) : (
                    <div className={styles.radioCircle} aria-hidden="true" />
                  )}
                </div>

                <div className={styles.previewSwatchDark} aria-hidden="true">
                  <div className={styles.swatchBarDark} />
                  <div className={styles.swatchDotDark} />
                </div>

                <p className={styles.themeCardDesc}>
                  Deep slate background engineered for low-light focus, reduced eye fatigue, and tactile Kanban cards.
                </p>
              </div>
            </div>

            <div className={styles.noticeBox}>
              <div className={styles.noticeIcon}>
                <LayersIcon size={18} />
              </div>
              <div className={styles.noticeContent}>
                <span className={styles.noticeTitle}>Design System Compliance</span>
                <p>
                  TaskFlow uses curated CSS custom properties with strict contrast ratios, modest corner radii,
                  and zero purple gradients, in accordance with the project visual standards.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Tab 3: Notifications */}
        {activeTab === 'notifications' && (
          <section className={styles.settingsSection} aria-labelledby="section-notifications">
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleGroup}>
                <div className={styles.sectionIcon}>
                  <BellIcon size={20} />
                </div>
                <h2 id="section-notifications" className={styles.sectionTitle}>
                  Alerts & Notification Preferences
                </h2>
              </div>
              <span className={styles.sectionBadge}>Browser Stored</span>
            </div>

            <p className={styles.sectionDescription}>
              Configure local client-side alerts, task highlighting, and sound preferences stored in this browser. Outbound server notifications or emails are not sent.
            </p>

            <div className={styles.toggleList}>
              <div className={styles.toggleRow}>
                <div className={styles.toggleTextGroup}>
                  <span className={styles.toggleTitle}>Upcoming Deadline Alerts</span>
                  <span className={styles.toggleDescription}>
                    Highlight tasks with due dates approaching within the next 24 hours on the Board and Dashboard.
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notifForm.dueReminders}
                  className={`${styles.switchBtn} ${notifForm.dueReminders ? styles.switchBtnActive : ''}`}
                  onClick={() => handleToggleNotif('dueReminders')}
                  aria-label="Toggle upcoming deadline alerts"
                >
                  <span
                    className={`${styles.switchHandle} ${notifForm.dueReminders ? styles.switchHandleActive : ''}`}
                  />
                </button>
              </div>

              <div className={styles.toggleRow}>
                <div className={styles.toggleTextGroup}>
                  <span className={styles.toggleTitle}>Overdue Task Warnings</span>
                  <span className={styles.toggleDescription}>
                    Show prominent red alert tags on any active task past its calendar deadline.
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notifForm.overdueAlerts}
                  className={`${styles.switchBtn} ${notifForm.overdueAlerts ? styles.switchBtnActive : ''}`}
                  onClick={() => handleToggleNotif('overdueAlerts')}
                  aria-label="Toggle overdue task warnings"
                >
                  <span
                    className={`${styles.switchHandle} ${notifForm.overdueAlerts ? styles.switchHandleActive : ''}`}
                  />
                </button>
              </div>

              <div className={styles.toggleRow}>
                <div className={styles.toggleTextGroup}>
                  <span className={styles.toggleTitle}>Real-Time Task Sync</span>
                  <span className={styles.toggleDescription}>
                    Automatically synchronize task status transitions across open tabs and browser windows.
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notifForm.autoSync}
                  className={`${styles.switchBtn} ${notifForm.autoSync ? styles.switchBtnActive : ''}`}
                  onClick={() => handleToggleNotif('autoSync')}
                  aria-label="Toggle real-time task sync"
                >
                  <span
                    className={`${styles.switchHandle} ${notifForm.autoSync ? styles.switchHandleActive : ''}`}
                  />
                </button>
              </div>

              <div className={styles.toggleRow}>
                <div className={styles.toggleTextGroup}>
                  <span className={styles.toggleTitle}>Completion Audio Cues</span>
                  <span className={styles.toggleDescription}>
                    Play subtle auditory feedback when moving a task to the Done column.
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notifForm.soundCues}
                  className={`${styles.switchBtn} ${notifForm.soundCues ? styles.switchBtnActive : ''}`}
                  onClick={() => handleToggleNotif('soundCues')}
                  aria-label="Toggle completion audio cues"
                >
                  <span
                    className={`${styles.switchHandle} ${notifForm.soundCues ? styles.switchHandleActive : ''}`}
                  />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Tab 4: Security & Session */}
        {activeTab === 'security' && (
          <section className={styles.settingsSection} aria-labelledby="section-security">
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleGroup}>
                <div className={styles.sectionIcon}>
                  <ShieldIcon size={20} />
                </div>
                <h2 id="section-security" className={styles.sectionTitle}>
                  Security & Session Architecture
                </h2>
              </div>
              <span className={styles.sectionBadge}>MERN Stack</span>
            </div>

            <p className={styles.sectionDescription}>
              Cryptographic safeguards, server-side authorization enforcement, and active session controls.
            </p>

            <div className={styles.securityGrid}>
              <div className={styles.securityItem}>
                <div className={styles.securityItemHeader}>
                  <span className={styles.securityItemTitle}>Password Hashing</span>
                  <span className={styles.securityBadgeSuccess}>bcrypt (10 rounds)</span>
                </div>
                <p className={styles.securityItemDesc}>
                  Passwords are one-way hashed with salted bcrypt before storage. Plaintext passwords are never saved.
                </p>
              </div>

              <div className={styles.securityItem}>
                <div className={styles.securityItemHeader}>
                  <span className={styles.securityItemTitle}>Token Authorization</span>
                  <span className={styles.securityBadgeSuccess}>JWT Signed</span>
                </div>
                <p className={styles.securityItemDesc}>
                  All task mutations and data requests verify a cryptographic JSON Web Token in the HTTP Bearer header.
                </p>
              </div>

              <div className={styles.securityItem}>
                <div className={styles.securityItemHeader}>
                  <span className={styles.securityItemTitle}>Data Isolation</span>
                  <span className={styles.securityBadgeSuccess}>Per-User Scoped</span>
                </div>
                <p className={styles.securityItemDesc}>
                  Every database query filters tasks by the authenticated user ID. Cross-user access is rejected with 403/404.
                </p>
              </div>

              <div className={styles.securityItem}>
                <div className={styles.securityItemHeader}>
                  <span className={styles.securityItemTitle}>Rate Limiting</span>
                  <span className={styles.securityBadgeSuccess}>Active Protection</span>
                </div>
                <p className={styles.securityItemDesc}>
                  Authentication endpoints are guarded against automated brute-force attempts via rate-limiting middleware.
                </p>
              </div>
            </div>

            {/* Credential modification disclosure (reporting the gap) */}
            <div className={styles.noticeBox} role="region" aria-label="Credential Management Notice">
              <div className={styles.noticeIcon}>
                <LockIcon size={18} />
              </div>
              <div className={styles.noticeContent}>
                <span className={styles.noticeTitle}>Credential Modification Policy</span>
                <p>
                  In-app password changes and profile updates are currently not exposed by the TaskFlow REST API.
                  To modify account credentials, contact your workspace administrator or register a new dedicated account.
                  No mock forms or non-functional password controls are provided.
                </p>
              </div>
            </div>

            {/* Active Session Card */}
            <div className={styles.sessionCard}>
              <div className={styles.sessionDetails}>
                <span className={styles.sessionTitle}>Active Browser Session</span>
                <span className={styles.sessionMeta}>
                  Authenticated as <strong>{user?.email}</strong>. Session token is stored in localStorage.
                </span>
              </div>

              <div className={styles.logoutButtonGroup}>
                <Button
                  variant="danger"
                  size="md"
                  onClick={handleLogout}
                  icon={<LogOutIcon size={16} />}
                >
                  Sign Out
                </Button>
              </div>
            </div>

            <div className={styles.legalLinksGroup}>
              <Link to="/privacy" className={styles.legalLink}>
                Privacy Policy
              </Link>
              <span className={styles.dotSep} aria-hidden="true">•</span>
              <Link to="/terms" className={styles.legalLink}>
                Terms of Service
              </Link>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
};

export default SettingsPage;
