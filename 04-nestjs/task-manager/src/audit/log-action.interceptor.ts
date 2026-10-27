import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { catchError, Observable, tap } from 'rxjs';
import { LOG_ACTION, LogAction, LogActionOption } from './log-action.decorator';
import { ActionLog } from './audit.event';

import { AuthInfo } from '../auth/interfaces/auth.info';
import { LogContext, NestLogger } from 'nest-logging';
import { Request } from 'express';
import { MongoClient, Collection } from 'mongodb';

@Injectable()
export class LogActionInterceptor implements NestInterceptor {
  private readonly collection: Collection;
  constructor(
    private readonly reflector: Reflector,
    private readonly logContext: LogContext,
    @Inject('MONGO_CLIENT')
    private readonly mongoClient: MongoClient,
  ) {
    this.collection = this.mongoClient.db('log_action').collection('logs');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const instruct = this.extractInstruct(context);

    if (!instruct) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const actionLog = this.createBaseLog(context);
          this.saveLog(actionLog);
        },
        error: (err) => {
          const actionLog = this.createBaseLog(context, err);
          this.saveLog(actionLog);
        },
      }),
    );
  }

  private extractInstruct(context: ExecutionContext) {
    return this.reflector.getAllAndOverride<LogActionOption>(LOG_ACTION, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  extractResourceId(
    context: ExecutionContext,
    instruct: LogActionOption,
    err: any,
  ): string | undefined {

    if (instruct.entityIdSource !== 'params') {
      return undefined;
    }
    const id = context.switchToHttp().getRequest<Request>().params[
      instruct.entityIdPath
    ];

    return Array.isArray(id) ? id[0] : id;
  }

  createBaseLog(context: ExecutionContext, err?: any): ActionLog {
    const request = context.switchToHttp().getRequest<Request>();

    const logActionInstruct = this.extractInstruct(context);

    const resourceId = this.extractResourceId(context, logActionInstruct, err);

    const actor: AuthInfo | undefined = request.user as AuthInfo;

    const { entity, operation } = logActionInstruct;
    return {
      action: operation,
      actorId: actor?.userId!,
      outcome: err ? 'FAILED' : 'SUCCESS',
      resourceType: entity,
      timestamp: new Date(),
      requestId: this.logContext.get()?.requestId as string,
      resourceId: resourceId,
      url: request.originalUrl,
    };
  }

  saveLog(logAction: ActionLog) {
    void this.collection.insertOne(logAction).catch((error) => {
      console.error('Failed to save action log:', error);
    });
  }
}
