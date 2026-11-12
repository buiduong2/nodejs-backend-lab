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

@Injectable()
export class SagaService {
  private readonly logger = new Logger(SagaService.name);

  constructor(
    @Inject('ORDER_SAGA_PRODUCER') private kafkaClient: ClientKafka,
    private readonly datasource: DataSource,
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

  async publishReserveInventoryMessage(order: Order, saga: Saga) {
    const reserveInventoryCmd: ReserveInventoryCommand = {
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

    await firstValueFrom(
      this.kafkaClient.emit<ReserveInventoryCommand>(
        INVENTORY_RESERVE_COMMAND,
        { key: order.id, value: reserveInventoryCmd },
      ),
    );
  }

  async handleInventoryReserveFailed(payload: InventoryReserveFailedEvent) {
    this.logger.debug(
      `[Order-${payload.orderId}]: received event ReservationInventory Failed`,
    );
    const { shouldPublish, order, saga } =
      await this.datasource.manager.transaction(async (tx) => {
        const [order, saga] = await this.getOrderAndSagaWithLock(tx, payload);

        if (!(
          order.status === OrderStatus.RESERVING_STOCK &&
          saga.status === SagaStatus.RUNNING &&
          saga.currentStep === SagaStep.RESERVE_INVENTORY
        )) {
          // idempotent & late message
          return { shouldPublish: false, order, saga };
        }

        order.status = OrderStatus.REJECTED;
        saga.status = SagaStatus.COMPENSATED;
        saga.currentStep = SagaStep.COMPLETED;

        await tx.save([order, saga]);
        return { shouldPublish: true, order, saga };
      });

    if (!shouldPublish) return;

    await this.publishOrderCompensatedEvent(order, saga);

    this.logger.debug(
      `[Order-${payload.orderId}]: published OrderCompensatedEvent`,
    );
  }

  async publishOrderCompensatedEvent(order: Order, saga: Saga) {
    const message: OrderCompensatedEvent = {
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

    await firstValueFrom(
      this.kafkaClient.emit(ORDER_EVENT, { key: order.id, value: message }),
    );
  }

  async handleInventoryReserveSuccess(payload: InventoryReservateSuccessEvent) {
    this.logger.debug(
      `[Order-${payload.orderId}]: received event ReservationInventory Success`,
    );
    const { order, shouldPublish, saga } =
      await this.datasource.manager.transaction(async (tx) => {
        const [order, saga] = await this.getOrderAndSagaWithLock(tx, payload);

        if (!(
          order.status === OrderStatus.RESERVING_STOCK &&
          saga.status === SagaStatus.RUNNING &&
          saga.currentStep === SagaStep.RESERVE_INVENTORY
        )) {
          // idempotent & late message
          return { shouldPublish: false, order, saga };
        }

        order.status = OrderStatus.PAYMENT_PENDING;
        saga.currentStep = SagaStep.CHARGE_PAYMENT;

        await tx.save([order, saga]);
        return { shouldPublish: true, order, saga };
      });

    if (!shouldPublish) return;
    await this.publishPaymentChargeCommand(order, saga);
    this.logger.debug(
      `[Order-${payload.orderId}]: publish Command Paymetn Charge`,
    );
  }

  async publishPaymentChargeCommand(order: Order, saga: Saga) {
    const message: PaymentChargeCommand = {
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
    await firstValueFrom(
      this.kafkaClient.emit(PAYMENT_CHARGE_COMMAND, {
        key: order.id,
        value: message,
      }),
    );
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
    const { shouldPublish, order, saga } =
      await this.datasource.manager.transaction(async (tx) => {
        const [order, saga] = await this.getOrderAndSagaWithLock(tx, message);

        if (!(
          order.status === OrderStatus.PAYMENT_PENDING &&
          saga.status === SagaStatus.RUNNING &&
          saga.currentStep === SagaStep.CHARGE_PAYMENT
        )) {
          return { shouldPublish: false, order, saga };
        }

        order.status = OrderStatus.CONFIRMED;
        saga.status = SagaStatus.COMPLETED;
        saga.currentStep = SagaStep.COMPLETED;

        await tx.save([order, saga]);

        return { shouldPublish: true, order, saga };
      });

    if (!shouldPublish) return;

    await this.publishOrderConfirmedEvent(order, saga);
    this.logger.debug(
      `[Order-${message.orderId}]: publish event order Confirmed. Create Order Done`,
    );
  }

  async publishOrderConfirmedEvent(order: Order, saga: Saga) {
    const event: OrderConfirmedEvent = {
      messageId: randomUUID(),
      occurredAt: new Date().toISOString(),
      orderId: order.id,
      payload: { orderId: order.id, customerId: order.customerId },
      sagaId: saga.id,
      type: 'event',
    };

    await firstValueFrom(
      this.kafkaClient.emit(ORDER_EVENT, { key: order.id, value: event }),
    );
  }

  async handlePaymentChargeFailedEvent(message: PaymentChargeEvent) {
    this.logger.debug(
      `[Order-${message.orderId}]: received event Charge Payment Failed`,
    );

    const { order, saga, shouldPublish } =
      await this.datasource.manager.transaction(async (tx) => {
        const [order, saga] = await this.getOrderAndSagaWithLock(tx, message);

        if (!(
          order.status === OrderStatus.PAYMENT_PENDING &&
          saga.status === SagaStatus.RUNNING &&
          saga.currentStep === SagaStep.CHARGE_PAYMENT
        )) {
          // idempotent & late message
          return { order, saga, shouldPublish: false };
        }

        saga.status = SagaStatus.COMPENSATING;
        saga.currentStep = SagaStep.RELEASE_INVENTORY;

        await tx.save([saga, order]);

        return { order, saga, shouldPublish: true };
      });

    if (!shouldPublish) return;

    await this.publishInventoryReleaseCommand(order, saga);

    this.logger.debug(
      `[Order-${message.orderId}]: Publish command Release Command`,
    );
  }

  async publishInventoryReleaseCommand(order: Order, saga: Saga) {
    const command: InventoryReleaseCommand = {
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

    await firstValueFrom(
      this.kafkaClient.emit(INVENTORY_RELEASE_COMMAND, {
        key: order.id,
        value: command,
      }),
    );
  }

  async handleInventoryReleaseSuccessEvent(
    message: InventoryReleaseSuccessEvent,
  ) {
    this.logger.debug(
      `[Order-${message.orderId}]: received event Inventort Release successful`,
    );

    const { order, saga, shouldPublish } =
      await this.datasource.manager.transaction(async (tx) => {
        const [order, saga] = await this.getOrderAndSagaWithLock(tx, message);

        if (
          order.status === OrderStatus.REJECTED &&
          saga.status === SagaStatus.COMPENSATED &&
          saga.currentStep === SagaStep.COMPLETED
        ) {
          return { shouldPublish: false, order, saga };
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
        return { shouldPublish: true, order, saga };
      });

    if (!shouldPublish) return;

    await this.publishOrderCompensatedEvent(order, saga);

    this.logger.debug(
      `[Order-${message.orderId}]: publish event Order Compensated`,
    );
  }
}
