import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    ValidationPipe
} from '@nestjs/common';

import { User } from '../../users/entities/user.entity';
import { CreateTaskDto } from '../dtos/create-task.dto';
import { UpdateTaskDto } from '../dtos/update-task.dto';
import { TaskListItem } from '../mapper/tasks.mapper';
import { TasksService } from '../services/tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly taskService: TasksService) {}

  @Get()
  public findAll(): TaskListItem[] {
    return this.taskService.findAll();
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.taskService.findById(id);
  }

  @Post()
  public create(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    taskDto: CreateTaskDto,
  ) {
    const userId: User['id'] = 1;
    return this.taskService.create(taskDto, userId);
  }

  @Patch(':id')
  public update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    taskDto: UpdateTaskDto,
  ) {
    return this.taskService.update(id, taskDto);
  }

  @Delete(':id')
  public delete(@Param('id', ParseIntPipe) id: number) {
    return this.taskService.delete(id);
  }
}
