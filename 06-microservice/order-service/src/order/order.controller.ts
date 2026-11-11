import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { Order } from './order.entity';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post()
  createOrder(@Body(new ValidationPipe({ transform: true })) body: Order) {
    const { customerId, items } = body;
    return this.orderService.createOrder({ customerId, items });
  }
}
