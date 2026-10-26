import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Page } from '../../share/dto/page.dto';
import { buildPageMeta } from '../../share/helper/build-page-meta.helper';
import { parseSort } from '../../share/helper/parse-sort.helper';
import { User } from '../../users/entities/user.entity';
import { CreateTaskDto } from '../dtos/create-task.dto';
import { TaskQueryDto } from '../dtos/task-query.dto';
import { UpdateTaskDto } from '../dtos/update-task.dto';
import { ChecklistItem } from '../entities/checklist-item.entity';
import { Task } from '../entities/tasks.entity';
import { TaskListItem, TaskMapper } from '../mapper/tasks.mapper';
import { NestLogger } from 'nest-logging';

@Injectable()
export class TasksService {
  static readonly allowSortColumns = ['title', 'description', 'status'];

  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly dataSource: DataSource,
    private readonly logger: NestLogger,
  ) {}

  create(taskDto: CreateTaskDto, userId: User['id']) {
    this.logger.info(`do func create  userId=${userId}`);
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

  async update(id: string, taskDto: UpdateTaskDto) {
    // update repository.update() mặc định bỏ qua những property có giá trị undefined trong update payload.
    const updateResult = await this.taskRepository.update(id, {
      ...taskDto.task,
    });

    if (updateResult.affected === 0) {
      throw new NotFoundException(`Task ${id} not found`);
    }
  }

  async delete(id: string) {
    const result = await this.dataSource.transaction(async (em) => {
      await em.getRepository(ChecklistItem).delete({ task: { id } });
      return em.getRepository(Task).delete(id);
    });

    if (result.affected === 0) {
      throw new NotFoundException(`Task ${id} not found`);
    }
  }

  async findById(id: string) {
    const qb = this.taskRepository.createQueryBuilder('task');
    qb.leftJoinAndSelect('task.checklistItems', 'checklistItem');

    // Dùng add SELECT tối ưu hơn như thế nào so với map response bằng code.

    // chỉ select các trường
    // Bớt đi công đoạn mapping

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
    this.logger.info(`do func findAll  page=${page}, limit=${limit}`);
    const offset = (page - 1) * limit;

    // createdAt,desc => {field: createdAt, driection: DESC}
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
