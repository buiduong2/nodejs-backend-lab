import { ClientKafka, KafkaContext } from '@nestjs/microservices'
import { isRetryableDatabaseError, retry, RetryOptions } from '@saga/utils'
import { firstValueFrom } from 'rxjs'
import { createDeadLetterMessage } from './create-dl-msg.js'

export type Options<TMessage> = {
	message: TMessage
	context: KafkaContext
	client: ClientKafka
	dlqTopic: string
	getMessageKey: (message: TMessage) => string
	retry?: RetryOptions
	onMovedToDlq?: () => void
}

export async function handleKafkaMessage<TMessage, TResult>(
	callback: () => Promise<TResult>,
	options: Options<TMessage>
) {
	const {
		message,
		context,
		client,
		getMessageKey,
		retry: retryOptions,
		dlqTopic: dqlTopic,
		onMovedToDlq: afterPublishedDqMsg
	} = options
	const {
		maxAttempts = 3,
		backoffMultiplier = 2,
		delayMs = 1000,
		shouldRetry = isRetryableDatabaseError
	} = retryOptions ?? {}

	try {
		await retry(() => callback(), {
			maxAttempts,
			backoffMultiplier,
			delayMs,
			shouldRetry
		})
	} catch (error) {
		await firstValueFrom(
			client.emit(dqlTopic, {
				key: getMessageKey(message),
				value: createDeadLetterMessage(error, message, context)
			})
		)
		afterPublishedDqMsg?.()
	}
}
