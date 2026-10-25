import {
	DynamicModule,
	Inject,
	Module,
	OnApplicationShutdown,
	Optional,
	Provider
} from '@nestjs/common'
import { Collection, MongoClient } from 'mongodb'

import { MongoSink } from '../sinks/mongo.sink'
import { LogEntry } from '../core/log-entry'
import { MONGO_CLIENT } from './mongo.constants'

export type MongoLoggingOptions =
	| {
			collection: Collection<LogEntry>
	  }
	| {
			uri: string
			database: string
			collection: string
	  }

@Module({})
export class MongoLoggingModule implements OnApplicationShutdown {
	constructor(
		@Optional()
		@Inject(MONGO_CLIENT)
		private readonly mongoClient?: MongoClient
	) {}

	async onApplicationShutdown(signal?: string) {
		await this.mongoClient?.close()
	}
	static forRoot(option: MongoLoggingOptions): DynamicModule {
		const providers: Provider[] = []

		if ('uri' in option) {
			const { uri, collection, database } = option
			providers.push({
				provide: MONGO_CLIENT,
				useFactory: async () => {
					const mongoClient = new MongoClient(uri)
					await mongoClient.connect()
					return mongoClient
				}
			})

			providers.push({
				provide: MongoSink,
				useFactory: (mongoClient: MongoClient) =>
					new MongoSink(
						mongoClient.db(database).collection(collection)
					),
				inject: [MONGO_CLIENT]
			})
		} else {
			const { collection } = option
			providers.push({
				provide: MongoSink,
				useValue: new MongoSink(collection)
			})
		}

		return {
			module: MongoLoggingModule,
			providers,
			exports: [MongoSink]
		}
	}
}
