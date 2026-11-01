import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';
import { RequestTrakcingMiddleware } from './share/middlewares/request-tracking.middleware';
import { ApiKeyGuard } from './share/guards/api-key.guard';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { RequestLoggingInterceptor } from './share/interceptors/request-logging.interceptor';
import { coloredTextFormatter, ConsoleSink, LoggingModule } from 'nest-logging';
import { MongoLoggingModule, MongoSink } from 'nest-logging/mongo';
import { AuthModule } from './auth/auth.module';
import { AuditModule } from './audit/audit.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: Number(config.get('DB_PORT', 5432)),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: false,
        logging: ['query', 'error'], // Chỉ định hiển thị câu lệnh SQL và lỗi (hoặc để 'true' để hiện tất cả)
        logger: 'advanced-console',
      }),
    }),
    LoggingModule.forRoot({
      httpContext: true,
      level: 'info',
      imports: [
        MongoLoggingModule.forRoot({
          uri: process.env?.MONGO_URI!,
          database: 'nestjs_log',
          collection: 'logs',
        }),
      ],
      providers: [
        {
          provide: ConsoleSink,
          useValue: new ConsoleSink(coloredTextFormatter),
        },
      ],
      sinks: [ConsoleSink, MongoSink],
    }),
    TasksModule,
    UsersModule,
    AuthModule,
    // AuditModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggingInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestTrakcingMiddleware).forRoutes({
      path: '{*splat}',
      method: RequestMethod.ALL,
    });
  }
}
