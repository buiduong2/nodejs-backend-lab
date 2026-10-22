import { Injectable } from '@nestjs/common';
import { TaskListItem, TaskListMapper } from './mapper/tasks.mapper';

@Injectable()
export class TasksService {
  findAll(): TaskListItem[] {
    const tasks:TaskListItem[] = [];

    return TaskListMapper.toList(tasks);
  }
}
