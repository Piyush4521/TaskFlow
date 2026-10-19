import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { Button } from '../components/common/Button';
import { AlertCircleIcon } from '../components/common/Icons';

export const NotFoundPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-canvas)' }}>
      <Navbar />
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '32px 16px',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-surface-subtle)',
            color: 'var(--text-muted)',
            marginBottom: '16px',
          }}
        >
          <AlertCircleIcon size={24} />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Page Not Found</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '360px', marginBottom: '24px' }}>
          The page you are looking for does not exist or may have been moved.
        </p>
        <Link to="/">
          <Button variant="primary" size="md">
            Return to Dashboard
          </Button>
        </Link>
      </main>
      <Footer />
    </div>
  );
};
