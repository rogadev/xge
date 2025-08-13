/**
 * Utility functions for the XGE Climate Explorer
 */

// Re-export validation utilities
export {
  VALID_IMPACT_CATEGORIES,
  VALID_REGIONS,
  type ValidationError as ValidationErrorInterface,
  type ValidationResult,
  validateProject,
  validateProjects,
  validateProjectUrl,
  validateISODate,
  isValidProject,
  safeParseProjects
} from './validation.js';

// Re-export error handling utilities
export {
  ProjectDataError,
  ValidationError as ValidationErrorClass,
  MapError,
  ErrorSeverity,
  type ErrorInfo,
  createErrorInfo,
  handleError,
  getUserFriendlyMessage,
  withErrorHandling,
  withSyncErrorHandling
} from './errors.js';
