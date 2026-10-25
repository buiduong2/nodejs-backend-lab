export interface ApplicationLog {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  loggerName: string;
  message: string;
  service: string;
  environment: 'development' | 'staging' | 'production';

  mdc: {
    requestId: string;
    traceId?: string;
    userId?: string;
  };

  attributes: {
    http?: {
      method: string;
      path: string;
      statusCode: number;
      durationMs: number;
    };

    error?: {
      code: string;
      type: string;
      retryable: boolean;
      resolved?: boolean;
    };

    tags?: string[];
  };

  reviewedAt?: Date;
}