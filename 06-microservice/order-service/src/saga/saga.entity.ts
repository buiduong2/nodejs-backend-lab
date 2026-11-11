import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { Order } from '../order/order.entity';

export enum SagaStep {
  RESERVE_INVENTORY = 'RESERVE_INVENTORY',
  CHARGE_PAYMENT = 'CHARGE_PAYMENT',
  RELEASE_INVENTORY = 'RELEASE_INVENTORY',
  COMPLETED = 'COMPLETED',
}

export enum SagaStatus {
  RUNNING = 'RUNNING',
  COMPENSATING = 'COMPENSATING',
  COMPLETED = 'COMPLETED',
  COMPENSATED = 'COMPENSATED',
  FAILED = 'FAILED',
}

@Entity('saga')
export class Saga {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Order, (order) => order.id)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column({ type: 'uuid', unique: true })
  orderId: string;

  @Column({
    type: 'enum',
    enum: SagaStep,
    nullable: true,
  })
  currentStep: SagaStep | null;

  @Column({ type: 'enum', enum: SagaStatus, default: SagaStatus.RUNNING })
  status: SagaStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @VersionColumn()
  version: number;
}
