import { LogFormatter } from '../log-sink.interface'

export const jsonFormatter: LogFormatter = entry => JSON.stringify(entry)
