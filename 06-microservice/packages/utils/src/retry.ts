export interface RetryOptions {
  maxAttempts: number;
  shouldRetry?: (error: unknown) => boolean;
  delayMs?: number;
  backoffMultiplier?: number;
}

export async function retry<T>(
  callback: () => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  const {
    maxAttempts,
    shouldRetry = () => false,
    delayMs = 1000,
    backoffMultiplier = 2,
  } = options;

  if (!Number.isInteger(maxAttempts) || maxAttempts < 1) {
    throw new Error('maxAttempts must be >= 1');
  }

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await callback();
    } catch (error) {
      if (
        attempt === maxAttempts - 1 ||
        !shouldRetry(error)
      ) {
        throw error;
      }

      const delay = delayMs * backoffMultiplier ** attempt;

      await sleep(delay);
    }
  }

  throw new Error('Unreachable');
}

export function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}



//  try {
//     return await callback();
//   } catch (error) {
//     if (
//       currentAttempt >= maxAttempts ||
//       !shouldRetry(error)
//     ) {
//       throw error;
//     }

//     const delay =
//       delayMs * backoffMultiplier ** (currentAttempt - 1);

//     await new Promise<void>((resolve) => {
//       setTimeout(resolve, delay);
//     });

//     return retry(callback, options, currentAttempt + 1);
//   }