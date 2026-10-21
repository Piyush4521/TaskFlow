import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const app = express();

app.disable('x-powered-by');

app.use(helmet());

// Normalizes configured client origins (handles accidental paths, trailing slashes, or comma-separated lists)
export function parseAllowedOrigins(clientUrl) {
  const origins = new Set([
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
  ]);

  if (clientUrl) {
    clientUrl.split(',').forEach((raw) => {
      const trimmed = raw.trim();
      if (!trimmed) return;
      try {
        const parsed = new URL(trimmed);
        origins.add(parsed.origin);
      } catch {
        origins.add(trimmed.replace(/\/+$/, ''));
      }
      origins.add(trimmed.replace(/\/+$/, ''));
    });
  }

  return Array.from(origins);
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server health checks)
      if (!origin) return callback(null, true);

      const allowedOrigins = parseAllowedOrigins(process.env.CLIENT_URL);
      const normalizedOrigin = origin.replace(/\/+$/, '');

      if (allowedOrigins.includes(origin) || allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      callback(null, false);
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'TaskFlow API is running',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/team', teamRoutes);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
