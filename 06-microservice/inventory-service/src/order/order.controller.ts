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
  type ReserveInventoryCommand,
} from '@saga/contracts';
import {
  INVENTORY_RELEASE_COMMAND,
  INVENTORY_RESERVE_COMMAND,
} from '@saga/contracts';
import { retry, isRetryableDatabaseError } from '@saga/utils';
import { firstValueFrom } from 'rxjs';
import { createDeadLetterMessage } from '@saga/outbox';
import { handleKafkaMessage } from '@saga/messaging';

@Controller('order')
export class OrderController {
  private logger = new Logger(Controller.name);
  
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
    await handleKafkaMessage(
      () => this.orderService.reserveInventory(message),
      {
        client: this.client,
        context: kafkaContext,
        getMessageKey: (msg) => msg.orderId,
        dlqTopic: INVENTORY_RESERVE_COMMAND_DLQ,
        message: message,
        onMovedToDlq: () =>
          this.logger.warn(
            `[Order-${message.orderId}] Message moved to DLQ: ${INVENTORY_RESERVE_COMMAND_DLQ}`,
          ),
      },
    );
  }

  @EventPattern(INVENTORY_RELEASE_COMMAND)
  async handleInventoryReleaseCommand(
    @Payload() message: ReserveInventoryCommand,
    @Ctx() context: unknown,
  ) {
    const kafkaContext = context as KafkaContext;
    await handleKafkaMessage(
      () => this.orderService.releaseInventory(message),
      {
        client: this.client,
        context: kafkaContext,
        dlqTopic: INVENTORY_RELEASE_COMMAND_DLQ,
        getMessageKey: (msg) => msg.orderId,
        message: message,
        onMovedToDlq: () =>
          this.logger.warn(
            `[Order-${message.orderId}] Message moved to DLQ: ${INVENTORY_RELEASE_COMMAND_DLQ}`,
          ),
      },
    );
  }
}
