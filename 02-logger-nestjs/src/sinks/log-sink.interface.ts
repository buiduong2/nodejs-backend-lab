import { LogEntry } from "../core/log-entry";


export type LogFormatter = (entry: LogEntry) => string;

export interface LogSink {
	write(entry: LogEntry): void | Promise<void>
}
