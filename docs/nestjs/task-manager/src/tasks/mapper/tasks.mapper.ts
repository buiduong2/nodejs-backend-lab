export interface TaskListItem {
  id: number;
  title: string;
  description: string;
  status: string;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}

export class TaskListMapper {
  static toListItem(task: any): TaskListItem {
    return {
      id: 1,
      title: 'string',
      description: 'string',
      status: 'string',
      createdBy: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static toList(tasks: any[]): TaskListItem[] {
    return tasks.map(TaskListMapper.toListItem);
  }
}
