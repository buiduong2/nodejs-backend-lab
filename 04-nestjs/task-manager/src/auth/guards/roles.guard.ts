import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Role, User } from '../../users/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthInfo } from '../interfaces/auth.info';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles: Role[] = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (roles === undefined || roles.length === 0) {
      return true;
    }

    const user: AuthInfo = context.switchToHttp().getRequest()['user'];

    if (!user) {
      return false;
    }

    return roles.some((role) => role === user.role);
  }
}
