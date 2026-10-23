import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Task } from '../entities/tasks.entity';
import { CreateTaskDto } from '../dtos/create-task.dto';
import { User } from '../../users/entities/user.entity';
import { UpdateTaskDto } from '../dtos/update-task.dto';
import { TaskListItem, TaskMapper } from '../mapper/tasks.mapper';
import { PaginationQueryDto } from '../../share/dto/pagination-query.dto';
import { parseSort } from '../../share/helper/parse-sort.helper';
import { Page } from '../../share/dto/page.dto';
import { buildPageMeta } from '../../share/helper/build-page-meta.helper';
import { TaskQueryDto } from '../dtos/task-query.dto';
import { ChecklistItem } from '../entities/checklist-item.entity';
import { checkPrime } from 'crypto';

@Injectable()
export class TasksService {
  static readonly allowSortColumns = ['title', 'description', 'status'];

  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly dataSource: DataSource,
  ) {}

  create(taskDto: CreateTaskDto, userId: User['id']) {
    return this.dataSource.transaction(async (em) => {
      const task = await em.save(Task, {
        ...taskDto.task,
        createdBy: {
          id: userId,
        },
      });

  
      if (Array.isArray(taskDto.task.checklistItems)) {
        const checklistItems = await em.save(
          ChecklistItem,
          taskDto.task.checklistItems.map((i) => ({
            content: i.content,
            isCompleted: Boolean(i.isCompleted),
            task: {
              id: task.id,
            },
          })),
        );
        task.checklistItems = checklistItems;
      } else {
        task.checklistItems = [];
      }

      return TaskMapper.toInfo(task);
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
    const qb = this.taskRepository.createQueryBuilder('task');
    qb.leftJoinAndSelect('task.checklistItems', 'checklistItem');

    qb.leftJoin('task.createdBy', 'user').addSelect([
      'user.id',
      'user.username',
    ]);
    qb.where('task.id =:id', { id });
    const task = await qb.getOne();
    if (!task) {
      throw new NotFoundException('Resource not found');
    }
    return TaskMapper.toInfo(task);
  }

  async findAll(taskQueryDto: TaskQueryDto): Promise<Page<TaskListItem>> {
    const qb = this.taskRepository.createQueryBuilder('task');

    const { page, limit, search, sort } = taskQueryDto;
    const offset = (page - 1) * limit;
    const sortOrders = parseSort(
      taskQueryDto.sort,
      TasksService.allowSortColumns,
    );

    // Filter
    if (search) {
      qb.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (taskQueryDto.status) {
      qb.andWhere('task.status =:status', { status: taskQueryDto.status });
    }

    // Phù hợp với JOIN
    qb.skip(offset).take(limit);

    if (sortOrders.length === 0) {
      qb.addOrderBy('task.id', 'ASC');
    } else {
      sortOrders.forEach(({ field, direction }) =>
        qb.addOrderBy(`task.${field}`, direction),
      );
    }

    const [tasks, total] = await qb.getManyAndCount();

    return {
      data: TaskMapper.toList(tasks),
      meta: buildPageMeta(page, limit, total, sortOrders),
    };
  }
}
