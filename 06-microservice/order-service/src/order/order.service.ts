import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderItem } from './order.entity';
import { Repository } from 'typeorm';
import { SagaService } from '../saga/saga.service';
import { OutboxService } from '@saga/outbox';
import { INVENTORY_RESERVE_COMMAND } from '@saga/contracts';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    private readonly outboxService: OutboxService,
    private readonly sagaService: SagaService,
  ) {}

  async createOrder(orderCreateReq: {
    customerId: string;
    items: OrderItem[];
  }) {
    this.logger.debug(`[Order-Saga]: Create Order  Begin`);
    const { customerId, items } = orderCreateReq;

    const { saga, order } = await this.orderRepository.manager.transaction(
      async (tx) => {
        const order = this.orderRepository.create({
          customerId,
          items,
          totalAmount: items
            .map((item) => ({
              unitPrice: BigInt(item.unitPrice),
              quantity: BigInt(item.quantity),
            }))
            .reduce((acc, item) => acc + item.quantity * item.unitPrice, 0n)
            .toString(),
        });

        const savedOrder = await tx.save(order);

        const saga = await this.sagaService.startOrderSaga(tx, savedOrder);

        const command = this.sagaService.createReservationCommand(order, saga);
        
        await this.outboxService.createMessage(
          tx,
          INVENTORY_RESERVE_COMMAND,
          command.orderId,
          command,
        );

        return { order: savedOrder, saga };
      },
    );

    this.logger.debug(
      `[Order-${order.id}]: save command ReservationInventory`,
    );
    return order;
  }
}
