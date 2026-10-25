import { Injectable } from "@nestjs/common";
import { LogEntry, LogSink } from "nest-logging";

@Injectable()
export class FailingTestSink implements LogSink {
  write(entry: LogEntry): void {
    throw new Error(`Sink failed: ${entry.message}`);
  }
}