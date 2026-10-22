import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Task } from '../entities/tasks.entity';
import { CreateTaskDto } from '../dtos/create-task.dto';
import { User } from '../../users/entities/user.entity';
import { UpdateTaskDto } from '../dtos/update-task.dto';
import { TaskListItem, TaskListMapper } from '../mapper/tasks.mapper';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly dataSource: DataSource,
  ) {}

  create(taskDto: CreateTaskDto, userId: User['id']) {
    return this.taskRepository.save({
      ...taskDto.task,
      createdBy: {
        id: userId,
      },
    });
  }

  async update(id: number, taskDto: UpdateTaskDto) {
    // update repository.update() mặc định bỏ qua những property có giá trị undefined trong update payload.
    const updateResult = await this.taskRepository.update(id, {
      ...taskDto.task,
    });

    if (updateResult.affected === 0) {
      throw new NotFoundException(`Task ${id} not found`);
    }
  }

  async delete(id: number) {
    const delRs = await this.taskRepository.delete(id);
    if (delRs.affected === 0) {
      throw new NotFoundException(`Task ${id} not found`);
    }
  }

  async findById(id: number) {
    const res = await this.taskRepository.findOneBy({ id });
    if (!res) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    return res;
  }

  findAll(): TaskListItem[] {
    const tasks: TaskListItem[] = [];
    return TaskListMapper.toList(tasks);
  }
}
