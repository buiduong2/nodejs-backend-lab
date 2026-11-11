import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import { firstValueFrom } from 'rxjs';
import { EntityManager } from 'typeorm';
import { ReserveInventoryCommand } from '../kafka/kafka.type';
import { Order } from '../order/order.entity';
import { INVENTORY_RESERVE_COMMAND } from './saga.constrant';
import { Saga, SagaStatus, SagaStep } from './saga.entity';

@Injectable()
export class SagaService {
  constructor(
    @Inject('ORDER_SAGA_PRODUCER') private kafkaClient: ClientKafka,
  ) {}

  async startOrderSaga(tx: EntityManager, order: Order) {
    const saga = tx.create(Saga, {
      currentStep: SagaStep.RESERVE_INVENTORY,
      status: SagaStatus.RUNNING,
      orderId: order.id,
    });

    return await tx.save(saga);
  }

  async publishReserveInventoryMessage(order: Order, saga: Saga) {
    const reserveInventoryCmd: ReserveInventoryCommand = {
      messsageId: randomUUID(),
      occurredAt: new Date().toISOString(),
      orderId: order.id,
      payload: {
        items: order.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      },
      sagaId: saga.id,
      type: 'command',
    };

    await firstValueFrom(
      this.kafkaClient.emit<ReserveInventoryCommand>(
        INVENTORY_RESERVE_COMMAND,
        { key: order.id, value: reserveInventoryCmd },
      ),
    );
  }
}
