import { colorize } from "../../helper/colorize.helper"
import { LogFormatter } from "../log-sink.interface"

export const coloredTextFormatter: LogFormatter = entry => {
	const level = colorize(entry.level.toUpperCase(), entry.level)

	return `[${entry.timestamp.toISOString()}] [${level}]  [${entry.mdc.requestId ?? '-'}] [${entry.loggerName}] ${entry.message}`
}
