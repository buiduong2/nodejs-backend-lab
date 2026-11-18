import { Module } from '@nestjs/common';
import { SagaService } from './saga.service';
import { SagaController } from './saga.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Saga } from './saga.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { APP_INTERCEPTOR, ModuleRef, Reflector } from '@nestjs/core';
import { KafkaReliabilityInterceptor } from '@saga/messaging';
@Module({
  imports: [
    TypeOrmModule.forFeature([Saga]),
    ClientsModule.register([
      {
        name: 'ORDER_SAGA_PRODUCER',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'order_saga_producer',
            brokers: ['localhost:9092'],
          },
          producerOnlyMode: true,
        },
      },
    ]),
  ],
  providers: [
    SagaService,
    {
      provide: APP_INTERCEPTOR,
      useFactory: (reflector: Reflector, moduleRef: ModuleRef) =>
        new KafkaReliabilityInterceptor(reflector, moduleRef),
      inject: [Reflector, ModuleRef],
    },
  ],
  controllers: [SagaController],
  exports: [SagaService],
})
export class SagaModule {}
