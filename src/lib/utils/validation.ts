/**
 * @fileoverview Comprehensive validation utilities for climate project data in the XGE Climate Explorer.
 * 
 * This module provides enterprise-grade validation for project objects to ensure data integrity
 * and business rule compliance before processing. Features include individual project validation,
 * bulk validation with detailed error tracking, type guards for TypeScript safety, and
 * geographic coordinate validation for mapping accuracy.
 * 
 * The validation system implements a defensive programming approach where invalid data
 * is caught early with descriptive error messages to aid debugging and data quality assurance.
 * 
 * @author XGE Climate Explorer Team
 * @version 1.0.0
 */

import type { Project } from '$lib/types';

/**
 * Supported impact categories for climate projects.
 * Limited to these categories to maintain data consistency and enable proper filtering.
 * @readonly
 */
export const VALID_IMPACT_CATEGORIES = [
  'renewable-energy',
  'conservation',
  'sustainable-agriculture',
  'waste-management'
] as const;

/**
 * Supported geographic regions for projects.
 * Currently limited to North America but designed for future expansion.
 * @readonly
 */
export const VALID_REGIONS = [
  'north-america'
] as const;

/**
 * Represents a validation error with context about the specific field and issue.
 * @interface ValidationError
 */
export interface ValidationError {
  /** The field path that failed validation (e.g., 'coordinates[0]', 'projects[1].title') */
  field: string;
  /** Human-readable description of the validation failure */
  message: string;
  /** The actual value that failed validation, included for debugging purposes */
  value?: unknown;
}

/**
 * Contains the results of a validation operation with detailed error information.
 * @interface ValidationResult
 */
export interface ValidationResult {
  /** Whether all validation checks passed */
  isValid: boolean;
  /** Array of validation errors, empty if validation passed */
  errors: ValidationError[];
}

/**
 * Validates project URLs to ensure they use secure HTTPS protocol.
 * Only HTTPS URLs are accepted to maintain security standards for external links.
 * 
 * @param url - The URL string to validate
 * @returns True if the URL is valid and uses HTTPS protocol
 */
export function validateProjectUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validates ISO date strings and ensures they represent real past dates.
 * Prevents future dates since project verification can only occur in the past.
 * 
 * @param dateString - ISO date string in YYYY-MM-DD format
 * @returns True if the date is valid, properly formatted, and not in the future
 */
export function validateISODate(dateString: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }

  const date = new Date(dateString);
  const now = new Date();

  // Ensure the date is valid, not in the future, and matches the original string
  // The final check prevents dates like '2023-02-30' from being accepted
  return date instanceof Date &&
    !isNaN(date.getTime()) &&
    date <= now &&
    date.toISOString().slice(0, 10) === dateString;
}

/**
 * Validates a complete project object against all business rules.
 * Performs comprehensive validation including required fields, data types,
 * value ranges, and business logic constraints (e.g., verified projects
 * must have supporting documentation).
 * 
 * @param project - The project object to validate (accepts unknown for type safety)
 * @returns Validation result with detailed error information
 */
export function validateProject(project: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  // Check if project is an object
  if (!project || typeof project !== 'object') {
    return {
      isValid: false,
      errors: [{ field: 'project', message: 'Project must be an object', value: project }]
    };
  }

  const proj = project as Record<string, unknown>;

  // Validate id
  if (!proj.id || typeof proj.id !== 'string' || proj.id.trim().length === 0) {
    errors.push({
      field: 'id',
      message: 'Project id must be a non-empty string',
      value: proj.id
    });
  }

  // Validate title
  if (!proj.title || typeof proj.title !== 'string' || proj.title.trim().length === 0) {
    errors.push({
      field: 'title',
      message: 'Project title must be a non-empty string',
      value: proj.title
    });
  }

  // Validate description
  if (!proj.description || typeof proj.description !== 'string' || proj.description.trim().length === 0) {
    errors.push({
      field: 'description',
      message: 'Project description must be a non-empty string',
      value: proj.description
    });
  }

  // Validate impactCategory
  if (!proj.impactCategory || !VALID_IMPACT_CATEGORIES.includes(proj.impactCategory as any)) {
    errors.push({
      field: 'impactCategory',
      message: `Impact category must be one of: ${VALID_IMPACT_CATEGORIES.join(', ')}`,
      value: proj.impactCategory
    });
  }

  // Validate region
  if (!proj.region || !VALID_REGIONS.includes(proj.region as any)) {
    errors.push({
      field: 'region',
      message: `Region must be one of: ${VALID_REGIONS.join(', ')}`,
      value: proj.region
    });
  }

  // Coordinates must be in [longitude, latitude] format for mapping libraries
  if (!Array.isArray(proj.coordinates)) {
    errors.push({
      field: 'coordinates',
      message: 'Coordinates must be an array',
      value: proj.coordinates
    });
  } else if (proj.coordinates.length !== 2) {
    errors.push({
      field: 'coordinates',
      message: 'Coordinates must be an array of exactly 2 numbers [longitude, latitude]',
      value: proj.coordinates
    });
  } else {
    const [lng, lat] = proj.coordinates;

    // Validate longitude
    if (typeof lng !== 'number' || lng < -180 || lng > 180) {
      errors.push({
        field: 'coordinates[0]',
        message: 'Longitude must be a number between -180 and 180',
        value: lng
      });
    }

    // Validate latitude
    if (typeof lat !== 'number' || lat < -90 || lat > 90) {
      errors.push({
        field: 'coordinates[1]',
        message: 'Latitude must be a number between -90 and 90',
        value: lat
      });
    }
  }

  // Validate optional URL
  if (proj.url !== undefined) {
    if (typeof proj.url !== 'string' || !validateProjectUrl(proj.url)) {
      errors.push({
        field: 'url',
        message: 'URL must be a valid HTTPS URL',
        value: proj.url
      });
    }
  }

  // Business rule: verified projects must have supporting documentation
  if (proj.verified !== undefined) {
    if (typeof proj.verified !== 'boolean') {
      errors.push({
        field: 'verified',
        message: 'Verified must be a boolean',
        value: proj.verified
      });
    } else if (proj.verified === true) {
      // Verified projects require complete documentation for credibility
      if (!proj.url) {
        errors.push({
          field: 'url',
          message: 'URL is required when verified is true'
        });
      }

      if (!proj.source || typeof proj.source !== 'string' || proj.source.trim().length === 0) {
        errors.push({
          field: 'source',
          message: 'Source is required when verified is true',
          value: proj.source
        });
      }

      if (!proj.dateVerified || typeof proj.dateVerified !== 'string' || !validateISODate(proj.dateVerified)) {
        errors.push({
          field: 'dateVerified',
          message: 'Valid ISO date (YYYY-MM-DD) is required when verified is true',
          value: proj.dateVerified
        });
      }
    }
  }

  // Validate optional source
  if (proj.source !== undefined && (typeof proj.source !== 'string' || proj.source.trim().length === 0)) {
    errors.push({
      field: 'source',
      message: 'Source must be a non-empty string when provided',
      value: proj.source
    });
  }

  // Validate optional dateVerified
  if (proj.dateVerified !== undefined && (typeof proj.dateVerified !== 'string' || !validateISODate(proj.dateVerified))) {
    errors.push({
      field: 'dateVerified',
      message: 'Date verified must be a valid ISO date (YYYY-MM-DD) when provided',
      value: proj.dateVerified
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates an array of projects with comprehensive error tracking.
 * Performs individual project validation plus collection-level checks
 * like duplicate ID detection to ensure data integrity across the dataset.
 * 
 * @param projects - Array of project objects to validate
 * @returns Validation result with indexed error paths for debugging
 */
export function validateProjects(projects: unknown[]): ValidationResult {
  const errors: ValidationError[] = [];

  if (!Array.isArray(projects)) {
    return {
      isValid: false,
      errors: [{ field: 'projects', message: 'Projects must be an array', value: projects }]
    };
  }

  if (projects.length === 0) {
    errors.push({
      field: 'projects',
      message: 'Projects array cannot be empty'
    });
  }

  // Validate each project individually with indexed error paths
  projects.forEach((project, index) => {
    const result = validateProject(project);
    if (!result.isValid) {
      result.errors.forEach(error => {
        errors.push({
          ...error,
          field: `projects[${index}].${error.field}`,
          message: `Project ${index}: ${error.message}`
        });
      });
    }
  });

  // Ensure unique project IDs to prevent data conflicts
  const ids = new Set<string>();
  projects.forEach((project, index) => {
    if (project && typeof project === 'object' && 'id' in project) {
      const id = (project as { id: unknown; }).id;
      if (typeof id === 'string') {
        if (ids.has(id)) {
          errors.push({
            field: `projects[${index}].id`,
            message: `Duplicate project ID: ${id}`,
            value: id
          });
        } else {
          ids.add(id);
        }
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Type guard function to safely check if an unknown object is a valid Project.
 * Useful for TypeScript type narrowing and runtime type checking.
 * 
 * @param obj - Object to check
 * @returns True if the object satisfies all Project validation rules
 */
export function isValidProject(obj: unknown): obj is Project {
  return validateProject(obj).isValid;
}

/**
 * Validates geographic coordinates to ensure they fall within Canadian territory boundaries.
 * Uses approximate bounding box for Canada to validate project location accuracy.
 * 
 * @param coordinates - Coordinate tuple in [longitude, latitude] format
 * @returns True if coordinates fall within Canadian geographic boundaries
 * 
 * @example
 * ```typescript
 * validateCanadianCoordinates([-79.3832, 43.6532]); // Toronto - true
 * validateCanadianCoordinates([-74.0060, 40.7128]); // New York - false
 * ```
 */
export function validateCanadianCoordinates(coordinates: [number, number]): boolean {
  const [longitude, latitude] = coordinates;

  // Canadian bounding box (approximate)
  const CANADA_BOUNDS = {
    minLng: -141.0,  // Western boundary (Yukon)
    maxLng: -52.6,   // Eastern boundary (Newfoundland)
    minLat: 41.7,    // Southern boundary (Southern Ontario)
    maxLat: 83.1     // Northern boundary (Northern islands)
  } as const;

  return longitude >= CANADA_BOUNDS.minLng &&
    longitude <= CANADA_BOUNDS.maxLng &&
    latitude >= CANADA_BOUNDS.minLat &&
    latitude <= CANADA_BOUNDS.maxLat;
}

/**
 * Validates that a project has all required fields for public display.
 * More stringent than basic validation - ensures projects are ready for user consumption.
 * 
 * @param project - Project object to validate for display readiness
 * @returns True if project has all fields needed for public display
 */
export function validateProjectForDisplay(project: Project): boolean {
  // Basic validation must pass first
  if (!isValidProject(project)) {
    return false;
  }

  // Additional display requirements
  return project.title.length >= 5 &&           // Meaningful title
    project.description.length >= 20 &&     // Adequate description
    validateCanadianCoordinates(project.coordinates); // Valid Canadian location
}

/**
 * Extracts and summarizes validation errors for user-friendly display.
 * Converts technical validation errors into readable messages for end users.
 * 
 * @param validationResult - Result from validation functions
 * @returns Array of user-friendly error messages
 */
export function extractUserFriendlyErrors(validationResult: ValidationResult): string[] {
  return validationResult.errors.map(error => {
    // Convert technical field paths to user-friendly descriptions
    const fieldDisplayName = error.field
      .replace(/^projects\[\d+\]\./, '')
      .replace(/\[\d+\]/, '')
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase()
      .replace(/^./, str => str.toUpperCase());

    return `${fieldDisplayName}: ${error.message}`;
  });
}

/**
 * Validates project data with performance optimization for large datasets.
 * Uses early exit strategies and optimized checks for bulk validation scenarios.
 * 
 * @param projects - Array of projects to validate
 * @param options - Validation options for performance tuning
 * @returns Validation result with performance metrics
 */
export function validateProjectsOptimized(
  projects: unknown[],
  options: {
    /** Stop validation after first N errors for faster feedback */
    maxErrors?: number;
    /** Skip expensive validation checks for performance */
    skipExpensiveChecks?: boolean;
  } = {}
): ValidationResult & { validatedCount: number; } {
  const errors: ValidationError[] = [];
  const { maxErrors = Infinity, skipExpensiveChecks = false } = options;
  let validatedCount = 0;

  if (!Array.isArray(projects)) {
    return {
      isValid: false,
      errors: [{ field: 'projects', message: 'Projects must be an array', value: projects }],
      validatedCount: 0
    };
  }

  // Early exit for performance
  for (let index = 0; index < projects.length && errors.length < maxErrors; index++) {
    const project = projects[index];
    validatedCount++;

    // Quick validation checks first
    if (!project || typeof project !== 'object') {
      errors.push({
        field: `projects[${index}]`,
        message: 'Project must be an object',
        value: project
      });
      continue;
    }

    // Skip expensive validation if requested
    if (!skipExpensiveChecks) {
      const result = validateProject(project);
      if (!result.isValid) {
        result.errors.forEach(error => {
          if (errors.length < maxErrors) {
            errors.push({
              ...error,
              field: `projects[${index}].${error.field}`,
              message: `Project ${index}: ${error.message}`
            });
          }
        });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    validatedCount
  };
}

/**
 * Safely parses and validates project data with comprehensive error handling.
 * Throws descriptive errors for debugging while preventing invalid data
 * from propagating through the application.
 * 
 * @param data - Raw data to parse as projects array
 * @returns Validated array of Project objects
 * @throws {Error} When validation fails with detailed error information
 */
export function safeParseProjects(data: unknown): Project[] {
  try {
    if (!Array.isArray(data)) {
      throw new Error('Data is not an array');
    }

    const validationResult = validateProjects(data);

    if (!validationResult.isValid) {
      const errorMessages = validationResult.errors.map(e => `${e.field}: ${e.message}`).join('; ');
      throw new Error(`Project validation failed: ${errorMessages}`);
    }

    return data as Project[];
  } catch (error) {
    console.error('Failed to parse project data:', error);
    throw new Error(`Invalid project data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validation utility exports for easy access and testing.
 * Provides a comprehensive validation toolkit for the XGE Climate Explorer.
 */
export const ValidationUtils = {
  /** Core validation functions */
  validateProject,
  validateProjects,
  validateProjectsOptimized,

  /** Type guards */
  isValidProject,

  /** Specialized validators */
  validateProjectUrl,
  validateISODate,
  validateCanadianCoordinates,
  validateProjectForDisplay,

  /** Utility functions */
  safeParseProjects,
  extractUserFriendlyErrors,

  /** Constants */
  VALID_IMPACT_CATEGORIES,
  VALID_REGIONS
} as const;
