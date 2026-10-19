import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { ArrowLeftIcon, FileTextIcon } from '../components/common/Icons';
import styles from './LegalPage.module.css';

export const TermsPage: React.FC = () => {
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
                  <FileTextIcon size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  Terms of Service
                </span>
                <span className={styles.dateText}>Last updated: October 2026</span>
              </div>
              <h1 className={styles.title}>TaskFlow Terms & Conditions</h1>
              <p className={styles.subtitle}>
                Terms governing access to and usage of the TaskFlow task management application.
              </p>
            </header>

            <div className={styles.content}>
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>1. Acceptance & Nature of the Service</h2>
                <p className={styles.paragraph}>
                  By creating an account or accessing TaskFlow, you acknowledge that this software was built specifically as a technical demonstration
                  for the <strong>Aarvion Services India Pvt. Ltd. MERN Stack Developer Assessment</strong>.
                  These Terms of Service govern your use of the application for evaluation, demonstration, and personal task management purposes.
                </p>
              </section>

              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>2. Acceptable Use Policy</h2>
                <p className={styles.paragraph}>
                  You agree to use TaskFlow in good faith and in compliance with all applicable laws. You agree NOT to:
                </p>
                <ul className={styles.list}>
                  <li className={styles.listItem}>
                    Attempt to probe, scan, or exploit vulnerabilities, or circumvent user authentication and per-user task authorization controls.
                  </li>
                  <li className={styles.listItem}>
                    Execute automated denial-of-service attacks, rate-limit evasion, or bulk credential stuffing against registration and login endpoints.
                  </li>
                  <li className={styles.listItem}>
                    Store or transmit any unlawful, defamatory, infringing, or malicious content within task titles or descriptions.
                  </li>
                  <li className={styles.listItem}>
                    Use TaskFlow as an archival or backup system for sensitive, confidential, or business-critical records.
                  </li>
                </ul>
              </section>

              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>3. User Accounts & Credentials</h2>
                <p className={styles.paragraph}>
                  When you register for TaskFlow, you are responsible for maintaining the confidentiality of your login credentials.
                  Because TaskFlow is operated as a demonstration and evaluation platform, we strongly advise evaluators and testers to use
                  dedicated testing passwords rather than personal, real-world credentials.
                </p>
              </section>

              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>4. Task Data Ownership & Privacy</h2>
                <p className={styles.paragraph}>
                  You retain complete ownership of all task titles, descriptions, and workflow data that you create within TaskFlow.
                  TaskFlow claims no ownership, copyright, or intellectual property rights over user-created task content.
                  Your task data is processed and stored strictly in accordance with our <Link to="/privacy">Privacy Policy</Link>.
                </p>
              </section>

              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>5. Disclaimer of Warranties (&ldquo;As Is&rdquo;)</h2>
                <div className={styles.highlightBox}>
                  <span className={styles.highlightTitle}>Assessment & Demonstration Disclaimer</span>
                  <span className={styles.highlightText}>
                    TaskFlow is provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis for developer evaluation, without warranty
                    of any kind, express or implied. The maintainer makes no guarantee that the application will be uninterrupted, error-free,
                    or permanently accessible.
                  </span>
                </div>
                <p className={styles.paragraph}>
                  To the maximum extent permitted by applicable law, the author disclaims any liability for indirect, incidental, or consequential
                  damages, including any loss of data resulting from database resets, local development teardowns, or network interruptions.
                </p>
              </section>

              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>6. Account Termination & Database Maintenance</h2>
                <p className={styles.paragraph}>
                  You may stop using TaskFlow and delete your individual tasks at any time using the in-app delete buttons.
                  The project maintainer reserves the right to suspend access, purge inactive demo accounts, or reset demonstration database clusters
                  during evaluation cycles, refactoring, or maintenance without prior notice.
                </p>
              </section>

              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>7. Modifications to These Terms</h2>
                <p className={styles.paragraph}>
                  These terms reflect the architectural requirements and operational scope of the assessment project. Any updates will be reflected
                  directly on this page with an updated revision date.
                </p>
              </section>

              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>8. Contact Information</h2>
                <p className={styles.paragraph}>
                  If you have questions regarding these terms or the technical implementation of TaskFlow, please refer to the project documentation
                  or file an issue via the public GitHub repository.
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
