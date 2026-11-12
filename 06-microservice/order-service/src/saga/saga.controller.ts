import { Controller } from '@nestjs/common';
import {
  Ctx,
  KafkaContext,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';
import {
  INVENTORY_RELEASE_EVENT,
  INVENTORY_RESERVE_EVENT,
  PAYMENT_CHARGE_EVENT,
} from './saga.topic';
import {
  type PaymentChargeEvent,
  type PaymentChargePayload,
  type InventoryReservationEvent,
  type ReservationResult,
  type InventoryReleaseSuccessEvent,
} from '../kafka/kafka.type';
import { SagaService } from './saga.service';

@Controller('saga')
export class SagaController {
  constructor(private readonly sagaService: SagaService) {}

  @MessagePattern(INVENTORY_RESERVE_EVENT)
  async handleInventoryReserveEvent(
    @Payload() message: InventoryReservationEvent,
    @Ctx() context: unknown,
  ) {
    // const kafkaContext = context as KafkaContext;

    if (message.payload.success) {
      await this.sagaService.handleInventoryReserveSuccess(message);
    } else {
      await this.sagaService.handleInventoryReserveFailed(message);
    }
  }

  @MessagePattern(PAYMENT_CHARGE_EVENT)
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

  @MessagePattern(INVENTORY_RELEASE_EVENT)
  async handleInventoryReleaseEvent(
    @Payload() message: InventoryReleaseSuccessEvent,
    @Ctx() context: unknown,
  ) {
    await this.sagaService.handleInventoryReleaseSuccessEvent(message);
  }
}
