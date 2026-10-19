import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { ArrowLeftIcon, ShieldIcon } from '../components/common/Icons';
import styles from './LegalPage.module.css';

export const PrivacyPage: React.FC = () => {
  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          <Link to="/" className={styles.backLink}>
            <ArrowLeftIcon size={16} />
            <span>Back to Workspace</span>
          </Link>

          <article className={styles.card}>
            <header className={styles.header}>
              <div className={styles.metaRow}>
                <span className={styles.badge}>
                  <ShieldIcon size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  Privacy Notice
                </span>
                <span className={styles.dateText}>Last updated: October 2026</span>
              </div>
              <h1 className={styles.title}>TaskFlow Privacy Policy</h1>
              <p className={styles.subtitle}>
                Transparency regarding how account information, task data, authentication credentials,
                and browser storage are handled within TaskFlow.
              </p>
            </header>

            <div className={styles.content}>
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>1. Project Context & Purpose</h2>
                <p className={styles.paragraph}>
                  TaskFlow is an independent full-stack Kanban task management application developed as a
                  demonstration project for the <strong>Aarvion Services India Pvt. Ltd. MERN Stack Developer Assessment</strong>.
                  This application is intended for technical evaluation and workflow demonstration.
                  It is not operated as a commercial SaaS service.
                </p>
              </section>

              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>2. Information Collected & Stored</h2>
                <p className={styles.paragraph}>
                  TaskFlow collects only the minimal data strictly necessary to authenticate users and persist their
                  personal Kanban tasks:
                </p>
                <ul className={styles.list}>
                  <li className={styles.listItem}>
                    <strong>Account Registration Data:</strong> When you create an account, we collect your{' '}
                    <strong>Full Name</strong> (2 to 80 characters) and <strong>Email Address</strong> (used as your unique
                    account identifier). We do not collect phone numbers, billing addresses, or payment details.
                  </li>
                  <li className={styles.listItem}>
                    <strong>Password Credentials:</strong> Your password is required to authenticate. Passwords are{' '}
                    <strong>never stored in plaintext</strong>. Passwords are cryptographically salted and hashed using{' '}
                    <code className={styles.codeSnippet}>bcryptjs</code> with 10 salt rounds before being saved to the database.
                    The Mongoose User model sets <code className={styles.codeSnippet}>select: false</code> on the password
                    field so it is excluded from default query results.
                  </li>
                  <li className={styles.listItem}>
                    <strong>Task & Workflow Data:</strong> When you manage tasks, we store the task <strong>Title</strong> (1 to 120 characters),
                    optional <strong>Description</strong> (up to 2000 characters), <strong>Status</strong> (<code className={styles.codeSnippet}>To-Do</code>,{' '}
                    <code className={styles.codeSnippet}>In-Progress</code>, or <code className={styles.codeSnippet}>Done</code>), and associated
                    timestamps (<code className={styles.codeSnippet}>createdAt</code>, <code className={styles.codeSnippet}>updatedAt</code>).
                  </li>
                </ul>
              </section>

              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>3. Authentication, Tokens & Browser Storage</h2>
                <p className={styles.paragraph}>
                  TaskFlow uses stateless JSON Web Tokens (JWT) signed with HMAC-SHA256 to authorize API requests:
                </p>
                <ul className={styles.list}>
                  <li className={styles.listItem}>
                    <strong>Local Storage:</strong> Upon successful login, the received JWT token is stored in your browser&apos;s{' '}
                    <code className={styles.codeSnippet}>localStorage</code> under the key{' '}
                    <code className={styles.codeSnippet}>taskflow_token</code>, alongside basic profile display info (<code className={styles.codeSnippet}>taskflow_user</code>).
                    This preserves your active session across page reloads.
                  </li>
                  <li className={styles.listItem}>
                    <strong>Session Purging:</strong> Clicking <em>Sign Out</em> or receiving an HTTP 401 Unauthorized response
                    immediately purges both tokens and cached user data from <code className={styles.codeSnippet}>localStorage</code>.
                  </li>
                  <li className={styles.listItem}>
                    <strong>Theme Preference:</strong> Your selected visual theme (Light or Dark mode) is saved locally in{' '}
                    <code className={styles.codeSnippet}>localStorage</code> under <code className={styles.codeSnippet}>taskflow_theme</code>.
                  </li>
                </ul>
              </section>

              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>4. Database Storage & Task Authorization</h2>
                <p className={styles.paragraph}>
                  Account and task records are persisted in a MongoDB database (either a local instance or a managed MongoDB Atlas cluster).
                </p>
                <div className={styles.highlightBox}>
                  <span className={styles.highlightTitle}>Strict Per-User Data Isolation</span>
                  <span className={styles.highlightText}>
                    Every database query reading, updating, or deleting a task strictly validates that the task belongs to the authenticated
                    user ID extracted directly from the verified JWT. Client-supplied ownership parameters are rejected on the server,
                    ensuring that no user can view or alter another user&apos;s tasks.
                  </span>
                </div>
              </section>

              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>5. Service Worker & Caching Policy (PWA)</h2>
                <p className={styles.paragraph}>
                  TaskFlow includes Progressive Web App (PWA) capabilities via an active Service Worker (<code className={styles.codeSnippet}>taskflow-static-v1</code>).
                  Our caching policy adheres to strict privacy isolation:
                </p>
                <ul className={styles.list}>
                  <li className={styles.listItem}>
                    <strong>What is cached:</strong> Only static, public application shell files are cached (the HTML document, bundled CSS,
                    JavaScript application code, SVGs, and web manifest icons) to allow instant loading and offline shell availability.
                  </li>
                  <li className={styles.listItem}>
                    <strong>What is NEVER cached:</strong> The Service Worker explicitly bypasses all network traffic directed to{' '}
                    <code className={styles.codeSnippet}>/api/*</code>. <strong>Private task contents, authentication tokens, credentials,
                    and API responses are NEVER cached in Cache Storage or stored offline by the Service Worker.</strong>
                  </li>
                </ul>
              </section>

              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>6. Data Retention, Deletion & User Control</h2>
                <p className={styles.paragraph}>
                  Users have complete control over their tasks. You may modify or permanently delete any task at any time directly through the
                  dashboard interface. When deleted, the task is immediately removed from the database.
                </p>
                <p className={styles.paragraph}>
                  Because TaskFlow operates as an assessment demonstration environment, test databases may be periodically reset, cleaned,
                  or pruned by the maintainer. Do not use TaskFlow to store critical, sensitive, or irreplaceable data.
                </p>
              </section>

              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>7. Security Measures & Limitations</h2>
                <p className={styles.paragraph}>
                  TaskFlow employs established web security practices including HTTP security headers via <code className={styles.codeSnippet}>helmet</code>,
                  request body size limitations (capped at 10kb), input validation with <code className={styles.codeSnippet}>express-validator</code>,
                  and authentication endpoint rate limiting (20 requests per 15 minutes via <code className={styles.codeSnippet}>express-rate-limit</code>).
                </p>
                <p className={styles.paragraph}>
                  However, as an educational assessment project running locally or in demonstration hosting environments, it is provided without
                  formal enterprise certifications or commercial warranties. Evaluators are advised to use sample or disposable credentials for testing.
                </p>
              </section>

              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>8. Contact & Maintenance</h2>
                <p className={styles.paragraph}>
                  This project is maintained for developer evaluation purposes. For technical questions, feedback, or to request manual account
                  removal from test databases, please open an issue in the project&apos;s public GitHub repository.
                </p>
              </section>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
};
