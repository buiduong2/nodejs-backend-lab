import { Controller } from '@nestjs/common';
import {
  Ctx,
  KafkaContext,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';
import { INVENTORY_RESERVE_EVENT } from './saga.topic';
import {
  type InventoryReservationEvent,
  type ReservationResult,
} from '../kafka/kafka.type';
import { SagaService } from './saga.service';

@Controller('saga')
export class SagaController {
  constructor(private readonly sagaService: SagaService) {}

  @MessagePattern(INVENTORY_RESERVE_EVENT)
  handleInventoryReserveEvent(
    @Payload() message: InventoryReservationEvent,
    @Ctx() context: unknown,
  ) {
    // const kafkaContext = context as KafkaContext;

    if (message.payload.success) {
      this.sagaService.handleInventoryReserveSuccess(message);
    } else {
      this.sagaService.handleInventoryReserveFailed(message);
    }
  }
}
