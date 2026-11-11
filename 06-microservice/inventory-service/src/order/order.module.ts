import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import {
  ClientsModule,
  Transport,
} from '@nestjs/microservices';

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
  ],
  controllers: [OrderController],
})
export class OrderModule {}
