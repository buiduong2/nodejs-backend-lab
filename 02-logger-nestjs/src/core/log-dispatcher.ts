import { LogSink } from '../sinks/log-sink.interface'
import { LogEntry } from './log-entry'
export interface LogFallback {
	log: (error: unknown) => void
}

export const logFallback:LogFallback = {log: console.error};

export class LogDispatcher {
	constructor(
		private readonly sinks: LogSink[],
		private readonly logFallback: LogFallback
	) {}

	dispatch(entry: LogEntry): void {
		for (const sink of this.sinks) {
			void Promise.resolve()
				.then(() => sink.write(entry))
				.catch(this.logFallback.log)
		}
	}
}
