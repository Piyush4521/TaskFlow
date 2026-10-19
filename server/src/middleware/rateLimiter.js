import rateLimit from 'express-rate-limit';

export function createAuthLimiter(options = {}) {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    limit: options.limit || 20,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
      });
    },
    ...options,
  });
}

export const authLimiter = createAuthLimiter();

export function createTaskMutationLimiter(options = {}) {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    limit: options.limit || 60,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
      });
    },
    ...options,
  });
}

export const taskMutationLimiter = createTaskMutationLimiter();
