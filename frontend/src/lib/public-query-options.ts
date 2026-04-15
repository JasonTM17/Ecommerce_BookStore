import { isAxiosError } from "axios";

const RETRYABLE_HTTP_STATUS = new Set([429, 502, 503, 504]);
const MAX_PUBLIC_WARMUP_RETRIES = 3;

export const publicWarmupQueryOptions = {
  retry(failureCount: number, error: unknown) {
    if (failureCount >= MAX_PUBLIC_WARMUP_RETRIES) {
      return false;
    }

    if (!isAxiosError(error)) {
      return false;
    }

    if (!error.response) {
      return true;
    }

    return (
      RETRYABLE_HTTP_STATUS.has(error.response.status) ||
      error.response.status >= 500
    );
  },
  retryDelay(attemptIndex: number) {
    return Math.min(1500 * 2 ** attemptIndex, 8000);
  },
} as const;
