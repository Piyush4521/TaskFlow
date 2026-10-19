import { body, param } from 'express-validator';
import { TASK_STATUSES } from '../models/Task.js';
import { validate } from '../middleware/validate.js';

export const createTaskValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .bail()
    .isLength({ min: 1, max: 120 })
    .withMessage('Task title cannot exceed 120 characters'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .bail()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('status')
    .optional()
    .isIn(TASK_STATUSES)
    .withMessage('Status must be To-Do, In-Progress, or Done'),
  validate,
];

export const updateTaskValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid task ID'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Task title cannot be empty')
    .bail()
    .isLength({ min: 1, max: 120 })
    .withMessage('Task title cannot exceed 120 characters'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .bail()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('status')
    .optional()
    .isIn(TASK_STATUSES)
    .withMessage('Status must be To-Do, In-Progress, or Done'),
  validate,
];

export const taskIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid task ID'),
  validate,
];
