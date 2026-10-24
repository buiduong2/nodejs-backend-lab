import { Inject, Injectable, Scope } from '@nestjs/common'
import { INQUIRER } from '@nestjs/core'
import { LogContext } from '../context/log-context'
import { LogDispatcher } from './log-dispatcher'
import { LogLevel, LogLevelPoint } from './log-level'
import { LogEntry } from './log-entry'
import { LOG_MIN_LEVEL } from '../constants/logging.tokens'

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger {
	private readonly loggerName: string

	constructor(
		@Inject(INQUIRER)
		private readonly parent: object | undefined,
		private readonly logContext: LogContext,
		private readonly dispatcher: LogDispatcher,
		@Inject(LOG_MIN_LEVEL)
		private readonly minLevel: LogLevel
	) {
		this.loggerName = this.parent?.constructor?.name ?? 'Application'
	}

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
