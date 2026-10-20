import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import {
  KanbanIcon,
  LayoutDashboardIcon,
  CheckCircleIcon,
  CalendarIcon,
  FileTextIcon,
  SettingsIcon,
  LogOutIcon,
  CloseIcon,
} from '../common/Icons';
import styles from './Sidebar.module.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavEntry {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  isAvailable: boolean;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navEntries: NavEntry[] = [
    {
      id: 'board',
      label: 'Board',
      path: '/',
      icon: <KanbanIcon size={18} />,
      isAvailable: true,
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboardIcon size={18} />,
      isAvailable: true,
    },
    {
      id: 'my-tasks',
      label: 'My Tasks',
      path: '/my-tasks',
      icon: <CheckCircleIcon size={18} />,
      isAvailable: false,
      badge: 'Soon',
    },
    {
      id: 'calendar',
      label: 'Calendar',
      path: '/calendar',
      icon: <CalendarIcon size={18} />,
      isAvailable: false,
      badge: 'Soon',
    },
    {
      id: 'reports',
      label: 'Reports',
      path: '/reports',
      icon: <FileTextIcon size={18} />,
      isAvailable: false,
      badge: 'Soon',
    },
    {
      id: 'settings',
      label: 'Settings',
      path: '/settings',
      icon: <SettingsIcon size={18} />,
      isAvailable: false,
      badge: 'Soon',
    },
  ];

  return (
    <>
      {isOpen && (
        <div
          className={styles.backdrop}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}
        aria-label="Application Navigation"
      >
        <div className={styles.header}>
          <div className={styles.brandRow}>
            <Link to="/" className={styles.brandLink} onClick={onClose}>
              <div className={styles.brandIconWrapper}>
                <KanbanIcon size={18} />
              </div>
              <span className={styles.brandName}>TaskFlow</span>
            </Link>
            <button
              type="button"
              className={styles.closeDrawerBtn}
              onClick={onClose}
              aria-label="Close navigation menu"
            >
              <CloseIcon size={18} />
            </button>
          </div>

          <div className={styles.workspacePill}>
            <span className={styles.statusDot} aria-hidden="true" />
            <span className={styles.workspaceName}>Personal Workspace</span>
          </div>
        </div>

        <nav className={styles.navContainer}>
          <span className={styles.sectionTitle}>Workspace</span>

          {navEntries.map((item) => {
            const isActive = item.isAvailable && location.pathname === item.path;

            if (item.isAvailable) {
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`${styles.navItem} ${isActive ? styles.activeLink : ''}`}
                  onClick={onClose}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  <span className={styles.navLabel}>{item.label}</span>
                </Link>
              );
            }

            return (
              <div
                key={item.id}
                className={`${styles.navItem} ${styles.navItemDisabled}`}
                aria-disabled="true"
                title={`${item.label} — planned roadmap section`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
                {item.badge && <span className={styles.soonBadge}>{item.badge}</span>}
              </div>
            );
          })}
        </nav>

        <div className={styles.footer}>
          <div className={styles.userCard}>
            <div className={styles.userInfo}>
              <span className={styles.avatarInitials} aria-hidden="true">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'TF'}
              </span>
              <div className={styles.userText}>
                <span className={styles.userName}>{user?.name || 'User'}</span>
                <span className={styles.userEmail} title={user?.email}>
                  {user?.email || 'user@taskflow.dev'}
                </span>
              </div>
            </div>

            <button
              type="button"
              className={styles.logoutBtn}
              onClick={handleLogout}
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOutIcon size={15} />
            </button>
          </div>

          <div className={styles.legalLinks}>
            <Link to="/privacy" className={styles.legalLink} onClick={onClose}>
              Privacy
            </Link>
            <span className={styles.dotDivider}>•</span>
            <Link to="/terms" className={styles.legalLink} onClick={onClose}>
              Terms
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};
