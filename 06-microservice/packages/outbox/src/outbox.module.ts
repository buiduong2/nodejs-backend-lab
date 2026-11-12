import { type DynamicModule, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OutboxMessage } from './outbox.entity'
import { OutboxPublisher } from './outbox.publisher'
import { OutboxService } from './outbox.service'
import { ClientsModule, Transport } from '@nestjs/microservices'

type OutboxOptions = {
	brokers: string[]
	outboxLockKey: string
}

@Module({})
export class OutboxModule {
	static forRoot(options: OutboxOptions): DynamicModule {
		const { brokers, outboxLockKey } = options

		return {
			module: OutboxModule,
			imports: [
				TypeOrmModule.forFeature([OutboxMessage]),
				ClientsModule.register([
					{
						name: 'producer',
						transport: Transport.KAFKA,
						options: {
							client: {
								clientId: 'producer',
								brokers: brokers
							},
							producerOnlyMode: true
						}
					}
				])
			],
			global: true,
			providers: [
				{
					provide: 'LOCK_KEY',
					useValue: outboxLockKey
				},
				OutboxPublisher,
				OutboxService
			],
			exports: [OutboxService]
		}
	}
}
