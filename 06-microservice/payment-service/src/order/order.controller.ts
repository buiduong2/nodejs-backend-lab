import { Body, Controller, Param, Post } from '@nestjs/common';
import { Ctx, EventPattern, Payload } from '@nestjs/microservices';
import { OrderService } from './order.service';
import { PAYMENT_CHARGE_COMMAND, PAYMENT_CHARGE_COMMAND_DLQ } from '@saga/contracts';
import { type PaymentChargeCommand } from '@saga/contracts';
import { KafkaReliable } from '@saga/messaging';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @EventPattern(PAYMENT_CHARGE_COMMAND)
  @KafkaReliable<PaymentChargeCommand>({
    dlqTopic: PAYMENT_CHARGE_COMMAND_DLQ,
    backoffMultiplier: 2,
    delayMs: 1000,
    maxAttempts: 3,
    clientToken: 'ORDER_SAGA_PRODUCER',
    getMessageKey: (msg) => msg.orderId,
  })
  async handlePaymentChargeCommand(
    @Payload() message: PaymentChargeCommand,
    @Ctx() context: unknown,
  ) {
    await this.orderService.handlePaymentChargeCommand(message);
  }

  @Post(':id/charge-payment')
  async chargePayment(
    @Param('id') id: string,
    @Body() body: { action: 'pay' | 'reject' },
  ) {
    await this.orderService.chargePayment(id, body.action);
  }
}
