import { LogFormatter } from '../log-sink.interface'

export const textFormatter: LogFormatter = entry =>
	`[${entry.timestamp.toISOString()}] [${entry.level}] [${entry.loggerName}] ${entry.message}`
