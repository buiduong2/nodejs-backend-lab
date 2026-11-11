import { Inject, Injectable } from '@nestjs/common';
import {
  INVENTORY_RESERVE_EVENT,
  InventoryReservateSuccessEvent,
  InventoryReserveFailedEvent,
  ReserveInventoryCommand,
} from './order.type';
import { ProductService } from '../product/product.service';
import { ClientKafka } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrderService {
  constructor(
    private productService: ProductService,
    @Inject('ORDER_SAGA_PRODUCER')
    private client: ClientKafka,
  ) {}

  async reserveInventory(message: ReserveInventoryCommand) {
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
  }
}
