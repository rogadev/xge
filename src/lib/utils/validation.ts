/**
 * Data validation utilities for the XGE Climate Explorer
 */

import type { Project } from '$lib/types';

/**
 * Valid impact categories for projects
 */
export const VALID_IMPACT_CATEGORIES = [
  'renewable-energy',
  'conservation',
  'sustainable-agriculture',
  'waste-management'
] as const;

/**
 * Valid regions for projects
 */
export const VALID_REGIONS = [
  'north-america'
] as const;

/**
 * Validation error types
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

/**
 * Result of project validation
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validates a single project object
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

  // Validate coordinates
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

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates an array of projects
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

  // Validate each project
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

  // Check for duplicate IDs
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
 * Type guard to check if an object is a valid Project
 */
export function isValidProject(obj: unknown): obj is Project {
  return validateProject(obj).isValid;
}

/**
 * Safely parses and validates project data
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
