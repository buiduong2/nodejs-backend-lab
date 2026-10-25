import { Injectable } from '@nestjs/common';
import { NestLogger } from '../../dist';

@Injectable()
export class AppService {
  constructor(private readonly logger: NestLogger) {}

  getHello(): string {
    this.logger.info('Hello from AppService', {
      source: 'playground',
    });

    return 'Hello World!';
  }
}
