import type { LogLevel } from './log-level'

export interface LogEntry {
	timestamp: Date
	level: LogLevel
	loggerName: string
	message: string

	mdc: Record<string, unknown>
	attributes: Record<string, unknown>

	error?: {
		name: string
		message: string
		stack?: string
	}
}
