/**
 * @fileoverview Core TypeScript type definitions for the XGE Project Explorer application.
 * 
 * This module contains all the primary data structures and interface definitions
 * used throughout the application, including project data models, map state management,
 * filtering capabilities, and store interfaces for state management.
 */

import type { Map as MapboxMap } from 'mapbox-gl';

/**
 * Represents a climate action project with all associated metadata.
 * 
 * @interface Project
 * @description Core data structure for environmental and climate projects
 * displayed on the interactive map. Each project contains location data,
 * categorization, and verification status.
 */
export interface Project {
  /** Unique identifier for the project */
  id: string;

  /** Human-readable project name */
  title: string;

  /** Detailed description of the project's goals and activities */
  description: string;

  /** 
   * Classification of the project's environmental impact area.
   * Limited to four predefined categories for consistent filtering.
   */
  impactCategory:
  | 'renewable-energy'
  | 'conservation'
  | 'sustainable-agriculture'
  | 'waste-management';

  /** 
   * Geographic region identifier. Currently limited to North America
   * as all projects are Canadian-based.
   */
  region: 'north-america';

  /** 
   * Geographic coordinates in [longitude, latitude] format.
   * Used for map marker positioning.
   */
  coordinates: [number, number];

  /** Optional external URL for additional project information */
  url?: string;

  /** 
   * Verification status indicating if the project has been
   * reviewed and validated by administrators.
   */
  verified?: boolean;

  /** Name of the organization or program sponsoring the project */
  source?: string;

  /** 
   * ISO 8601 date string (YYYY-MM-DD) indicating when the project
   * was last verified or validated.
   */
  dateVerified?: string;
}

/**
 * Represents the current state of the Mapbox GL map instance.
 * 
 * @interface MapState
 * @description Tracks the initialization status, instance reference,
 * and error state of the interactive map component.
 */
export interface MapState {
  /** Reference to the active Mapbox GL map instance, null if not initialized */
  instance: MapboxMap | null;

  /** Flag indicating whether the map has finished loading and is ready for interaction */
  isLoaded: boolean;

  /** Error message if map initialization failed, null if no errors */
  error: string | null;
}

/**
 * Current filter criteria applied to the project dataset.
 * 
 * @interface FilterState
 * @description Defines the active filters for narrowing down the displayed
 * projects based on geographic region and environmental impact category.
 */
export interface FilterState {
  /** Selected geographic region filter, null means no region filter applied */
  region: string | null;

  /** Selected impact category filter, null means no category filter applied */
  impactCategory: string | null;
}

/**
 * Svelte store interface for managing map state and operations.
 * 
 * @interface MapStore
 * @description Provides reactive state management for the Mapbox GL map,
 * including instance management, loading states, and error handling.
 */
export interface MapStore {
  /** Reference to the active Mapbox GL map instance */
  instance: MapboxMap | null;

  /** Flag indicating map initialization and loading status */
  isLoaded: boolean;

  /** Current error message, if any */
  error: string | null;

  /** 
   * Sets the map instance reference.
   * @param map - The initialized Mapbox GL map instance
   */
  setInstance: (map: MapboxMap) => void;

  /** 
   * Updates the map loading status.
   * @param loaded - Whether the map has finished loading
   */
  setLoaded: (loaded: boolean) => void;

  /** 
   * Sets or clears the current error state.
   * @param error - Error message or null to clear errors
   */
  setError: (error: string | null) => void;
}

/**
 * Svelte store interface for managing project data and filtering.
 * 
 * @interface ProjectsStore
 * @description Handles the complete project dataset and provides filtered
 * views based on user-selected criteria. Maintains both the original
 * dataset and the currently filtered results.
 */
export interface ProjectsStore {
  /** Complete unfiltered array of all available projects */
  allProjects: Project[];

  /** Array of projects matching current filter criteria */
  filteredProjects: Project[];

  /** 
   * Applies new filter criteria and updates the filtered projects array.
   * @param filters - The filter criteria to apply
   */
  updateFilters: (filters: FilterState) => void;
}

/**
 * Svelte store interface for managing the currently selected project.
 * 
 * @interface SelectedProjectStore
 * @description Handles the state of the project detail modal, including
 * which project is currently selected and whether the modal is open.
 */
export interface SelectedProjectStore {
  /** Currently selected project, null if no project is selected */
  project: Project | null;

  /** Flag indicating whether the project detail modal is open */
  isOpen: boolean;

  /** 
   * Selects a project and opens the detail modal.
   * @param project - The project to select and display
   */
  select: (project: Project) => void;

  /** Closes the project detail modal and clears the selection */
  close: () => void;
}

/**
 * Svelte store interface for managing filter state and operations.
 * 
 * @interface FiltersStore
 * @description Provides reactive state management for user-selected
 * filters, including region and impact category selections.
 */
export interface FiltersStore {
  /** Currently selected region filter */
  region: string | null;

  /** Currently selected impact category filter */
  impactCategory: string | null;

  /** 
   * Updates the region filter.
   * @param region - The region to filter by, or null to clear the filter
   */
  setRegion: (region: string | null) => void;

  /** 
   * Updates the impact category filter.
   * @param category - The category to filter by, or null to clear the filter
   */
  setImpactCategory: (category: string | null) => void;

  /** Clears all active filters, resetting to show all projects */
  clear: () => void;
}
