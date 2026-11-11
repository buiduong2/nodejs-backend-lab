import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}
export enum OrderStatus {
  PENDING = 'PENDING',
  RESERVING_STOCK = 'RESERVING_STOCK',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED', // Outof stock
  CANCELLED = 'CANCELLED', // payment failed
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerId: string;

  @Column('jsonb')
  items: OrderItem[];

  @Column({ type: 'bigint' })
  totalAmount: string;

  @Column({
    type: 'enum',
    default: OrderStatus.PENDING,
    enumName: 'order_status',
    enum: OrderStatus,
  })
  status: OrderStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
