import { Module } from '@nestjs/common';

import { PaymentModule } from './payment/payment.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderModule } from './order/order.module';
import { ScheduleModule } from '@nestjs/schedule';
import { OutboxModule } from '@saga/outbox';

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
    PaymentModule,
    OrderModule,
  ],
})
export class AppModule {}
