import { Inject, Injectable } from '@nestjs/common';
import { PaymentChargeCommand, PaymentChargeEvent } from './saga.type';
import { PaymentService } from '../payment/payment.service';
import { DataSource } from 'typeorm';
import { Payment, PaymentStatus } from '../payment/payment.entity';
import { ClientKafka } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import { PAYMENT_CHARGE_EVENT } from './saga.topic';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrderService {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly dataSource: DataSource,
    @Inject('ORDER_SAGA_PRODUCER')
    private client: ClientKafka,
  ) {}

  async handlePaymentChargeCommand(message: PaymentChargeCommand) {
    const payment = await this.dataSource.manager.transaction(async (tx) => {
      const existing = await tx.findOne(Payment, {
        where: { sagaId: message.sagaId, orderId: message.orderId },
      });

      if (existing) {
        return existing;
      }

      return this.paymentService.create(tx, message);
    });
  }

  async publishPaymentChargeEvent(payment: Payment, success: boolean) {
    const event: PaymentChargeEvent = {
      messsageId: randomUUID(),
      occurredAt: new Date().toISOString(),
      orderId: payment.orderId,
      payload: { paymentId: payment.id, success },
      sagaId: payment.sagaId,
      type: 'event',
    };

    await firstValueFrom(
      this.client.emit(PAYMENT_CHARGE_EVENT, {
        key: payment.orderId,
        value: event,
      }),
    );
  }

  async chargePayment(orderId: string, action: 'pay' | 'reject') {
    const payment = await this.paymentService.charge(orderId, action);

    await this.publishPaymentChargeEvent(
      payment,
      payment.status === PaymentStatus.SUCCESS,
    );
  }
}
