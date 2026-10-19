import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.container}>
        <div className={styles.leftGroup}>
          <span className={styles.brandName}>TaskFlow</span>
          <span className={styles.separator} aria-hidden="true">·</span>
          <span>Kanban Workspace</span>
          <span className={styles.separator} aria-hidden="true">·</span>
          <span className={styles.badge}>MERN Developer Assessment</span>
        </div>

        <nav className={styles.navGroup} aria-label="Legal navigation">
          <Link to="/privacy" className={styles.link}>
            Privacy Policy
          </Link>
          <span className={styles.separator} aria-hidden="true">·</span>
          <Link to="/terms" className={styles.link}>
            Terms & Conditions
          </Link>
        </nav>
      </div>
    </footer>
  );
};
