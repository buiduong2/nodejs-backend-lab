import { Inject, Injectable } from '@nestjs/common';
import { PaymentChargeCommand, PaymentChargeEvent } from '@saga/contracts';
import { PaymentService } from '../payment/payment.service';
import { DataSource } from 'typeorm';
import { Payment, PaymentStatus } from '../payment/payment.entity';
import { ClientKafka } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import { PAYMENT_CHARGE_EVENT } from '@saga/contracts';
import { firstValueFrom } from 'rxjs';
import { OutboxService } from '@saga/outbox';

@Injectable()
export class OrderService {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly dataSource: DataSource,
    @Inject('ORDER_SAGA_PRODUCER')
    private client: ClientKafka,
    private outboxService:OutboxService
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

  async chargePayment(orderId: string, action: 'pay' | 'reject') {
    await this.dataSource.manager.transaction(async (tx) => {
      const payment = await this.paymentService.charge(orderId, action);

      const event: PaymentChargeEvent = {
        messageId: randomUUID(),
        occurredAt: new Date().toISOString(),
        orderId: payment.orderId,
        payload: {
          paymentId: payment.id,
          success: payment.status === PaymentStatus.SUCCESS,
        },
        sagaId: payment.sagaId,
        type: 'event',
      };

      await this.outboxService.createMessage(
        tx,
        PAYMENT_CHARGE_EVENT,
        payment.orderId,
        event,
      );
    });
  }
}
