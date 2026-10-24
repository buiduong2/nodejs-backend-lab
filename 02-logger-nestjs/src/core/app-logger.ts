import { LogContext } from '../context/log-context'
import { LogDispatcher } from './log-dispatcher'
import { LogEntry } from './log-entry'
import { LogLevel, LogLevelPoint } from './log-level'


export class AppLogger {
	constructor(
		private readonly loggerName: string,
		private readonly logContext: LogContext,
		private readonly dispatcher: LogDispatcher,
		private readonly minLevel: LogLevel
	) {}

	debug(message: string, attributes?: Record<string, unknown>): void {
		this.log('debug', message, attributes)
	}

	info(message: string, attributes?: Record<string, unknown>): void {
		this.log('info', message, attributes)
	}

	warn(message: string, attributes?: Record<string, unknown>): void {
		this.log('warn', message, attributes)
	}

	error(
		message: string,
		attributes?: Record<string, unknown>,
		error?: Error
	): void {
		this.log('error', message, attributes, error)
	}

	private log(
		level: LogLevel,
		message: string,
		attributes?: Record<string, unknown>,
		error?: Error
	) {
		if (this.isLogLevelEnable(level, this.minLevel)) {
			const entry: LogEntry = {
				attributes: attributes ?? {},
				level,
				loggerName: this.loggerName,
				mdc: { ...this.logContext.get() },
				message,
				timestamp: new Date(),
				error: error && {
					message: error.message,
					name: error.name,
					stack: error.stack
				}
			}

			this.dispatcher.dispatch(entry)
		}
	}

	private isLogLevelEnable(level: LogLevel, minLevel: LogLevel): boolean {
		return LogLevelPoint[level] >= LogLevelPoint[minLevel]
	}
}
