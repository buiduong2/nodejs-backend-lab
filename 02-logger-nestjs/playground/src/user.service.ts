import { Injectable } from '@nestjs/common';
import { NestLogger } from 'nest-logging';

@Injectable()
export class UserService {
  constructor(private readonly logger: NestLogger) {}

  execute(): void {
    this.logger.warn('User executed', {
      userId: 200,
    });
  }
}