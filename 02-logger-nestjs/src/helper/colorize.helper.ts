import { LogLevel } from "../core/log-level"

const colors = {
	debug: 90,
	info: 32,
	warn: 33,
	error: 31
} as const

export function colorize(text: string, level: LogLevel): string {
	return `\x1b[${colors[level]}m${text}\x1b[0m`
}
