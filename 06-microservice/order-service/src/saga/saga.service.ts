import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import { firstValueFrom } from 'rxjs';
import { DataSource, EntityManager } from 'typeorm';
import {
  InventoryReleaseCommand,
  InventoryReleaseSuccessEvent,
  InventoryReservateSuccessEvent,
  InventoryReserveFailedEvent,
  MessageEnvelope,
  OrderCompensatedEvent,
  OrderConfirmedEvent,
  PaymentChargeCommand,
  PaymentChargeEvent,
  ReservatinFailedResult as ReservationFailedResult,
  ReservationSuccessResult,
  ReserveInventoryCommand,
} from '@saga/contracts';
import { Order, OrderStatus } from '../order/order.entity';
import {
  INVENTORY_RELEASE_COMMAND,
  INVENTORY_RESERVE_COMMAND,
  ORDER_EVENT,
  PAYMENT_CHARGE_COMMAND,
} from '@saga/contracts';
import { Saga, SagaStatus, SagaStep } from './saga.entity';
import { OutboxService } from '@saga/outbox';

@Injectable()
export class SagaService {
  private readonly logger = new Logger(SagaService.name);

  constructor(
    @Inject('ORDER_SAGA_PRODUCER') private kafkaClient: ClientKafka,
    private readonly datasource: DataSource,
    private readonly outboxService: OutboxService,
  ) {}

  async startOrderSaga(tx: EntityManager, order: Order) {
    const saga = tx.create(Saga, {
      currentStep: SagaStep.RESERVE_INVENTORY,
      status: SagaStatus.RUNNING,
      orderId: order.id,
    });
    order.status = OrderStatus.RESERVING_STOCK;
    await tx.save(order);

    return await tx.save(saga);
  }

  createReservationCommand(order: Order, saga: Saga): ReserveInventoryCommand {
    return {
      messageId: randomUUID(),
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
  }

  async handleInventoryReserveFailed(payload: InventoryReserveFailedEvent) {
    this.logger.debug(
      `[Order-${payload.orderId}]: received event ReservationInventory Failed`,
    );
    return this.datasource.manager.transaction(async (tx) => {
      const [order, saga] = await this.getOrderAndSagaWithLock(tx, payload);

      if (!(
        order.status === OrderStatus.RESERVING_STOCK &&
        saga.status === SagaStatus.RUNNING &&
        saga.currentStep === SagaStep.RESERVE_INVENTORY
      )) {
        // idempotent & late message
        return { order, saga };
      }

      order.status = OrderStatus.REJECTED;
      saga.status = SagaStatus.COMPENSATED;
      saga.currentStep = SagaStep.COMPLETED;

      await tx.save([order, saga]);
      const msg = this.createOrderCompensatedEvent(order, saga);
      await this.outboxService.createMessage(tx, ORDER_EVENT, order.id, msg);

      this.logger.debug(
        `[Order-${payload.orderId}]: Created OrderCompensatedEvent`,
      );
      return { order, saga };
    });
  }

  private createOrderCompensatedEvent(
    order: Order,
    saga: Saga,
  ): OrderCompensatedEvent {
    return {
      messageId: randomUUID(),
      occurredAt: new Date().toISOString(),
      orderId: order.id,
      payload: {
        orderId: order.id,
        customerId: order.customerId,
      },
      sagaId: saga.id,
      type: 'event',
    };
  }

  async handleInventoryReserveSuccess(payload: InventoryReservateSuccessEvent) {
    this.logger.debug(
      `[Order-${payload.orderId}]: received event ReservationInventory Success`,
    );
    return this.datasource.manager.transaction(async (tx) => {
      const [order, saga] = await this.getOrderAndSagaWithLock(tx, payload);

      if (!(
        order.status === OrderStatus.RESERVING_STOCK &&
        saga.status === SagaStatus.RUNNING &&
        saga.currentStep === SagaStep.RESERVE_INVENTORY
      )) {
        // idempotent & late message
        return { order, saga };
      }

      order.status = OrderStatus.PAYMENT_PENDING;
      saga.currentStep = SagaStep.CHARGE_PAYMENT;

      await tx.save([order, saga]);
      const cmd = this.createPaymentChargeCommand(order, saga);
      await this.outboxService.createMessage(
        tx,
        PAYMENT_CHARGE_COMMAND,
        order.id,
        cmd,
      );

      this.logger.debug(
        `[Order-${payload.orderId}]: create Command Payment Charge`,
      );

      return { order, saga };
    });
  }

  private createPaymentChargeCommand(
    order: Order,
    saga: Saga,
  ): PaymentChargeCommand {
    return {
      messageId: randomUUID(),
      occurredAt: new Date().toISOString(),
      orderId: order.id,
      payload: {
        items: order.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        orderId: order.id,
        totalAmount: order.totalAmount,
      },
      sagaId: saga.id,
      type: 'command',
    };
  }

  async getOrderAndSagaWithLock<P>(
    tx: EntityManager,
    message: MessageEnvelope<string, P>,
  ) {
    const [order, saga] = await Promise.all([
      tx.findOne(Order, {
        where: { id: message.orderId },
        lock: { mode: 'pessimistic_write' },
      }),
      tx.findOne(Saga, {
        where: { id: message.sagaId, orderId: message.orderId },
        lock: { mode: 'pessimistic_write' },
      }),
    ]);

    if (!order || !saga) {
      throw new Error('Conflict: Missing entity');
    }

    return [order, saga] satisfies [Order, Saga];
  }

  async handlePaymentChargeSuccessEvent(message: PaymentChargeEvent) {
    this.logger.debug(
      `[Order-${message.orderId}]: received event Charge Payment Success`,
    );
    return this.datasource.manager.transaction(async (tx) => {
      const [order, saga] = await this.getOrderAndSagaWithLock(tx, message);

      if (!(
        order.status === OrderStatus.PAYMENT_PENDING &&
        saga.status === SagaStatus.RUNNING &&
        saga.currentStep === SagaStep.CHARGE_PAYMENT
      )) {
        return { order, saga };
      }

      order.status = OrderStatus.CONFIRMED;
      saga.status = SagaStatus.COMPLETED;
      saga.currentStep = SagaStep.COMPLETED;

      await tx.save([order, saga]);

      const event = this.createOrderConfirmedEvent(order, saga);
      await this.outboxService.createMessage(tx, ORDER_EVENT, order.id, event);
      this.logger.debug(
        `[Order-${message.orderId}]: create event order Confirmed. Create Order Done`,
      );

      return { order, saga };
    });
  }

  private createOrderConfirmedEvent(
    order: Order,
    saga: Saga,
  ): OrderConfirmedEvent {
    return {
      messageId: randomUUID(),
      occurredAt: new Date().toISOString(),
      orderId: order.id,
      payload: { orderId: order.id, customerId: order.customerId },
      sagaId: saga.id,
      type: 'event',
    };
  }

  async handlePaymentChargeFailedEvent(message: PaymentChargeEvent) {
    this.logger.debug(
      `[Order-${message.orderId}]: received event Charge Payment Failed`,
    );

    return this.datasource.manager.transaction(async (tx) => {
      const [order, saga] = await this.getOrderAndSagaWithLock(tx, message);

      if (!(
        order.status === OrderStatus.PAYMENT_PENDING &&
        saga.status === SagaStatus.RUNNING &&
        saga.currentStep === SagaStep.CHARGE_PAYMENT
      )) {
        // idempotent & late message
        return { order, saga };
      }

      saga.status = SagaStatus.COMPENSATING;
      saga.currentStep = SagaStep.RELEASE_INVENTORY;
      await tx.save([saga, order]);

      const cmd = this.createInventoryReleaseCommand(order, saga);
      await this.outboxService.createMessage(
        tx,
        INVENTORY_RELEASE_COMMAND,
        order.id,
        cmd,
      );

      this.logger.debug(
        `[Order-${message.orderId}]: Create inventory Release Command`,
      );

      return { order, saga };
    });
  }

  private createInventoryReleaseCommand(
    order: Order,
    saga: Saga,
  ): InventoryReleaseCommand {
    return {
      messageId: randomUUID(),
      occurredAt: new Date().toISOString(),
      orderId: order.id,
      payload: {
        items: order.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      },
      sagaId: saga.id,
      type: 'command',
    };
  }

  async handleInventoryReleaseSuccessEvent(
    message: InventoryReleaseSuccessEvent,
  ) {
    this.logger.debug(
      `[Order-${message.orderId}]: received event Inventort Release successful`,
    );

    return this.datasource.manager.transaction(async (tx) => {
      const [order, saga] = await this.getOrderAndSagaWithLock(tx, message);

      if (
        order.status === OrderStatus.REJECTED &&
        saga.status === SagaStatus.COMPENSATED &&
        saga.currentStep === SagaStep.COMPLETED
      ) {
        return { order, saga };
      }

      if (
        order.status !== OrderStatus.PAYMENT_PENDING ||
        saga.status !== SagaStatus.COMPENSATING ||
        saga.currentStep !== SagaStep.RELEASE_INVENTORY
      ) {
        throw new Error('Conflict: Invalid Saga state');
      }

      order.status = OrderStatus.REJECTED;
      saga.status = SagaStatus.COMPENSATED;
      saga.currentStep = SagaStep.COMPLETED;

      await tx.save([order, saga]);

      const event = this.createOrderCompensatedEvent(order, saga);
      await this.outboxService.createMessage(tx, ORDER_EVENT, order.id, event);

      this.logger.debug(
        `[Order-${message.orderId}]: create event Order Compensated`,
      );
      return { order, saga };
    });
  }
}
