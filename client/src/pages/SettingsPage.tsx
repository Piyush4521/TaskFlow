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
  LogOutIcon,
  CheckIcon,
  BellIcon,
  CopyIcon,
} from '../components/common/Icons';
import styles from './SettingsPage.module.css';

type SettingsTab = 'general' | 'appearance' | 'preferences' | 'session';

interface PreferenceState {
  dueReminders: boolean;
  overdueAlerts: boolean;
  autoSync: boolean;
  soundCues: boolean;
}

const PREFS_STORAGE_KEY = 'taskflow_client_preferences';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [copiedId, setCopiedId] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Load browser-local preferences from localStorage
  const [prefs, setPrefs] = useState<PreferenceState>(() => {
    try {
      const saved = localStorage.getItem(PREFS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore storage errors
    }
    return {
      dueReminders: true,
      overdueAlerts: true,
      autoSync: true,
      soundCues: false,
    };
  });

  const showFeedback = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleTogglePref = (key: keyof PreferenceState) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(next));
        showFeedback('Preference updated');
      } catch {
        // Storage full/disabled
      }
      return next;
    });
  };

  const handleCopyId = async () => {
    if (!user?.id) return;
    try {
      await navigator.clipboard.writeText(user.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppShell title="Settings" badge="Workspace">
      <div className={styles.settingsContainer}>
        {/* Header */}
        <header className={styles.pageHeader}>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>Workspace Settings</h1>
            <p className={styles.subtitle}>
              Configure your workspace profile, display theme, browser preferences, and active session.
            </p>
          </div>
        </header>

        {saveSuccessMsg && (
          <div className={styles.toastNotification} role="status">
            <CheckIcon size={14} />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Settings Tab Navigation */}
        <nav className={styles.tabNav} aria-label="Settings Sections">
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'general' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('general')}
            aria-selected={activeTab === 'general'}
            role="tab"
          >
            <UserIcon size={15} />
            <span>General</span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'appearance' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('appearance')}
            aria-selected={activeTab === 'appearance'}
            role="tab"
          >
            <SunIcon size={15} />
            <span>Appearance</span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'preferences' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('preferences')}
            aria-selected={activeTab === 'preferences'}
            role="tab"
          >
            <BellIcon size={15} />
            <span>Preferences</span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'session' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('session')}
            aria-selected={activeTab === 'session'}
            role="tab"
          >
            <ShieldIcon size={15} />
            <span>Session & Security</span>
          </button>
        </nav>

        {/* Tab 1: General */}
        {activeTab === 'general' && (
          <section className={styles.card} aria-labelledby="general-heading">
            <div className={styles.cardHeader}>
              <div>
                <h2 id="general-heading" className={styles.cardTitle}>
                  User Profile & Account
                </h2>
                <p className={styles.cardSubtitle}>
                  Authenticated identity details registered in TaskFlow.
                </p>
              </div>
              <span className={styles.badgeSuccess}>Active Account</span>
            </div>

            <div className={styles.profileDetailsGrid}>
              <div className={styles.fieldGroup}>
                <span className={styles.fieldLabel}>Display Name</span>
                <span className={styles.fieldValue}>{user?.name || 'Workspace Owner'}</span>
              </div>

              <div className={styles.fieldGroup}>
                <span className={styles.fieldLabel}>Email Address</span>
                <span className={styles.fieldValue}>{user?.email || '—'}</span>
              </div>

              <div className={styles.fieldGroup}>
                <span className={styles.fieldLabel}>Workspace Role</span>
                <span className={styles.fieldValue}>Personal Workspace Lead</span>
              </div>

              <div className={styles.fieldGroup}>
                <span className={styles.fieldLabel}>Account Identifier</span>
                <div className={styles.idCopyRow}>
                  <code className={styles.monoSnippet}>{user?.id || 'N/A'}</code>
                  <button
                    type="button"
                    className={styles.copyBtn}
                    onClick={handleCopyId}
                    title="Copy user ID"
                    aria-label="Copy user ID"
                  >
                    {copiedId ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
                    <span>{copiedId ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.noticeCallout}>
              <span className={styles.noticeTitle}>Server-Side Authentication Notice</span>
              <p className={styles.noticeText}>
                Account credentials and email bindings are cryptographically managed by the TaskFlow REST API.
                In-app password changes and profile re-naming endpoints are intentionally unexposed by the assessment backend to prevent unverified mutations.
              </p>
            </div>
          </section>
        )}

        {/* Tab 2: Appearance */}
        {activeTab === 'appearance' && (
          <section className={styles.card} aria-labelledby="appearance-heading">
            <div className={styles.cardHeader}>
              <div>
                <h2 id="appearance-heading" className={styles.cardTitle}>
                  Display Theme
                </h2>
                <p className={styles.cardSubtitle}>
                  Choose your interface appearance. Theme settings persist locally across sessions.
                </p>
              </div>
              <span className={styles.badgePrimary}>
                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </span>
            </div>

            <div className={styles.themeSelectorGrid}>
              {/* Light Mode Card */}
              <div
                role="radio"
                aria-checked={theme === 'light'}
                tabIndex={0}
                className={`${styles.themeOptionCard} ${theme === 'light' ? styles.themeActive : ''}`}
                onClick={() => setTheme('light')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setTheme('light');
                  }
                }}
              >
                <div className={styles.themeCardHeader}>
                  <div className={styles.themeCardTitleRow}>
                    <SunIcon size={18} />
                    <span className={styles.themeOptionTitle}>Light Theme</span>
                  </div>
                  {theme === 'light' && (
                    <span className={styles.checkChip}>
                      <CheckIcon size={12} />
                      <span>Active</span>
                    </span>
                  )}
                </div>
                <div className={styles.lightPreviewSwatch} aria-hidden="true" />
                <p className={styles.themeOptionDesc}>
                  Clean daylight contrast with crisp borders, neutral slate surfaces, and optimized legibility.
                </p>
              </div>

              {/* Dark Mode Card */}
              <div
                role="radio"
                aria-checked={theme === 'dark'}
                tabIndex={0}
                className={`${styles.themeOptionCard} ${theme === 'dark' ? styles.themeActive : ''}`}
                onClick={() => setTheme('dark')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setTheme('dark');
                  }
                }}
              >
                <div className={styles.themeCardHeader}>
                  <div className={styles.themeCardTitleRow}>
                    <MoonIcon size={18} />
                    <span className={styles.themeOptionTitle}>Dark Theme</span>
                  </div>
                  {theme === 'dark' && (
                    <span className={styles.checkChip}>
                      <CheckIcon size={12} />
                      <span>Active</span>
                    </span>
                  )}
                </div>
                <div className={styles.darkPreviewSwatch} aria-hidden="true" />
                <p className={styles.themeOptionDesc}>
                  Deep midnight palette designed for low-light focus, reduced eye strain, and tactile Kanban cards.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Tab 3: Preferences */}
        {activeTab === 'preferences' && (
          <section className={styles.card} aria-labelledby="preferences-heading">
            <div className={styles.cardHeader}>
              <div>
                <h2 id="preferences-heading" className={styles.cardTitle}>
                  Browser Preferences
                </h2>
                <p className={styles.cardSubtitle}>
                  Device-specific visual cues and client settings stored in your local browser.
                </p>
              </div>
              <span className={styles.badgeSubtle}>Browser Local</span>
            </div>

            <div className={styles.toggleList}>
              <div className={styles.toggleRow}>
                <div className={styles.toggleMeta}>
                  <span className={styles.toggleLabel}>Upcoming Deadline Alerts</span>
                  <span className={styles.toggleSub}>
                    Highlight tasks on the board with deadlines due within the next 24 hours.
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={prefs.dueReminders}
                  className={`${styles.switch} ${prefs.dueReminders ? styles.switchOn : ''}`}
                  onClick={() => handleTogglePref('dueReminders')}
                  aria-label="Toggle upcoming deadline alerts"
                >
                  <span className={styles.switchSlider} />
                </button>
              </div>

              <div className={styles.toggleRow}>
                <div className={styles.toggleMeta}>
                  <span className={styles.toggleLabel}>Overdue Task Warning Badges</span>
                  <span className={styles.toggleSub}>
                    Render prominent warning chips on cards past their scheduled calendar date.
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={prefs.overdueAlerts}
                  className={`${styles.switch} ${prefs.overdueAlerts ? styles.switchOn : ''}`}
                  onClick={() => handleTogglePref('overdueAlerts')}
                  aria-label="Toggle overdue task warning badges"
                >
                  <span className={styles.switchSlider} />
                </button>
              </div>

              <div className={styles.toggleRow}>
                <div className={styles.toggleMeta}>
                  <span className={styles.toggleLabel}>Real-Time Cross-Tab Sync</span>
                  <span className={styles.toggleSub}>
                    Synchronize task updates across multiple open browser tabs automatically.
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={prefs.autoSync}
                  className={`${styles.switch} ${prefs.autoSync ? styles.switchOn : ''}`}
                  onClick={() => handleTogglePref('autoSync')}
                  aria-label="Toggle real-time cross-tab sync"
                >
                  <span className={styles.switchSlider} />
                </button>
              </div>

              <div className={styles.toggleRow}>
                <div className={styles.toggleMeta}>
                  <span className={styles.toggleLabel}>Completion Audio Chime</span>
                  <span className={styles.toggleSub}>
                    Play a subtle sound notification when moving a task to the Done column.
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={prefs.soundCues}
                  className={`${styles.switch} ${prefs.soundCues ? styles.switchOn : ''}`}
                  onClick={() => handleTogglePref('soundCues')}
                  aria-label="Toggle completion audio chime"
                >
                  <span className={styles.switchSlider} />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Tab 4: Session & Security */}
        {activeTab === 'session' && (
          <section className={styles.card} aria-labelledby="session-heading">
            <div className={styles.cardHeader}>
              <div>
                <h2 id="session-heading" className={styles.cardTitle}>
                  Session & Security Controls
                </h2>
                <p className={styles.cardSubtitle}>
                  Inspect active authentication state and manage your current session.
                </p>
              </div>
              <span className={styles.badgeSuccess}>JWT Authenticated</span>
            </div>

            <div className={styles.sessionStatusBox}>
              <div className={styles.sessionInfo}>
                <span className={styles.sessionTitle}>Active Browser Session</span>
                <span className={styles.sessionEmail}>Signed in as <strong>{user?.email}</strong></span>
                <span className={styles.sessionNote}>
                  Cryptographic Bearer token stored in browser session. Requests are signed on each call.
                </span>
              </div>

              <Button
                variant="danger"
                size="md"
                icon={<LogOutIcon size={16} />}
                onClick={handleLogout}
              >
                Sign Out
              </Button>
            </div>

            <div className={styles.securityFeaturesStrip}>
              <div className={styles.securityPill}>
                <ShieldIcon size={14} className={styles.iconDone} />
                <span>bcrypt Password Hashing (10 rounds)</span>
              </div>
              <div className={styles.securityPill}>
                <ShieldIcon size={14} className={styles.iconDone} />
                <span>JWT Token Authorization</span>
              </div>
              <div className={styles.securityPill}>
                <ShieldIcon size={14} className={styles.iconDone} />
                <span>MongoDB Per-User Isolation</span>
              </div>
            </div>

            <div className={styles.legalFootnote}>
              <Link to="/privacy" className={styles.legalLink}>Privacy Policy</Link>
              <span>•</span>
              <Link to="/terms" className={styles.legalLink}>Terms of Service</Link>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
};

export default SettingsPage;
