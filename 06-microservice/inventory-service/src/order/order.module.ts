import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OrderService } from './order.service';
import { ProductModule } from '../product/product.module';
import { APP_INTERCEPTOR, ModuleRef, Reflector } from '@nestjs/core';
import { KafkaReliabilityInterceptor } from '@saga/messaging';
@Module({
  imports: [
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
    ProductModule,
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    {
      provide: APP_INTERCEPTOR,
      useFactory: (reflector: Reflector, moduleRef: ModuleRef) =>
        new KafkaReliabilityInterceptor(reflector, moduleRef),
      inject: [Reflector, ModuleRef],
    },
  ],
})
export class OrderModule {}
