import { LogEntry } from '../core/log-entry'
import { LogFormatter, LogSink } from './log-sink.interface'

export class ConsoleSink implements LogSink {
	constructor(private readonly formatter: LogFormatter) {
		if (!this.formatter) {
			throw new Error('Formatter not found')
		}
	}

	write(entry: LogEntry): void | Promise<void> {
		process.stdout.write(this.formatter(entry) + '\n')
	}
}
