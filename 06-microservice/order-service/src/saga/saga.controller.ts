import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload } from '@nestjs/microservices';
import {
  INVENTORY_RELEASE_EVENT_DLQ,
  INVENTORY_RESERVE_EVENT_DLQ,
  PAYMENT_CHARGE_EVENT_DLQ,
  type InventoryReleaseSuccessEvent,
  type InventoryReservationEvent,
  type PaymentChargeEvent,
} from '@saga/contracts';
import { SagaService } from './saga.service';
import {
  INVENTORY_RELEASE_EVENT,
  INVENTORY_RESERVE_EVENT,
  PAYMENT_CHARGE_EVENT,
} from '@saga/contracts';
import { KafkaReliable } from '@saga/messaging';

@Controller('saga')
export class SagaController {
  constructor(private readonly sagaService: SagaService) {}

  @EventPattern(INVENTORY_RESERVE_EVENT)
  @KafkaReliable<InventoryReservationEvent>({
    dlqTopic: INVENTORY_RESERVE_EVENT_DLQ,
    backoffMultiplier: 2,
    delayMs: 1000,
    maxAttempts: 3,
    clientToken: 'ORDER_SAGA_PRODUCER',
    getMessageKey: (msg) => msg.orderId,
  })
  async handleInventoryReserveEvent(
    @Payload() message: InventoryReservationEvent,
    @Ctx() context: unknown,
  ) {
    if (message.payload.success) {
      await this.sagaService.handleInventoryReserveSuccess(message);
    } else {
      await this.sagaService.handleInventoryReserveFailed(message);
    }
  }

  @EventPattern(PAYMENT_CHARGE_EVENT)
  @KafkaReliable<InventoryReservationEvent>({
    dlqTopic: PAYMENT_CHARGE_EVENT_DLQ,
    backoffMultiplier: 2,
    delayMs: 1000,
    maxAttempts: 3,
    clientToken: 'ORDER_SAGA_PRODUCER',
    getMessageKey: (msg) => msg.orderId,
  })
  async handlePaymentChargeEvent(
    @Payload() message: PaymentChargeEvent,
    @Ctx() context: unknown,
  ) {
    if (message.payload.success) {
      await this.sagaService.handlePaymentChargeSuccessEvent(message);
    } else {
      await this.sagaService.handlePaymentChargeFailedEvent(message);
    }
  }

  @EventPattern(INVENTORY_RELEASE_EVENT)
  @KafkaReliable<InventoryReleaseSuccessEvent>({
    dlqTopic: INVENTORY_RELEASE_EVENT_DLQ,
    backoffMultiplier: 2,
    delayMs: 1000,
    maxAttempts: 3,
    clientToken: 'ORDER_SAGA_PRODUCER',
    getMessageKey: (msg) => msg.orderId,
  })
  async handleInventoryReleaseEvent(
    @Payload() message: InventoryReleaseSuccessEvent,
    @Ctx() context: unknown,
  ) {
    await this.sagaService.handleInventoryReleaseSuccessEvent(message);
  }
}
