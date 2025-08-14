/**
 * Error handling utilities for the XGE Project Explorer
 */

/**
 * Custom error types for the application
 */
export class ProjectDataError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'ProjectDataError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string, public value?: unknown) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class MapError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'MapError';
  }
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Structured error information
 */
export interface ErrorInfo {
  message: string;
  severity: ErrorSeverity;
  timestamp: Date;
  context?: Record<string, unknown>;
  cause?: Error;
}

/**
 * Creates a structured error info object
 */
export function createErrorInfo(
  message: string,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  context?: Record<string, unknown>,
  cause?: Error
): ErrorInfo {
  return {
    message,
    severity,
    timestamp: new Date(),
    context,
    cause
  };
}

/**
 * Safely handles errors with logging and user-friendly messages
 */
export function handleError(error: unknown, context?: string): ErrorInfo {
  let message: string;
  let severity: ErrorSeverity;
  let cause: Error | undefined;

  if (error instanceof ProjectDataError) {
    message = `Project data error: ${error.message}`;
    severity = ErrorSeverity.HIGH;
    cause = error.cause;
  } else if (error instanceof ValidationError) {
    message = `Validation error: ${error.message}`;
    severity = ErrorSeverity.MEDIUM;
  } else if (error instanceof MapError) {
    message = `Map error: ${error.message}`;
    severity = ErrorSeverity.HIGH;
    cause = error.cause;
  } else if (error instanceof Error) {
    message = error.message;
    severity = ErrorSeverity.MEDIUM;
    cause = error;
  } else {
    message = 'An unknown error occurred';
    severity = ErrorSeverity.MEDIUM;
  }

  const errorInfo = createErrorInfo(
    message,
    severity,
    context ? { context } : undefined,
    cause
  );

  // Log error for debugging
  console.error('Error handled:', errorInfo);

  return errorInfo;
}

/**
 * Gets user-friendly error messages
 */
export function getUserFriendlyMessage(error: ErrorInfo): string {
  switch (error.severity) {
    case ErrorSeverity.CRITICAL:
      return 'A critical error occurred. Please refresh the page and try again.';
    case ErrorSeverity.HIGH:
      return 'Something went wrong. Please try again in a moment.';
    case ErrorSeverity.MEDIUM:
      return 'There was an issue processing your request. Please try again.';
    case ErrorSeverity.LOW:
      return 'A minor issue occurred, but you can continue using the application.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Wraps async functions with error handling
 */
export function withErrorHandling<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      const errorInfo = handleError(error, context);
      throw new Error(getUserFriendlyMessage(errorInfo));
    }
  };
}

/**
 * Wraps sync functions with error handling
 */
export function withSyncErrorHandling<T extends unknown[], R>(
  fn: (...args: T) => R,
  context?: string
) {
  return (...args: T): R => {
    try {
      return fn(...args);
    } catch (error) {
      const errorInfo = handleError(error, context);
      throw new Error(getUserFriendlyMessage(errorInfo));
    }
  };
}
