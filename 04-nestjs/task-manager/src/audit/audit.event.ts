export interface ActionLog {
  action: string;
  actorId: string;
  resourceType: string;
  resourceId?: string;
  outcome: 'SUCCESS' | 'FAILED';
  timestamp: Date;
  requestId?: string;
  snapshot?: Record<string, unknown>;
  url?: string;
}
