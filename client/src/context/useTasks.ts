import { useContext } from 'react';
import { TaskContext } from './taskContextDef';
import { TaskContextType } from '../types/task';

export const useTasks = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
