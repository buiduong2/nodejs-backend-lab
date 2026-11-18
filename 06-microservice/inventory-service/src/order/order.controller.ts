import { Controller, Inject, Logger } from '@nestjs/common';
import {
  ClientKafka,
  Ctx,
  EventPattern,
  KafkaContext,
  Payload,
} from '@nestjs/microservices';
import { OrderService } from './order.service';
import {
  INVENTORY_RELEASE_COMMAND_DLQ,
  INVENTORY_RESERVE_COMMAND_DLQ,
  type InventoryReleaseCommand,
  type ReserveInventoryCommand,
} from '@saga/contracts';
import {
  INVENTORY_RELEASE_COMMAND,
  INVENTORY_RESERVE_COMMAND,
} from '@saga/contracts';
import { retry, isRetryableDatabaseError } from '@saga/utils';
import { firstValueFrom } from 'rxjs';
import { createDeadLetterMessage } from '@saga/outbox';
import { handleKafkaMessage, KafkaReliable } from '@saga/messaging';
import { QueryFailedError } from 'typeorm';

@Controller('order')
export class OrderController {
  private logger = new Logger(Controller.name);

  constructor(
    @Inject('ORDER_SAGA_PRODUCER')
    private client: ClientKafka,
    private readonly orderService: OrderService,
  ) {}

  @EventPattern(INVENTORY_RESERVE_COMMAND)
  @KafkaReliable<ReserveInventoryCommand>({
    dlqTopic: INVENTORY_RESERVE_COMMAND_DLQ,
    backoffMultiplier: 2,
    delayMs: 1000,
    maxAttempts: 3,
    clientToken: 'ORDER_SAGA_PRODUCER',
    getMessageKey: (msg) => msg.orderId,
  })
  async handleInventoryReserveCommand(
    @Payload() message: ReserveInventoryCommand,
    @Ctx() context: unknown,
  ) {
    await this.orderService.reserveInventory(message);
  }

  @EventPattern(INVENTORY_RELEASE_COMMAND)
  @KafkaReliable<InventoryReleaseCommand>({
    dlqTopic: INVENTORY_RELEASE_COMMAND_DLQ,
    backoffMultiplier: 2,
    delayMs: 1000,
    maxAttempts: 3,
    clientToken: 'ORDER_SAGA_PRODUCER',
    getMessageKey: (msg) => msg.orderId,
  })
  async handleInventoryReleaseCommand(
    @Payload() message: InventoryReleaseCommand,
    @Ctx() context: unknown,
  ) {
    await this.orderService.releaseInventory(message);
  }
}
