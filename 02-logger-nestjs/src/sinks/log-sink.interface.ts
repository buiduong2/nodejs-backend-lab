import { LogEntry } from "../core/log-entry";

export interface LogSink {
	write(entry: LogEntry): void | Promise<void>
}
