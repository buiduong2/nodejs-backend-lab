import { LogSink } from '../sinks/log-sink.interface'
import { LogEntry } from './log-entry'
type LogFallback = (error: unknown) => void
export class LogDispatcher {
	constructor(
		private readonly sinks: LogSink[],
		private readonly logFallback: LogFallback = console.error
	) {}

	dispatch(entry: LogEntry): void {
		for (const sink of this.sinks) {
			void Promise.resolve()
				.then(() => sink.write(entry))
				.catch(this.logFallback)
		}
	}
}
