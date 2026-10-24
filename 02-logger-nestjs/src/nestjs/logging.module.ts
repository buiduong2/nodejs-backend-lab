import { DynamicModule, Module, Provider } from '@nestjs/common'
import { LogContext } from '../context/log-context'
import { LogDispatcher, LogFallback, logFallback } from '../core/log-dispatcher'
import { ConsoleSink } from '../sinks/console.sink'
import { coloredTextFormatter } from '../sinks/formatters/colored-text.formatter'
import { LogSink } from '../sinks/log-sink.interface'
import { LoggingOptions } from './logging-options'
import {
    LOG_FALLBACK_TOKEN,
    LOG_MIN_LEVEL,
    LOG_SINKS_TOKEN
} from './logging.tokens'
import { NestLogger } from './nest-logger'

@Module({})
export class LoggingModule {
	/**
	 * Cấu hình LoggingModule và khởi tạo các thành phần logging.
	 *
	 * @param options Cấu hình mức log, Sink và xử lý lỗi.
	 */
	static forRoot(options: LoggingOptions): DynamicModule {
		const {
			sinks: sinkTokens,
			level,
			sinkErrorLog: sinkErrorLogToken,
			imports = [],
			providers = []
		} = options

		const logFallbackProvider: Provider = sinkErrorLogToken
			? {
					provide: LOG_FALLBACK_TOKEN,
					useExisting: sinkErrorLogToken
				}
			: {
					provide: LOG_FALLBACK_TOKEN,
					useValue: logFallback
				}

		const fallbackSinkProviders: Provider[] = [
			{
				provide: LOG_SINKS_TOKEN,
				useFactory: (): LogSink[] => [
					new ConsoleSink(coloredTextFormatter)
				]
			}
		]

		const providedSinkProviders: Provider[] = [
			{
				provide: LOG_SINKS_TOKEN,
				useFactory: (...sinks: LogSink[]): LogSink[] => sinks,
				inject: sinkTokens
			}
		]

		const sinkProviders: Provider[] = sinkTokens
			? providedSinkProviders
			: fallbackSinkProviders

		const dispatcherProvider: Provider = {
			provide: LogDispatcher,
			useFactory: (
				sinks: LogSink[],
				fallback: LogFallback
			): LogDispatcher => new LogDispatcher(sinks, fallback),
			inject: [LOG_SINKS_TOKEN, LOG_FALLBACK_TOKEN]
		}
		return {
			module: LoggingModule,
			global: true,
			providers: [
				NestLogger,
				LogContext,
				logFallbackProvider,
				...sinkProviders,
				...providers,
				dispatcherProvider,
				{
					provide: LOG_MIN_LEVEL,
					useValue: level ?? 'info'
				}
			],
			exports: [NestLogger, LogContext],
			imports
		}
	}
}
