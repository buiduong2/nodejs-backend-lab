import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();

    const start = performance.now();
    console.log(`[BEFORE] [id-${request.requestId}]: ${start}`)

    return next.handle().pipe(
      tap(() => {
        console.log(`[AFTER] [id-${request.requestId}] : ${(performance.now() - start ).toFixed(2)}`)
      })
    );
  }
}
