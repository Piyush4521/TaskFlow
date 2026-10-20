import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { AppHeader } from './AppHeader';
import styles from './AppShell.module.css';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  badge?: string;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  title = 'Board',
  badge = 'Live',
}) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Handle escape key to close mobile nav
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileNavOpen) {
        setIsMobileNavOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileNavOpen]);

  return (
    <div className={styles.shell}>
      <Sidebar
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />

      <div className={styles.mainWrapper}>
        <AppHeader
          onMenuToggle={() => setIsMobileNavOpen((prev) => !prev)}
          title={title}
          badge={badge}
        />

        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
};
