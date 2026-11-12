import { Inject, Injectable } from '@nestjs/common'
import { ClientKafka } from '@nestjs/microservices'
import { Cron, CronExpression } from '@nestjs/schedule'
import { DataSource } from 'typeorm'
import { OutboxMessage, OutboxStatus } from './outbox.entity'
import { firstValueFrom } from 'rxjs'

function getSimpleHash(str) {
	let hash = 0
	for (let i = 0; i < str.length; i++) {
		hash = (hash << 5) - hash + str.charCodeAt(i)
		hash |= 0 // Chuyển đổi thành số nguyên 32-bit
	}
	return Math.abs(hash) // Lấy giá trị dương cho an toàn
}

@Injectable()
export class OutboxPublisher {
	private readonly batchSize = 100
	private readonly lockKey: number

	constructor(
		@Inject('producer') private client: ClientKafka,
		@Inject('LOCK_KEY')
		outboxLockKey: string,
		private datasource: DataSource
	) {
		this.lockKey = getSimpleHash(outboxLockKey)
	}

	@Cron(CronExpression.EVERY_SECOND, { waitForCompletion: true })
	async handleCronPublishEvent() {
		await this.datasource.manager.transaction(async tx => {
			const [{ acquired }] = await tx.query(
				`SELECT pg_try_advisory_xact_lock($1) AS acquired`,
				[this.lockKey]
			)

			if (!acquired) {
				return
			}

			const messages = await tx
				.createQueryBuilder(OutboxMessage, 'o')
				.where(`o.status = :status`, { status: OutboxStatus.PENDING })
				.andWhere(`(o.nextRetryAt IS NULL OR o.nextRetryAt <= NOW())`)
				.orderBy('o.createdAt', 'ASC')
				.limit(this.batchSize)
				.setLock('pessimistic_write')
				.getMany()

			for (const msg of messages) {
				let publishError: unknown = null

				try {
					await firstValueFrom(
						this.client.emit(msg.topic, {
							key: msg.messageKey,
							value: msg.payload
						})
					)
				} catch (error) {
					publishError = error
				}

				if (publishError !== null) {
					msg.attempts++

					msg.status = OutboxStatus.PENDING
					msg.nextRetryAt = new Date(Date.now() + 3000)

					await tx.save(msg)

					break
				}

				msg.status = OutboxStatus.PUBLISHED
				msg.publishedAt = new Date()
				msg.nextRetryAt = null

				await tx.save(msg)
			}
		})
	}
}
