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

const router = express.Router();

router.use(authenticate);

router.route('/')
  .get(getTasks)
  .post(createTaskValidator, createTask);

router.route('/:id')
  .get(taskIdValidator, getTaskById)
  .patch(updateTaskValidator, updateTask)
  .delete(taskIdValidator, deleteTask);

export default router;
