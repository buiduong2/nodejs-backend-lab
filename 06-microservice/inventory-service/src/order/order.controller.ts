import { Controller, Inject } from '@nestjs/common';
import {
  ClientKafka,
  Ctx,
  EventPattern,
  KafkaContext,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';
import {
  INVENTORY_RESERVE_COMMAND,
  INVENTORY_RESERVE_EVENT,
  type ReserveInventoryCommand,
} from './order.type';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(
    @Inject('ORDER_SAGA_PRODUCER')
    private client: ClientKafka,
    private readonly orderService: OrderService,
  ) {}

  @EventPattern(INVENTORY_RESERVE_COMMAND)
  async handleInventoryReserveCommand(
    @Payload() message: ReserveInventoryCommand,
    @Ctx() context: unknown,
  ) {
    const kafkaContext = context as KafkaContext;

    await this.orderService.reserveInventory(message);
  }



}
