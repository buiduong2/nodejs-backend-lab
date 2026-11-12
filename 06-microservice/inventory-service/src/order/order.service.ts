import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  InventoryReleaseSuccessEvent,
  InventoryReservateSuccessEvent,
  InventoryReserveFailedEvent,
  ReserveInventoryCommand,
} from './order.type';
import { ProductService } from '../product/product.service';
import { ClientKafka } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import { firstValueFrom } from 'rxjs';
import {
  INVENTORY_RELEASE_EVENT,
  INVENTORY_RESERVE_EVENT,
} from './order.topic';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  constructor(
    private productService: ProductService,
    @Inject('ORDER_SAGA_PRODUCER')
    private client: ClientKafka,
  ) {}

  async reserveInventory(message: ReserveInventoryCommand) {
    this.logger.debug(
      `[Order-${message.orderId}]: received Command InventoryReserve`,
    );
    const result = await this.productService.handlerReserveInventory(message);

    const responseMessage:
      InventoryReserveFailedEvent | InventoryReservateSuccessEvent = {
      messsageId: randomUUID(),
      occurredAt: new Date().toISOString(),
      orderId: message.orderId,
      payload: result,
      sagaId: message.sagaId,
      type: 'event',
    };

    await firstValueFrom(
      this.client.emit(INVENTORY_RESERVE_EVENT, {
        key: message.orderId,
        value: responseMessage,
      }),
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

    const productReservation =
      await this.productService.releaseReservation(message);

    const event: InventoryReleaseSuccessEvent = {
      messsageId: randomUUID(),
      occurredAt: new Date().toISOString(),
      orderId: message.orderId,
      payload: { reservationId: productReservation.id },
      sagaId: productReservation.sagaId,
      type: 'event',
    };

    await firstValueFrom(
      this.client.emit(INVENTORY_RELEASE_EVENT, {
        key: event.orderId,
        value: event,
      }),
    );

    this.logger.debug(
      `[Order-${message.orderId}]: published Event InventoryRelease `,
    );
  }
}
