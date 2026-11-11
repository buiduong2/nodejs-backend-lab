import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ReservationStatus {
  RESERVED = 'RESERVED',
  RELEASED = 'RELEASED',
  CONFIRMED = 'CONFIRMED',
}

@Entity()
export class ProductReservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  orderId: string;

  @Column()
  sagaId: string;

  @Column('json')
  items: ProductreservationItem[];

  @Column({ type: 'enum', enum: ReservationStatus, nullable: false })
  status: ReservationStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

export class ProductreservationItem {
  productId: string;
  quantity: number;
}
