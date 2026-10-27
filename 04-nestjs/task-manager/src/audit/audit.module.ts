import { Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { LogActionInterceptor } from './log-action.interceptor';
import { MongoClient } from 'mongodb';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LogActionInterceptor,
    },
    {
      provide: 'MONGO_CLIENT',
      useFactory: async (configSerivce: ConfigService) => {
        const mongoClient = new MongoClient(configSerivce.get('MONGO_URI')!);
        await mongoClient.connect();
        return mongoClient;
      },
      inject: [ConfigService],
    },
  ],
})
export class AuditModule implements OnApplicationShutdown {
  constructor(
    @Inject('MONGO_CLIENT')
    private readonly mongoClient?: MongoClient,
  ) {}

  async onApplicationShutdown(signal?: string) {
    await this.mongoClient?.close();
  }
}
