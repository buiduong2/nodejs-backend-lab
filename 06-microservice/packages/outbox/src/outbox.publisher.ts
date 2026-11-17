import { Inject, Injectable, Logger } from '@nestjs/common'
import { ClientKafka } from '@nestjs/microservices'
import { Cron, CronExpression } from '@nestjs/schedule'
import { DataSource } from 'typeorm'
import { OutboxMessage, OutboxStatus } from './outbox.entity'
import { firstValueFrom } from 'rxjs'
import { randomUUID } from 'node:crypto'
import { getErrorMessage, getSimpleHash } from './outbox.util'



@Injectable()
export class OutboxPublisher {
	private readonly batchSize = 20
	private readonly leaseDuration = 120_000
	private readonly lockKey: number
	private readonly MAX_ATTEMPS = 5
	private readonly logger = new Logger(OutboxPublisher.name)

	constructor(
		@Inject('producer') private client: ClientKafka,
		@Inject('LOCK_KEY')
		outboxLockKey: string,
		private datasource: DataSource
	) {
		this.lockKey = getSimpleHash(outboxLockKey)
	}

	/**
	 * - Batch hết lease trước khi có NextRetry At trong processing
	 * + Giảm Batch Size
	 * + Gia hạn lease
	 * + Global Disitributed Lock
	 * + Claim Theo Batch + Gia hạn Leasea
	 * +
	 * - Handle long trasactionn because of publish Msg
	 * - Handle Worker Chết sau khi claims
	 * - Duplicate work
	 * - kafka Published success but commit DB failed
	 * - Message Ordering
	 * - Batch có thể vượt quá 30 giây
	 * - Retry vô hạn
	 */
	@Cron(CronExpression.EVERY_SECOND, { waitForCompletion: true })
	async handleCronPublishEvent() {
		const claimToken = randomUUID()
		const messages = await this.datasource.manager.transaction(async tx => {
			const messages = await tx
				.createQueryBuilder(OutboxMessage, 'o')
				.where(
					`o.status = :pendingStatus AND (o.nextRetryAt IS NULL OR o.nextRetryAt <= NOW())`,
					{ pendingStatus: OutboxStatus.PENDING }
				)
				.orWhere(
					`o.status = :processingStatus AND o.nextRetryAt <= NOW()`,
					{ processingStatus: OutboxStatus.PROCESSING }
				)
				.orderBy('o.createdAt', 'ASC')
				.addOrderBy('o.id', 'ASC')
				.limit(this.batchSize)
				.setLock('pessimistic_write')
				.setOnLocked('skip_locked')
				.getMany()

			messages.forEach(msg => {
				msg.status = OutboxStatus.PROCESSING
				msg.nextRetryAt = new Date(Date.now() + this.leaseDuration)
				msg.claimToken = claimToken
			})

			return tx.save(OutboxMessage, messages)
		})

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

			const updateMsg = this.buildOutboxUpdateMessage(
				msg.attempts,
				publishError
			)

			const affected = await this.datasource
				.getRepository(OutboxMessage)
				.update(
					{
						id: msg.id,
						claimToken: claimToken,
						status: OutboxStatus.PROCESSING
					},
					updateMsg
				)

			if (affected.affected === 0) {
				this.logger.warn(
					`[Outbox-${msg.id}] Failed to finalize: claim ownership lost or status changed`
				)
			}
		}
	}

	buildOutboxUpdateMessage(
		currentAttemp: number,
		error: unknown | null
	): Partial<OutboxMessage> {
		const partialMsg: Partial<OutboxMessage> = {
			claimToken: null,
			attempts: currentAttemp + 1,
			lastError: error == null ? null : getErrorMessage(error)
		}

		if (error == null) {
			return {
				...partialMsg,
				status: OutboxStatus.PUBLISHED,
				publishedAt: new Date(),
				nextRetryAt: null
			}
		}

		if (partialMsg.attempts >= this.MAX_ATTEMPS) {
			return {
				...partialMsg,
				status: OutboxStatus.FAILED,
				nextRetryAt: null
			}
		}

		return {
			...partialMsg,
			status: OutboxStatus.PENDING,
			nextRetryAt: new Date(Date.now() + 3000)
		}
	}
}
