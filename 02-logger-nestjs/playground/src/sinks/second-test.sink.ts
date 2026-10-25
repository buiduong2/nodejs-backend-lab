import { Injectable } from '@nestjs/common';
import { LogEntry, LogSink } from 'nest-logging';

@Injectable()
export class SecondTestSink implements LogSink {
  write(entry: LogEntry): void {
    console.log('[SINK 2]', entry.message);
  }
}