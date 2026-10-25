import { Injectable } from '@nestjs/common';
import { NestLogger } from 'nest-logging';
import { setTimeout } from 'timers/promises';

@Injectable()
export class TaskService {
  constructor(private readonly logger: NestLogger) {}

  execute(): void {
    this.logger.info('Task executed', {
      taskId: 100,
    });
  }

  async executeWithDelay(): Promise<void> {
    this.logger.info('BEFORE await');

    await setTimeout(1000);

    this.logger.info('AFTER await');
  }
}
