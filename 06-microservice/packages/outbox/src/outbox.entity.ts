import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn
} from 'typeorm'

export enum OutboxStatus {
	PENDING = 'PENDING',
	PROCESSING = 'PROCESSING',
	PUBLISHED = 'PUBLISHED',
	FAILED = 'FAILED'
}

@Entity()
export class OutboxMessage {
	@PrimaryGeneratedColumn('uuid')
	id!: string

	@Column()
	topic!: string

	@Column()
	messageKey!: string

	@Column('jsonb')
	payload: any

	@Column({ enum: OutboxStatus, default: OutboxStatus.PENDING })
	status!: OutboxStatus

	@Column({ default: 0 })
	attempts!: number

	@CreateDateColumn({ type: 'timestamptz' })
	createdAt!: Date

	@Column({
		type: 'timestamptz',
		nullable: true
	})
	publishedAt!: Date | null

	@Column({
		type: 'timestamptz',
		nullable: true
	})
	nextRetryAt!: Date | null
}
