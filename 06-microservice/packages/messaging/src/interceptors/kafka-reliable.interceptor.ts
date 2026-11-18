import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler
} from '@nestjs/common'
import { ModuleRef, Reflector } from '@nestjs/core'
import {
	catchError,
	count,
	firstValueFrom,
	from,
	max,
	Observable,
	retry,
	timer
} from 'rxjs'
import {
	KAFKA_RELIABILITY_KEY,
	KafkaReliabilityOptions
} from './kafka-reliable.decorator.js'
import { ClientKafka, KafkaContext } from '@nestjs/microservices'
import { fullfilRetryOption, isRetryableDatabaseError } from '@saga/utils'
import { createDeadLetterMessage } from '../utils/create-dl-msg.js'

@Injectable()
export class KafkaReliabilityInterceptor implements NestInterceptor {
	constructor(
		private readonly reflector: Reflector,
		private readonly moduleRef: ModuleRef
	) {}

	intercept(
		context: ExecutionContext,
		next: CallHandler
	): Observable<unknown> {
		const options = this.reflector.get<KafkaReliabilityOptions<unknown>>(
			KAFKA_RELIABILITY_KEY,
			context.getHandler()
		)
     
        
		if (!options) {
            return next.handle()
		}
		const { clientToken, dlqTopic, getMessageKey } = options
		const { maxAttempts, backoffMultiplier, delayMs } =
			fullfilRetryOption(options)

		const rpcContext = context.switchToRpc()

		const message = rpcContext.getData()
		const kafkaContext = rpcContext.getContext<KafkaContext>()

		const client = this.moduleRef.get<ClientKafka>(clientToken, {
			strict: false
		})

		return next.handle().pipe(
			retry({
				count: maxAttempts,
				delay: (error, retryCount) => {
                     console.log('[Retry]', {
							retryCount,
							errorName: error?.constructor?.name,
							retryable: isRetryableDatabaseError(error),
							driverCode: error?.driverError?.code
						})
					if (!isRetryableDatabaseError(error)) {
						throw error
					}

					const delay =
						delayMs! * backoffMultiplier! ** (retryCount - 1)

					return timer(delay)
				}
			}),
			catchError(err => {
				return from(
					firstValueFrom(
						client.emit(dlqTopic, {
							key: getMessageKey(message),
							value: createDeadLetterMessage(
								err,
								message,
								kafkaContext
							)
						})
					)
				)
			})
		)
	}
}
