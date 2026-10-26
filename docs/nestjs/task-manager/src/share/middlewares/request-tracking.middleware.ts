import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';


// Log request - DB
// Cần log cái gì vào trong DB
// ELK 
// 
@Injectable()
export class RequestTrakcingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = performance.now();

    req.requestId = randomUUID();

    
    res.on('finish', () => {
      const duration = performance.now() - start;
      const httpMethod = req.method;
      const url = req.originalUrl;
      console.log(
        `[id=${req.requestId}] ${httpMethod} - ${url} - ${res.statusCode} - ${duration.toFixed(2)}ms`,
      );
    });
    next();
  }
}
