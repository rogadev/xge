/**
 * @fileoverview Main library barrel export for the XGE Climate Explorer application.
 * Provides centralized access to all core functionality including types, components,
 * stores, data, and utilities. Follows the barrel export pattern for clean imports
 * and better developer experience throughout the application.
 * 
 * @example
 * ```typescript
 * // Import multiple items from the library
 * import { 
 *   MapContainer, 
 *   FilterControls, 
 *   projectsStore, 
 *   type Project,
 *   debounce 
 * } from '$lib';
 * 
 * // Use in components
 * const projects = $projectsStore.allProjects;
 * const debouncedFilter = debounce(filterFunction, 300);
 * ```
 */

/* ===== TYPE DEFINITIONS ===== */
/**
 * Core TypeScript interfaces and type definitions.
 * Includes Project interface, store types, and utility types.
 */
export * from './types/index.js';

/* ===== SVELTE COMPONENTS ===== */
/**
 * All Svelte components for the climate explorer interface.
 * Includes map components, UI controls, modals, and error boundaries.
 */
export * from './components/index.js';

/* ===== STATE MANAGEMENT ===== */
/**
 * Svelte stores for global state management.
 * Handles map state, project data, filters, and selected project state.
 */
export * from './stores/index.js';

/* ===== DATA SOURCES ===== */
/**
 * Static data and data processing utilities.
 * Contains climate project data and data transformation functions.
 */
export * from './data/index.js';

/* ===== UTILITY FUNCTIONS ===== */
/**
 * Reusable utility functions, helpers, and validation logic.
 * Includes debouncing, formatting, error handling, and environment utilities.
 */
export * from './utils/index.js';

/**
 * Library Architecture Notes:
 * 
 * 1. Barrel Exports: This file aggregates all library exports for convenient importing.
 *    Components can import everything they need from a single '$lib' import.
 * 
 * 2. Modular Design: Each export group corresponds to a logical domain:
 *    - Types: TypeScript definitions and interfaces
 *    - Components: Reusable Svelte components
 *    - Stores: Global state management
 *    - Data: Static data and processing
 *    - Utils: Pure functions and helpers
 * 
 * 3. Tree Shaking: Modern bundlers can eliminate unused exports, so comprehensive
 *    exports don't impact bundle size in production builds.
 * 
 * 4. Developer Experience: Single import location reduces cognitive load and
 *    provides IDE autocompletion for all available library functionality.
 * 
 * 5. Maintainability: Adding new exports requires only updating the specific
 *    domain's index.ts file - this barrel export stays stable.
 */
