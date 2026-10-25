import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongoModule } from './database/mongo.module';
import { LogsModule } from './logs/logs.module';

@Module({
  imports: [MongoModule,LogsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
