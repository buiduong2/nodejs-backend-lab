import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import {
  CHECK_RESOURCE_ACCESS_KEY,
  CheckResourceAccessOptions,
} from '../decorators/check-resource-access.decorator';
import { AuthInfo } from '../interfaces/auth.info';
import { Task } from '../../tasks/entities/tasks.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const accessOptions: CheckResourceAccessOptions =
      this.reflector.getAllAndOverride<CheckResourceAccessOptions>(
        CHECK_RESOURCE_ACCESS_KEY,
        [context.getHandler(), context.getClass()],
      );

    const user: AuthInfo = context.switchToHttp().getRequest()['user'];
    if (!accessOptions || !user) {
      return true;
    }

    const { resource, paramKey = 'id' } = accessOptions;
    const taskId = context.switchToHttp().getRequest<Request>().params[
      paramKey
    ];

    switch (resource) {
      case 'task':
        return this.canUserAccessTaskResource(
          user,
          Array.isArray(taskId) ? taskId[0] : taskId,
        );

      default:
    }

    return false;
  }

  async canUserAccessTaskResource(user: AuthInfo, taskId: string) {
    return (
      this.taskRepository
        .createQueryBuilder('task')
        .where('task.id = :taskId AND task.createdBy.id = :userId ', {
          taskId,
          userId: user.userId,
        })
        .select('') // TODO: Triển kahi select 1 one boolean exists vs authenticated
        .getOne() === null
    );
  }
}
