import { Injectable } from '@nestjs/common';
import { LogEntry, LogSink } from 'nest-logging';

@Injectable()
export class FirstTestSink implements LogSink {
  write(entry: LogEntry): void {
    console.log('[SINK 1]', entry.message);
  }
}
