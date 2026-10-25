import { Module } from '@nestjs/common';
import { MongoModule } from '../database/mongo.module';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';

@Module({
  imports: [MongoModule],
  controllers: [LogsController],
  providers: [LogsService],
})
export class LogsModule {}
