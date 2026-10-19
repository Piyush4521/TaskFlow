import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { Button } from '../components/common/Button';
import { UserPlusIcon, AlertCircleIcon, LayersIcon } from '../components/common/Icons';
import { ApiClientError } from '../services/api';
import styles from './AuthPages.module.css';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; email?: string; password?: string; general?: string } = {};

    const trimmedName = name.trim();
    if (!trimmedName) {
      newErrors.name = 'Full name is required';
    } else if (trimmedName.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (trimmedName.length > 80) {
      newErrors.name = 'Name cannot exceed 80 characters';
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await register(trimmedName, trimmedEmail, password);
      // Navigate to login with pre-populated email and success message
      navigate('/login', {
        state: {
          registeredEmail: trimmedEmail,
          registeredMessage: 'Registration successful! Please sign in with your credentials.',
        },
      });
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 409) {
          setErrors({ email: 'This email is already registered. Please sign in or use another email.' });
        } else if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
          setErrors({
            name: err.fieldErrors.name,
            email: err.fieldErrors.email,
            password: err.fieldErrors.password,
            general: err.fieldErrors.general || (!err.fieldErrors.name && !err.fieldErrors.email && !err.fieldErrors.password ? err.message : undefined),
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
            <h1 className={styles.title}>Create your account</h1>
            <p className={styles.subtitle}>
              Start organizing your tasks with TaskFlow today.
            </p>
          </div>

          {errors.general && (
            <div className={styles.alertNotice} role="alert">
              <AlertCircleIcon size={16} />
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className={styles.form} noValidate>
            <div className={styles.fieldGroup}>
              <label htmlFor="register-name" className={styles.label}>
                Full name
              </label>
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                placeholder="e.g. Alex Morgan"
                value={name}
                disabled={isSubmitting}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
              />
              {errors.name && <p className={styles.errorText}>{errors.name}</p>}
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="register-email" className={styles.label}>
                Email address
              </label>
              <input
                id="register-email"
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
              <label htmlFor="register-password" className={styles.label}>
                Password (minimum 8 characters)
              </label>
              <input
                id="register-password"
                type="password"
                autoComplete="new-password"
                className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                placeholder="Create a secure password"
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
              icon={<UserPlusIcon size={16} />}
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </Button>
          </form>

          <div className={styles.cardFooter}>
            <span className={styles.footerText}>Already have an account?</span>
            <Link to="/login" className={styles.footerLink}>
              Sign in
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
