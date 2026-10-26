import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { Page } from '../../share/dto/page.dto';
import { buildPageMeta } from '../../share/helper/build-page-meta.helper';
import { parseSort } from '../../share/helper/parse-sort.helper';
import { User } from '../../users/entities/user.entity';
import {
  CreateTaskData,
  CreateTaskDto,
  TaskData,
} from '../dtos/create-task.dto';
import { TaskQueryDto } from '../dtos/task-query.dto';
import { UpdateTaskDto } from '../dtos/update-task.dto';
import { ChecklistItem } from '../entities/checklist-item.entity';
import { Task } from '../entities/tasks.entity';
import {
  TaskInfo,
  TaskListItem,
  TaskMapper,
  TaskTreeRow,
} from '../mapper/tasks.mapper';
import { NestLogger } from 'nest-logging';

@Injectable()
export class TasksService {
  static readonly allowSortColumns = [
    'title',
    'description',
    'status',
    'createdAt',
  ];

  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly dataSource: DataSource,
    private readonly logger: NestLogger,
  ) {}

  create(taskDto: CreateTaskDto, userId: User['id']) {
    this.logger.info(`do func create  userId=${userId}`);
    return this.dataSource.transaction(async (em) => {
      return this.helperCreateByLevel(em, [taskDto.task], userId);
    });
  }

  private async helperCreateByLevel(
    em: EntityManager,
    taskDatas: CreateTaskData[],
    userId: string,
    parent?: Task,
  ): Promise<Task[]> {
    let parentOption = parent?.id ? { parent: { id: parent.id } } : {};

    const tasks: Partial<Task>[] = taskDatas.map(({ children, ...taskDatas }) =>
      em.create(Task, {
        ...taskDatas,
        createdBy: {
          id: userId,
        },
        ...parentOption,
      }),
    );

    const savedTasks = await em.save(Task, tasks);

    if (taskDatas.length !== savedTasks.length) {
      throw new Error('missing saved Tasks');
    }

    for (let index = 0; index < taskDatas.length; index++) {
      const savedTask = savedTasks[index];
      const childrenData = taskDatas[index].children;
      if (!childrenData?.length) {
        continue;
      }
      const children = await this.helperCreateByLevel(
        em,
        childrenData,
        userId,
        savedTask,
      );
      savedTask.children = children;
    }

    return savedTasks;
  }

  // Chỉ cho phép update 1 cấp
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
    const qb = this.taskRepository.createQueryBuilder().delete().from(Task);
    qb.addCommonTableExpression(
      `
    SELECT id AS id
    FROM tasks 
    WHERE id = :id
     UNION
    SELECT t.id
    FROM tasks AS t
    INNER JOIN task_tree AS cte ON cte.id = t.parent_id 
    `,
      'task_tree',
      { recursive: true },
    ).setParameter('id', id);

    const result = await qb.where('id IN (SELECT id FROM task_tree)').execute();
    if (result.affected === 0) {
      throw new NotFoundException('Recource not found');
    }
  }

  async findById(id: string) {
    const qb = this.taskRepository.createQueryBuilder('task');
    qb.addCommonTableExpression(
      `
    SELECT id AS id, parent_id, 0 as depth
    FROM tasks 
    WHERE id = :id
     UNION
    SELECT t.id, t.parent_id, cte.depth + 1 AS depth
    FROM tasks AS t
    INNER JOIN task_tree AS cte ON cte.id = t.parent_id 
    `,
      'task_tree',
      { recursive: true },
    ).setParameter('id', id);

    qb.innerJoin('task_tree', 'tt', 'tt.id = task.id');

    qb.leftJoin('task.createdBy', 'user');

    qb.select([
      'task.id AS id',
      'task.title AS title',
      'task.status AS status',
      'tt.parent_id AS "parentId"',
      'tt.depth AS depth',
      'user.id AS "createdById"',
      'user.username AS "createdByUsername"',
      'task.createdAt AS "createdAt"',
      'task.updatedAt AS "updatedAt"',
      'task.description AS description',
    ]);

    const rows = await qb.getRawMany<TaskTreeRow>();

    if (rows.length === 0) {
      throw new NotFoundException('Resource not found');
    }
    return this.buildTree(TaskMapper.treeToTaskList(rows))[0];
  }

  private buildTree(rows: TaskInfo[]): TaskInfo[] {
    if (rows.length === 0) {
      return [];
    }

    const roots = [];
    const map = new Map<string, TaskInfo>();

    for (const row of rows) {
      map.set(row.id, row);
    }

    for (const row of rows) {
      const parent = row.parentId ? map.get(row.parentId) : undefined;

      if (!parent) {
        roots.push(row);
        continue;
      }

      if (!parent.children) {
        parent.children = [row];
      } else {
        parent.children.push(row);
      }
    }

    return roots;
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

    qb.where('task.parent is null');

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
