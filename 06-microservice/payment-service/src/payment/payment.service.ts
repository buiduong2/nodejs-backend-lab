import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PaymentChargeCommand } from '../order/saga.type';
import { Payment, PaymentStatus } from './payment.entity';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async create(
    tx: EntityManager,
    message: PaymentChargeCommand,
  ): Promise<Payment> {
    const raw = this.paymentRepository.create({
      amount: message.payload.totalAmount,
      orderId: message.orderId,
      sagaId: message.sagaId,
      status: PaymentStatus.PENDING,
    });

    return tx.save(raw);
  }

  async charge(orderId: string, action: string): Promise<Payment> {
    return this.paymentRepository.manager.transaction(async (tx) => {
      const payment = await tx.findOne(Payment, {
        where: { orderId: orderId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!payment) {
        throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
      }

      if (action === 'pay') {
        payment.status = PaymentStatus.SUCCESS;
      } else {
        payment.status = PaymentStatus.FAILED;
      }

      await tx.save(payment);

      return payment;
    });
  }
}
