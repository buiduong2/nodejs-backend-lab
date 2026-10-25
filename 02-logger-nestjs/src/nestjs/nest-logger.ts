import { Inject, Injectable,  Scope } from "@nestjs/common";
import { LOG_MIN_LEVEL } from "./logging.tokens";
import { INQUIRER } from "@nestjs/core";
import { AppLogger } from "../core/app-logger";
import { LogContext } from "../context/log-context";
import { LogDispatcher } from "../core/log-dispatcher";
import type { LogLevel } from "../core/log-level";

@Injectable({ scope: Scope.TRANSIENT })
export class NestLogger extends AppLogger {
  constructor(
    @Inject(INQUIRER)
    parent: object | undefined,
    logContext: LogContext,
    dispatcher: LogDispatcher,
    @Inject(LOG_MIN_LEVEL)
    minLevel: LogLevel,
  ) {
    super(
      parent?.constructor?.name ?? 'Application',
      logContext,
      dispatcher,
      minLevel,
    );
  }
}