import { Body, Controller, Param, Post } from '@nestjs/common';
import { Ctx, MessagePattern, Payload } from '@nestjs/microservices';
import { PAYMENT_CHARGE_COMMAND } from './saga.topic';
import { type PaymentChargeCommand } from './saga.type';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {

    

  constructor(private readonly orderService: OrderService) {}

  @MessagePattern(PAYMENT_CHARGE_COMMAND)
  handlePaymentChargeCommand(
    @Payload() message: PaymentChargeCommand,
    @Ctx() context: unknown,
  ) {

    this.orderService.handlePaymentChargeCommand(message);
  }

  @Post(':id/charge-payment')
  chargePayment(
    @Param('id') id: string,
    @Body() body: { action: 'pay' | 'reject' },
  ) {
    this.orderService.chargePayment(id, body.action);
  }
}
