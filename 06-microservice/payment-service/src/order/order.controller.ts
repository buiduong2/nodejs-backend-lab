import { Body, Controller, Param, Post } from '@nestjs/common';
import { Ctx, EventPattern, Payload } from '@nestjs/microservices';
import { OrderService } from './order.service';
import { PAYMENT_CHARGE_COMMAND } from '@saga/contracts';
import { type PaymentChargeCommand } from '@saga/contracts';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @EventPattern(PAYMENT_CHARGE_COMMAND)
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
