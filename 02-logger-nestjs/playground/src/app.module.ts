import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { coloredTextFormatter, ConsoleSink, LoggingModule } from 'nest-logging';
import { TaskService } from './task.service';
import { UserService } from './user.service';
import { FirstTestSink } from './sinks/first-test.sink';
import { SecondTestSink } from './sinks/second-test.sink';
import { FailingTestSink } from './sinks/failing-test.sink';
import { TestFallback } from './fallback/test-fallback.log';
import { MongoLoggingModule, MongoSink } from '../../dist/mongo';

// Test 3 Multisink
// @Module({
//   imports: [LoggingModule.forRoot({
//     httpContext: true,
//     level: 'debug',
//     providers: [FirstTestSink,SecondTestSink, {
//         useFactory: () => new ConsoleSink(coloredTextFormatter),
//         provide: ConsoleSink
//     }],
//     sinks: [FirstTestSink,SecondTestSink,ConsoleSink]
//   })],
//   controllers: [AppController],
//   providers: [AppService,TaskService,UserService],
// })

// Test 4 Custom Fallback
// @Module({
//   imports: [
//     LoggingModule.forRoot({
//       providers: [FirstTestSink, FailingTestSink, TestFallback],
//       sinks: [FirstTestSink, FailingTestSink],
//       sinkErrorLog: TestFallback,
//     }),
//   ],
//   controllers: [AppController],
//   providers: [AppService, TaskService, UserService],
// })

// Test 5: MongoDB Sink
console.log(process.env?.MONGO_URI!)
@Module({
  imports: [
    LoggingModule.forRoot({
      imports: [
        MongoLoggingModule.forRoot({
          uri: process.env?.MONGO_URI!,
          database: 'log_cli',
          collection: 'logs',
        }),
      ],
      sinks: [MongoSink],
    }),
  ],
  controllers: [AppController],
  providers: [AppService, TaskService, UserService],
})
export class AppModule {}
