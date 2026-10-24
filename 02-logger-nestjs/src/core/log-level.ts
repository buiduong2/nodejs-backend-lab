export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export const LogLevelPoint = {
	debug: 10,
	info: 20,
	warn: 30,
	error: 40
} as const
