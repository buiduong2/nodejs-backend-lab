import { SetMetadata } from '@nestjs/common';
import { AUDIT_LOG_OPERATION } from './audit.constrant';

export const LOG_ACTION = 'LOG_ACTION';
export interface LogActionOption {
  operation: AUDIT_LOG_OPERATION;
  entity: string;
  entityIdSource: 'body' | 'params' | 'query' | 'headers' | 'return';
  entityIdPath: string;
}
export const LogAction = (option: LogActionOption) =>
  SetMetadata(LOG_ACTION, option);
