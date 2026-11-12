import { Injectable } from '@nestjs/common'
import { EntityManager, Repository } from 'typeorm'
import { OutboxMessage, OutboxStatus } from './outbox.entity'
import { InjectRepository } from '@nestjs/typeorm'

@Injectable()
export class OutboxService {
	constructor(
		@InjectRepository(OutboxMessage)
		private readonly outboxRepository: Repository<OutboxMessage>
	) {}

	async createMessage(
		tx: EntityManager,
		topic: string,
		key: string,
		value: any
	) {
		const outbox = tx.create(OutboxMessage, {
			messageKey: key,
			payload: value,
			topic,
			attempts: 3,
			status: OutboxStatus.PENDING
		})

		return tx.save(outbox)
	}
}

// Kafka điểm mạnh
// Load lớn - Tư tưởng partition - mở rộng consumer
// Cần biết job làm xong hay chưa
// cần biết partition đang chạy là gì. Consumer chết hay có vấn đề hệ thống biết được.
