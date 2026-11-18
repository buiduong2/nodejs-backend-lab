const RETRYABLE_DB_CODES = new Set(['40001', '40P01', '08001', '08006'])

export function isRetryableDatabaseError(error: unknown): boolean {
	if (!error || typeof error !== 'object') {
		return false
	}

	const candidate = error as {
		name?: unknown
		driverError?: {
			code?: unknown
		}
	}

	if (candidate.name !== 'QueryFailedError') {
		return false
	}

	const code = candidate.driverError?.code

	return typeof code === 'string' && RETRYABLE_DB_CODES.has(code)
}
