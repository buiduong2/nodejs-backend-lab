import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  InventoryReleaseSuccessEvent,
  InventoryReservateSuccessEvent,
  InventoryReserveFailedEvent,
  ReserveInventoryCommand,
} from '@saga/contracts';
import { ProductService } from '../product/product.service';
import { ClientKafka } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import { firstValueFrom } from 'rxjs';
import {
  INVENTORY_RELEASE_EVENT,
  INVENTORY_RESERVE_EVENT,
} from '@saga/contracts';
import { DataSource } from 'typeorm';
import { OutboxService } from '@saga/outbox';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  constructor(
    private productService: ProductService,
    @Inject('ORDER_SAGA_PRODUCER')
    private client: ClientKafka,
    private dataSource: DataSource,
    private outboxService: OutboxService,
  ) {}

  async reserveInventory(message: ReserveInventoryCommand) {
    this.logger.debug(
      `[Order-${message.orderId}]: received Command InventoryReserve`,
    );

    const responseMessage = await this.dataSource.manager.transaction(
      async (tx) => {
        const result = await this.productService.handlerReserveInventory(
          tx,
          message,
        );

        const responseMessage:
          InventoryReserveFailedEvent | InventoryReservateSuccessEvent = {
          messageId: randomUUID(),
          occurredAt: new Date().toISOString(),
          orderId: message.orderId,
          payload: result,
          sagaId: message.sagaId,
          type: 'event',
        };

        this.outboxService.createMessage(
          tx,
          INVENTORY_RESERVE_EVENT,
          message.orderId,
          responseMessage,
        );

        return responseMessage;
      },
    );

    if (responseMessage.payload.success) {
      this.logger.debug(
        `[Order-${message.orderId}]: published Event InventoryReserve Successful`,
      );
    } else {
      this.logger.debug(
        `[Order-${message.orderId}]: published Event InventoryReserve Failed - reason: ${responseMessage.payload.reason}`,
      );
    }
  }

  async releaseInventory(message: ReserveInventoryCommand) {
    this.logger.debug(
      `[Order-${message.orderId}]: received Command release Inventory`,
    );

    await this.dataSource.manager.transaction(async (tx) => {
      const productReservation = await this.productService.releaseReservation(
        tx,
        message,
      );

      const event: InventoryReleaseSuccessEvent = {
        messageId: randomUUID(),
        occurredAt: new Date().toISOString(),
        orderId: message.orderId,
        payload: { reservationId: productReservation.id },
        sagaId: productReservation.sagaId,
        type: 'event',
      };

      this.outboxService.createMessage(
        tx,
        INVENTORY_RELEASE_EVENT,
        event.orderId,
        event,
      );
    });

    this.logger.debug(
      `[Order-${message.orderId}]: published Event InventoryRelease `,
    );
  }
}
