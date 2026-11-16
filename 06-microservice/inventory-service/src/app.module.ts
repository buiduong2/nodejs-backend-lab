import { Module } from '@nestjs/common';

import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OutboxModule } from '@saga/outbox';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.getOrThrow<string>('DB_HOST'),
        port: config.getOrThrow<number>('DB_PORT'),
        username: config.getOrThrow<string>('DB_USERNAME'),
        password: config.getOrThrow<string>('DB_PASSWORD'),
        database: config.getOrThrow<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    OutboxModule.forRoot({
      brokers: ['localhost:9092'],
      outboxLockKey: 'order_outbox',
    }),
    ProductModule,
    OrderModule,
  ],
})
export class AppModule {}
