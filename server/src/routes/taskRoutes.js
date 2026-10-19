import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import {
  createTaskValidator,
  updateTaskValidator,
  taskIdValidator,
} from '../validators/taskValidators.js';
import { taskMutationLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(authenticate);

router.route('/')
  .get(getTasks)
  .post(taskMutationLimiter, createTaskValidator, createTask);

router.route('/:id')
  .get(taskIdValidator, getTaskById)
  .patch(taskMutationLimiter, updateTaskValidator, updateTask)
  .delete(taskMutationLimiter, taskIdValidator, deleteTask);

export default router;
