import { Controller, Inject } from '@nestjs/common';
import {
  ClientKafka,
  Ctx,
  EventPattern,
  KafkaContext,
  Payload,
} from '@nestjs/microservices';
import { OrderService } from './order.service';
import { type ReserveInventoryCommand } from './order.type';
import {
  INVENTORY_RELEASE_COMMAND,
  INVENTORY_RESERVE_COMMAND,
} from './order.topic';

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

  @EventPattern(INVENTORY_RELEASE_COMMAND)
  async handleInventoryReleaseCommand(
    @Payload() message: ReserveInventoryCommand,
    @Ctx() context: unknown,
  ) {
    await this.orderService.releaseInventory(message);
  }
}
