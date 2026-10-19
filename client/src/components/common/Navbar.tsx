import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { ThemeToggle } from './ThemeToggle';
import { KanbanIcon, LogInIcon, LogOutIcon, UserPlusIcon } from './Icons';
import { Button } from './Button';
import styles from './Navbar.module.css';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.brandGroup}>
          <Link to="/" className={styles.brandLink}>
            <div className={styles.brandIconWrapper}>
              <KanbanIcon size={18} />
            </div>
            <span className={styles.brandName}>TaskFlow</span>
          </Link>
          <span className={styles.tagline}>Kanban Workspace</span>
        </div>

        <nav className={styles.actionsGroup}>
          <ThemeToggle />

          {isAuthenticated ? (
            <div className={styles.userSection}>
              <div className={styles.userBadge} title={user?.email}>
                <span className={styles.avatarInitials}>
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'TF'}
                </span>
                <span className={styles.userName}>{user?.name || 'User'}</span>
              </div>
              <Button
                variant="subtle"
                size="sm"
                icon={<LogOutIcon size={16} />}
                onClick={handleLogout}
                aria-label="Sign out"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className={styles.authLinks}>
              <Link to="/login" className={styles.navLink}>
                <LogInIcon size={16} />
                <span>Sign In</span>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm" icon={<UserPlusIcon size={16} />}>
                  Register
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
