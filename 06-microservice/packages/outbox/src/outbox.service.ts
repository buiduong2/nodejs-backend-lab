import { Injectable } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { OutboxMessage, OutboxStatus } from './outbox.entity'

@Injectable()
export class OutboxService {
	constructor() {}

	async createMessage<T>(
		tx: EntityManager,
		topic: string,
		key: string,
		value: T
	): Promise<OutboxMessage> {
		const outbox = tx.create(OutboxMessage, {
			messageKey: key,
			payload: value,
			topic
		})

		return tx.save(OutboxMessage, outbox)
	}
}

// Kafka điểm mạnh
// Load lớn - Tư tưởng partition - mở rộng consumer
// Cần biết job làm xong hay chưa
// cần biết partition đang chạy là gì. Consumer chết hay có vấn đề hệ thống biết được.
