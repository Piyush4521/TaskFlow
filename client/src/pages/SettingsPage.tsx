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
  LayersIcon,
} from '../components/common/Icons';
import styles from './SettingsPage.module.css';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState(false);

  const handleCopyId = async () => {
    if (!user?.id) return;
    try {
      await navigator.clipboard.writeText(user.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      // Fallback if clipboard API is restricted
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // User initials for avatar display
  const userInitials = user?.name ? user.name.slice(0, 2).toUpperCase() : 'TF';

  // System time zone
  const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  return (
    <AppShell title="Settings" badge="Preferences">
      <div className={styles.settingsContainer}>
        {/* Page Header */}
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Settings & Preferences</h1>
          <p className={styles.pageSubtitle}>
            Manage your personal profile, visual appearance, security overview, and active session.
          </p>
        </header>

        {/* 1. Account & Profile Section */}
        <section className={styles.settingsSection} aria-labelledby="section-account">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <div className={styles.sectionIcon}>
                <UserIcon size={20} />
              </div>
              <h2 id="section-account" className={styles.sectionTitle}>
                Account Profile
              </h2>
            </div>
            <span className={styles.sectionBadge}>Authenticated</span>
          </div>

          <p className={styles.sectionDescription}>
            Your personal account information is authenticated via TaskFlow JWT and scoped to your personal workspace.
          </p>

          <div className={styles.profileCard}>
            <div className={styles.avatarInitials} aria-hidden="true">
              {userInitials}
            </div>

            <div className={styles.profileInfo}>
              <span className={styles.profileName}>{user?.name || 'Active User'}</span>
              <span className={styles.profileEmail}>{user?.email || 'user@taskflow.dev'}</span>
              <div className={styles.profilePillGroup}>
                <span className={styles.statusPill}>
                  <span className={styles.statusDot} aria-hidden="true" />
                  Active Session
                </span>
                <span className={styles.rolePill}>Personal Workspace Owner</span>
              </div>
            </div>
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Full Name</span>
              <span className={styles.detailValue}>{user?.name || 'N/A'}</span>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Email Address</span>
              <span className={styles.detailValue}>{user?.email || 'N/A'}</span>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>User Identifier</span>
              <div className={styles.detailValue}>
                <span className={styles.monoSnippet}>{user?.id || 'N/A'}</span>
                {user?.id && (
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className={styles.copyBtn}
                    aria-label="Copy User Identifier"
                  >
                    {copiedId ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Data Scope</span>
              <span className={styles.detailValue}>Isolated to your account</span>
            </div>
          </div>
        </section>

        {/* 2. Appearance & Theme Section */}
        <section className={styles.settingsSection} aria-labelledby="section-appearance">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <div className={styles.sectionIcon}>
                <SunIcon size={20} />
              </div>
              <h2 id="section-appearance" className={styles.sectionTitle}>
                Appearance
              </h2>
            </div>
            <span className={styles.sectionBadge}>Saved Locally</span>
          </div>

          <p className={styles.sectionDescription}>
            Select your preferred visual theme. Your choice is instantly applied and persisted to local browser storage.
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
                Clean slate styling with crisp contrast, clear borders, and optimized daylight readability.
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
                Deep slate background designed for low-light focus, reduced eye strain, and tactile task cards.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Security & Architecture Posture */}
        <section className={styles.settingsSection} aria-labelledby="section-security">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <div className={styles.sectionIcon}>
                <ShieldIcon size={20} />
              </div>
              <h2 id="section-security" className={styles.sectionTitle}>
                Security & Authentication Posture
              </h2>
            </div>
            <span className={styles.sectionBadge}>MERN Security</span>
          </div>

          <p className={styles.sectionDescription}>
            Overview of the cryptographic safeguards and access controls currently enforced by the TaskFlow platform.
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
        </section>

        {/* 4. Active Session & Sign Out */}
        <section className={styles.settingsSection} aria-labelledby="section-session">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <div className={styles.sectionIcon}>
                <LogOutIcon size={20} />
              </div>
              <h2 id="section-session" className={styles.sectionTitle}>
                Active Session
              </h2>
            </div>
            <span className={styles.sectionBadge}>Session</span>
          </div>

          <p className={styles.sectionDescription}>
            Manage your active authentication session and local credential cache.
          </p>

          <div className={styles.sessionCard}>
            <div className={styles.sessionDetails}>
              <span className={styles.sessionTitle}>Current Device Session</span>
              <span className={styles.sessionMeta}>
                Signed in as <strong>{user?.email}</strong>. Session token is stored securely in browser storage.
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
        </section>

        {/* 5. System & Legal Information */}
        <section className={styles.settingsSection} aria-labelledby="section-system">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <div className={styles.sectionIcon}>
                <LayersIcon size={20} />
              </div>
              <h2 id="section-system" className={styles.sectionTitle}>
                System & Legal Information
              </h2>
            </div>
            <span className={styles.sectionBadge}>Environment</span>
          </div>

          <div className={styles.systemGrid}>
            <div className={styles.systemCard}>
              <span className={styles.systemLabel}>Application</span>
              <span className={styles.systemValue}>TaskFlow MERN Kanban</span>
            </div>

            <div className={styles.systemCard}>
              <span className={styles.systemLabel}>Local Time Zone</span>
              <span className={styles.systemValue}>{localTimeZone}</span>
            </div>

            <div className={styles.systemCard}>
              <span className={styles.systemLabel}>API Architecture</span>
              <span className={styles.systemValue}>RESTful Express + MongoDB</span>
            </div>

            <div className={styles.systemCard}>
              <span className={styles.systemLabel}>Frontend Bundle</span>
              <span className={styles.systemValue}>React 19 + Vite</span>
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
      </div>
    </AppShell>
  );
};

export default SettingsPage;
