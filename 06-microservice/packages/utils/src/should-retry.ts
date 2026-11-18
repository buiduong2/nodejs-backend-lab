import { QueryFailedError } from 'typeorm'

const RETRYABLE_DB_CODES = new Set([
	'40001', // serialization_failure
	'40P01', // deadlock_detected
	'08001', // sqlclient_unable_to_establish_sqlconnection
	'08006' // connection_failure
])

export function isRetryableDatabaseError(error: unknown): boolean {
	if (error instanceof QueryFailedError) {
		const driverError = error.driverError as {
			code?: string
		}
		return RETRYABLE_DB_CODES.has(driverError.code ?? '')
	}

    return false;
}