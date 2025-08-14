/**
 * @fileoverview Utility functions barrel export for the XGE Project Explorer.
 * Provides centralized access to all utility functions including validation,
 * error handling, data formatting, and performance optimization utilities.
 * 
 * This module aggregates utilities from specialized files to provide a clean
 * import experience while maintaining logical separation of concerns.
 * 
 * @example
 * ```typescript
 * import { 
 *   validateProject, 
 *   debounce, 
 *   handleError, 
 *   formatCoordinates 
 * } from '$lib/utils';
 * 
 * // Use validation
 * const result = validateProject(projectData);
 * 
 * // Use performance utilities
 * const debouncedFunction = debounce(expensiveOperation, 300);
 * 
 * // Use formatting helpers
 * const displayCoords = formatCoordinates([-79.3832, 43.6532]);
 * ```
 */

/* ===== VALIDATION UTILITIES ===== */
/**
 * Comprehensive validation functions for climate project data.
 * Includes type guards, business rule validation, and geographic validation.
 */
export {
  // Core validation functions
  validateProject,
  validateProjects,
  validateProjectsOptimized,

  // Type guards for TypeScript safety
  isValidProject,

  // Specialized validators
  validateProjectUrl,
  validateISODate,
  validateCanadianCoordinates,
  validateProjectForDisplay,

  // Utility functions
  safeParseProjects,
  extractUserFriendlyErrors,

  // Validation types and interfaces
  type ValidationError as ValidationErrorInterface,
  type ValidationResult,

  // Constants
  VALID_IMPACT_CATEGORIES,
  VALID_REGIONS,

  // Complete validation toolkit
  ValidationUtils
} from './validation.js';

/* ===== ERROR HANDLING UTILITIES ===== */
/**
 * Error handling utilities for robust error management across the application.
 * Includes custom error classes, error processing, and user-friendly messaging.
 */
export {
  // Custom error classes
  ProjectDataError,
  ValidationError as ValidationErrorClass,
  MapError,

  // Error severity and types
  ErrorSeverity,
  type ErrorInfo,

  // Error processing functions
  createErrorInfo,
  handleError,
  getUserFriendlyMessage,

  // Error handling wrappers
  withErrorHandling,
  withSyncErrorHandling
} from './errors.js';

/* ===== HELPER UTILITIES ===== */
/**
 * General-purpose utility functions for common operations.
 * Includes performance optimizations, formatting, and data manipulation.
 */
export {
  // Performance utilities
  debounce,

  // Formatting utilities
  formatCoordinates,
  formatImpactCategory,
  formatDate,

  // Array utilities
  uniqueBy,

  // Geographic utilities
  calculateDistance,

  // Text utilities
  truncateText
} from './helpers.js';

/* ===== ENVIRONMENT UTILITIES ===== */
/**
 * Environment configuration and validation utilities.
 * Handles environment variable validation and configuration management.
 */
export * from './env.js';

/**
 * Utility Module Architecture:
 * 
 * 1. Validation Utils: Comprehensive data validation with type safety
 *    - Project validation with business rules
 *    - Geographic coordinate validation for Canadian territories
 *    - Performance-optimized validation for large datasets
 *    - User-friendly error message generation
 * 
 * 2. Error Handling: Robust error management system
 *    - Custom error classes for different failure scenarios
 *    - Error severity classification for appropriate responses
 *    - Wrapper functions for consistent error handling patterns
 *    - User-friendly error message transformation
 * 
 * 3. Helper Functions: Performance and formatting utilities
 *    - Debouncing for performance optimization
 *    - Geographic calculations and formatting
 *    - Array manipulation and deduplication
 *    - Text processing and display formatting
 * 
 * 4. Environment: Configuration and environment management
 *    - Environment variable validation
 *    - Configuration setup for different deployment environments
 * 
 * This modular approach ensures that utilities are organized by purpose
 * while providing convenient access through a single import point.
 */
