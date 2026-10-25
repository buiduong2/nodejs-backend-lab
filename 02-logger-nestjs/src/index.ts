export { LoggingModule } from './nestjs/logging.module'
export { NestLogger } from './nestjs/nest-logger'
export { LogContext } from './context/log-context'

export { ConsoleSink } from './sinks/console.sink'

export { textFormatter } from './sinks/formatters/text.formatter'
export { coloredTextFormatter } from './sinks/formatters/colored-text.formatter'

export type { LoggingOptions } from './nestjs/logging-options'
export type { LogSink } from './sinks/log-sink.interface'
export type { LogEntry } from './core/log-entry'
export type { LogFallback } from './core/log-dispatcher'
