import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { ThemeToggle } from '../common/ThemeToggle';
import { MenuIcon, LogOutIcon } from '../common/Icons';
import { Button } from '../common/Button';
import styles from './AppHeader.module.css';

interface AppHeaderProps {
  onMenuToggle: () => void;
  title?: string;
  badge?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onMenuToggle,
  title = 'Board',
  badge = 'Live',
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <button
          type="button"
          className={styles.menuBtn}
          onClick={onMenuToggle}
          aria-label="Open sidebar navigation"
          title="Open navigation"
        >
          <MenuIcon size={18} />
        </button>

        <div className={styles.titleGroup}>
          <h1 className={styles.pageTitle}>{title}</h1>
          {badge && <span className={styles.liveBadge}>{badge}</span>}
        </div>
      </div>

      <div className={styles.actionsGroup}>
        <ThemeToggle />

        {user && (
          <div className={styles.userSummary} title={user.email}>
            <span className={styles.avatarInitials} aria-hidden="true">
              {user.name ? user.name.slice(0, 2).toUpperCase() : 'TF'}
            </span>
            <span className={styles.userName}>{user.name || 'User'}</span>
          </div>
        )}

        <Button
          variant="subtle"
          size="sm"
          icon={<LogOutIcon size={15} />}
          onClick={handleLogout}
          aria-label="Sign out"
        >
          Sign Out
        </Button>
      </div>
    </header>
  );
};
