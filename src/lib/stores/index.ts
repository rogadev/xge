/**
 * Store exports for state management
 */

export { mapStore } from './map.js';
export { projectsStore } from './projects.js';
export { selectedProjectStore } from './selectedProject.js';
export { filtersStore } from './filters.js';

// Re-export types for convenience
export type { Project } from '../types/index.js';
