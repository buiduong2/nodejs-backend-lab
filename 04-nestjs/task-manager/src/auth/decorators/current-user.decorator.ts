import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthInfo } from '../interfaces/auth.info';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthInfo => {
    const req = ctx.switchToHttp().getRequest();
    if (!req.user) {
      throw new UnauthorizedException(
        'Get user AUthentication principal failed',
      );
    }
    return req.user;
  },
);
