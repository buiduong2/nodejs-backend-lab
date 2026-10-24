import { Injectable, NestMiddleware } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { LogContext } from '../context/log-context'

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
	constructor(private readonly logContext: LogContext) {}
	use(req: any, res: any, next: (error?: any) => void) {
		const requestId = randomUUID()
		this.logContext.run({ requestId }, next)
	}
}
