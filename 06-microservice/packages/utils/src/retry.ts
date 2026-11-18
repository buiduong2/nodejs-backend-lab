import { sleep } from './sleep'

export interface RetryOptions {
	maxAttempts: number
	shouldRetry?: (error: unknown) => boolean
	delayMs?: number
	backoffMultiplier?: number
}

export async function retry<T>(
	callback: () => Promise<T>,
	options: RetryOptions
): Promise<T> {
	const {
		maxAttempts,
		shouldRetry,
		delayMs,
		backoffMultiplier,
	} = fullfilRetryOption(options)



	if (!Number.isInteger(maxAttempts) || maxAttempts < 1) {
		throw new Error('maxAttempts must be >= 1')
	}

	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		try {
			return await callback()
		} catch (error) {
			if (attempt === maxAttempts - 1 || !shouldRetry(error)) {
				throw error
			}

			const delay = delayMs * backoffMultiplier ** attempt

			await sleep(delay)
		}
	}

	throw new Error('Unreachable')
}

export function createDefaultRetry(): Required<RetryOptions> {
	return {
		maxAttempts: 3,
		backoffMultiplier: 2,
		delayMs: 1000,
		shouldRetry: () => true
	}
}

export function fullfilRetryOption(
	options: Partial<RetryOptions>
): Required<RetryOptions> {
	const {
		backoffMultiplier: _backoffMultiplier,
		maxAttempts: _maxAttempts,
		delayMs: _delayMs,
		shouldRetry: _shouldRetry
	} = createDefaultRetry()
	const { backoffMultiplier, maxAttempts, delayMs, shouldRetry } = options

	return {
		backoffMultiplier: backoffMultiplier ?? _backoffMultiplier,
		delayMs: delayMs ?? _delayMs,
		maxAttempts: maxAttempts ?? _maxAttempts,
		shouldRetry: shouldRetry ?? _shouldRetry
	}
}
