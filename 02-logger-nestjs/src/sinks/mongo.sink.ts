import { Collection } from 'mongodb'
import { LogSink } from './log-sink.interface'
import { LogEntry } from '../core/log-entry'

export class MongoSink implements LogSink {
	constructor(private readonly collection: Collection<LogEntry>) {}

	async write(entry: LogEntry): Promise<void> {
		await this.collection.insertOne(entry)
	}
}
