import { Task, TaskStatus } from '../entities/tasks.entity';

export interface BaseItem {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskListItem extends BaseItem {
  title: string;
  description: string;
  status: string;
  createdBy: string;
}

export interface TaskInfo extends BaseItem {
  title: string;
  description: string;
  status: string;

  createdBy: {
    id: string;
    username: string;
  };

  children?: TaskInfo[]
  parentId?: string | null

//   checklistItems: {
//     id: string;
//     content: string;
//     isCompleted: boolean;
//   }[];
}

export interface TaskTreeRow {
  id: string;
  title: string;
  status: TaskStatus;
  parentId: string | null;
  depth: number;
  createdAt: Date,
  updatedAt: Date,
  createdById: string;
  createdByUsername: string;
  description: string;
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
    //   checklistItems: task.checklistItems.map((i) => ({
    //     id: i.id,
    //     content: i.content,
    //     isCompleted: i.isCompleted,
    //   })),
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

  static treeToTask(row: TaskTreeRow): TaskInfo {
    return {
        id: row.id,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        title: row.title,
        description: row.description,
        status: row.status,
        createdBy: {
            id: row.createdById,
            username: row.createdByUsername
        },
        parentId: row.parentId,
        
    }
  }

  static treeToTaskList(rows: TaskTreeRow[]):TaskInfo[] {
    return rows.map(TaskMapper.treeToTask);
  }
}
