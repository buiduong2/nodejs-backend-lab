import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload } from '@nestjs/microservices';
import {
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

@Controller('saga')
export class SagaController {
  constructor(private readonly sagaService: SagaService) {}

  @EventPattern(INVENTORY_RESERVE_EVENT)
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

  @EventPattern(PAYMENT_CHARGE_EVENT)
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
  async handleInventoryReleaseEvent(
    @Payload() message: InventoryReleaseSuccessEvent,
    @Ctx() context: unknown,
  ) {
    await this.sagaService.handleInventoryReleaseSuccessEvent(message);
  }
}
