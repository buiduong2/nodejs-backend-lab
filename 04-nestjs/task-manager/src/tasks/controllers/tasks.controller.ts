import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';

import { Page } from '../../share/dto/page.dto';
import { User } from '../../users/entities/user.entity';
import { CreateTaskDto } from '../dtos/create-task.dto';
import { TaskQueryDto } from '../dtos/task-query.dto';
import { UpdateTaskDto } from '../dtos/update-task.dto';
import { TaskListItem } from '../mapper/tasks.mapper';
import { TasksService } from '../services/tasks.service';
import { LogAction } from '../../audit/log-action.decorator';
import { AUDIT_LOG_OPERATION } from '../../audit/audit.constrant';

@Controller('tasks')
export class TasksController {
  constructor(private readonly taskService: TasksService) {}

  @Get()
  async findAll(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    taskQueryDto: TaskQueryDto,
  ): Promise<Page<TaskListItem>> {
    return this.taskService.findAll(taskQueryDto);
  }

  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.taskService.findById(id);
  }

  @Post()
  public create(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    taskDto: CreateTaskDto,
  ) {
    const userId: User['id'] = 'cdc80720-fdad-4d77-ac4c-1db2894c3232';
    return this.taskService.create(taskDto, userId);
  }

  @LogAction({
    entity: 'task',
    entityIdPath: 'id',
    entityIdSource: 'params',
    operation: AUDIT_LOG_OPERATION.UPDATE,
  })
  @Patch(':id')
  public update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    taskDto: UpdateTaskDto,
  ) {
    return this.taskService.update(id, taskDto);
  }

  @Delete(':id')
  public delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.taskService.delete(id);
  }
}
