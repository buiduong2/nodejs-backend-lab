import { Injectable } from "@nestjs/common";
import { LogFallback } from "nest-logging/";

@Injectable()
export class TestFallback implements LogFallback {
  log(error: unknown): void {
    console.error('[CUSTOM FALLBACK]', error);
  }
}