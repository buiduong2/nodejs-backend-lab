import { Task } from '../entities/tasks.entity';

export interface TaskListItem {
  id: number;
  title: string;
  description: string;
  status: string;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskInfo {
  id: number;
  title: string;
  description: string;
  status: string;

  createdAt: Date;
  updatedAt: Date;

  createdBy: {
    id: number;
    username: string;
  };

  checklistItems: {
    id: number;
    content: string;
    isCompleted: boolean;
  }[];
}

export class TaskMapper {
  static toInfo(task: Task): TaskInfo {
    return {
      id: task.id,
      title: task.title,
      description: task.description ?? '',
      status: task.status,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      createdBy: {
        id: task.createdBy.id,
        username: task.createdBy.username,
      },
      checklistItems: task.checklistItems.map((i) => ({
        id: i.id,
        content: i.content,
        isCompleted: i.isCompleted,
      })),
    };
  }

  static toListItem(task: Task): TaskListItem {
    return {
      id: task.id,
      title: task.title,
      description: task.description ?? '',
      status: task.status,
      createdBy: task.createdBy?.id,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }

  static toList(tasks: Task[]): TaskListItem[] {
    return tasks.map(TaskMapper.toListItem);
  }
}
