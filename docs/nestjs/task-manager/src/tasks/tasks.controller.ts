import { Body, Controller, Get, Post, ValidationPipe } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TaskListItem } from './mapper/tasks.mapper';
import { CreateTaskDto } from './dtos/create-task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly taskService: TasksService) {}

  @Get()
  public findAll(): TaskListItem[] {
    return this.taskService.findAll();
  }

  @Post()
  public create(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    taskDto: CreateTaskDto,
  ) {
    
    return taskDto;
  }
}
