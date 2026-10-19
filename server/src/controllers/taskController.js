import Task from '../models/Task.js';

export async function getTasks(req, res, next) {
  try {
    const tasks = await Task.find({ userId: req.userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
}

export async function createTask(req, res, next) {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    const taskData = {
      title,
      userId: req.userId,
    };

    if (description !== undefined) {
      taskData.description = description;
    }

    if (status !== undefined) {
      taskData.status = status;
    }

    if (priority !== undefined) {
      taskData.priority = priority;
    }

    if (dueDate !== undefined) {
      taskData.dueDate = dueDate === '' || dueDate === null ? null : new Date(dueDate);
    }

    const task = await Task.create(taskData);

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTaskById(req, res, next) {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    return res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTask(req, res, next) {
  try {
    const updates = {};
    const { title, description, status, priority, dueDate } = req.body;

    if (title !== undefined) {
      updates.title = title;
    }

    if (description !== undefined) {
      updates.description = description;
    }

    if (status !== undefined) {
      updates.status = status;
    }

    if (priority !== undefined) {
      updates.priority = priority;
    }

    if (dueDate !== undefined) {
      updates.dueDate = dueDate === '' || dueDate === null ? null : new Date(dueDate);
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: updates },
      { returnDocument: 'after', runValidators: true },
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(req, res, next) {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
