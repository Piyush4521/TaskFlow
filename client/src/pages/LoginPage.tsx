import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { Button } from '../components/common/Button';
import { LogInIcon, AlertCircleIcon, CheckCircleIcon, LayersIcon } from '../components/common/Icons';
import { ApiClientError } from '../services/api';
import styles from './AuthPages.module.css';

interface LocationState {
  registeredEmail?: string;
  registeredMessage?: string;
}

export const LoginPage: React.FC = () => {
  const location = useLocation();
  const locationState = location.state as LocationState | null;

  const [email, setEmail] = useState(() => locationState?.registeredEmail || '');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(() =>
    locationState?.registeredMessage || (locationState?.registeredEmail ? 'Account registered successfully. Please sign in.' : null)
  );

  const { login, isAuthenticated, sessionExpired, clearSessionExpired } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearSessionExpired();
    setSuccessMessage(null);

    const newErrors: { email?: string; password?: string; general?: string } = {};

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await login(trimmedEmail, password);
      navigate('/', { replace: true });
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
          setErrors({
            email: err.fieldErrors.email,
            password: err.fieldErrors.password,
            general: err.fieldErrors.general || (!err.fieldErrors.email && !err.fieldErrors.password ? err.message : undefined),
          });
        } else {
          setErrors({ general: err.message });
        }
      } else {
        setErrors({ general: 'An unexpected connection error occurred. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.mainContainer}>
        <div className={styles.authCard}>
          <div className={styles.cardHeader}>
            <div className={styles.brandBadge}>
              <LayersIcon size={20} />
            </div>
            <h1 className={styles.title}>Sign in to TaskFlow</h1>
            <p className={styles.subtitle}>
              Access your Kanban workspace and manage ongoing tasks.
            </p>
          </div>

          {sessionExpired && (
            <div className={styles.alertNotice} role="alert">
              <AlertCircleIcon size={16} />
              <span>Your session has expired. Please sign in again.</span>
            </div>
          )}

          {successMessage && (
            <div className={styles.successNotice} role="status">
              <CheckCircleIcon size={16} />
              <span>{successMessage}</span>
            </div>
          )}

          {errors.general && (
            <div className={styles.alertNotice} role="alert">
              <AlertCircleIcon size={16} />
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className={styles.form} noValidate>
            <div className={styles.fieldGroup}>
              <label htmlFor="login-email" className={styles.label}>
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                placeholder="name@example.com"
                value={email}
                disabled={isSubmitting}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
              />
              {errors.email && <p className={styles.errorText}>{errors.email}</p>}
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="login-password" className={styles.label}>
                Password
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                placeholder="Enter your password"
                value={password}
                disabled={isSubmitting}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
              />
              {errors.password && <p className={styles.errorText}>{errors.password}</p>}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              disabled={isSubmitting}
              icon={<LogInIcon size={16} />}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className={styles.cardFooter}>
            <span className={styles.footerText}>Do not have an account yet?</span>
            <Link to="/register" className={styles.footerLink}>
              Create an account
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
