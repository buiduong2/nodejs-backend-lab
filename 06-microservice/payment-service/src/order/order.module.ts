import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PaymentModule } from '../payment/payment.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { APP_INTERCEPTOR, ModuleRef, Reflector } from '@nestjs/core';
import { KafkaReliabilityInterceptor } from '@saga/messaging';
@Module({
  imports: [
    PaymentModule,
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
    OrderService,
    {
      provide: APP_INTERCEPTOR,
      useFactory: (reflector: Reflector, moduleRef: ModuleRef) =>
        new KafkaReliabilityInterceptor(reflector, moduleRef),
      inject: [Reflector, ModuleRef],
    },
  ],
  controllers: [OrderController],
})
export class OrderModule {}
