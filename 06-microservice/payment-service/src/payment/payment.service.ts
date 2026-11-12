import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PaymentChargeCommand } from '@saga/contracts';
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

  async charge(orderId: string, action: 'pay' | 'reject'): Promise<Payment> {
    return this.paymentRepository.manager.transaction(async (tx) => {
      const payment = await tx.findOne(Payment, {
        where: { orderId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      const targetStatus =
        action === 'pay' ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;

      // Duplicate: trạng thái đã đúng với action
      if (payment.status === targetStatus) {
        return payment;
      }

     
      if (payment.status !== PaymentStatus.PENDING) {
        throw new ConflictException(
          `Payment already finalized as ${payment.status}`,
        );
      }

      payment.status = targetStatus;

      return tx.save(Payment, payment);
    });
  }
}
