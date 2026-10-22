import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Task } from '../entities/tasks.entity';
import { ChecklistItem } from '../entities/check-item.entity';
import { CreateChecklistItemDto } from '../dtos/create-checklist-item.dto';
import { UpdateChecklistItemDto } from '../dtos/update-checklist-item.dto';

@Injectable()
export class ChecklistItemService {
  constructor(
    @InjectRepository(ChecklistItem)
    private readonly checklistRepository: Repository<ChecklistItem>,

    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async create(taskId: number, dto: CreateChecklistItemDto) {
    const taskExists = await this.taskRepository.existsBy({
      id: taskId,
    });

    if (!taskExists) {
      throw new NotFoundException(`Task ${taskId} not found`);
    }

    return this.checklistRepository.save({
      ...dto.data,
      task: { id: taskId },
    });
  }

  async update(
    taskId: number,
    id: number,
    dto: UpdateChecklistItemDto,
  ): Promise<void> {
    const result = await this.checklistRepository.update(
      {
        id,
        task: { id: taskId },
      },
      {
        ...dto.data,
      },
    );

    if (result.affected === 0) {
      throw new NotFoundException(
        `ChecklistItem ${id} not found in Task ${taskId}`,
      );
    }
  }

  async delete(taskId: number, id: number): Promise<void> {
    const result = await this.checklistRepository.delete({
      id,
      task: { id: taskId },
    });

    if (result.affected === 0) {
      throw new NotFoundException(
        `ChecklistItem ${id} not found in Task ${taskId}`,
      );
    }
  }
}
