/**
 * @fileoverview Svelte store for managing Mapbox GL JS map instance state.
 * Handles map initialization, loading states, error conditions, and cleanup.
 * Central state management for all map-related operations across components.
 */

import { writable } from 'svelte/store';
import type { Map as MapboxMap } from 'mapbox-gl';

/**
 * Core state structure for the map store.
 * Tracks map instance, loading status, error conditions, and user interactions.
 */
interface MapState {
  /** The Mapbox GL JS map instance, null until initialized */
  instance: MapboxMap | null;
  /** Whether the map has fully loaded and is ready for use */
  isLoaded: boolean;
  /** Current error message, null when no error */
  error: string | null;
  /** Whether the user is currently interacting with the map (zooming, panning) */
  isInteracting: boolean;
}

/**
 * Public API interface for the map store.
 * Provides type-safe methods for map state management.
 */
interface MapStore {
  /** Subscribe to map state changes */
  subscribe: (callback: (state: MapState) => void) => () => void;
  /** Set the map instance and clear any existing errors */
  setInstance: (map: MapboxMap) => void;
  /** Update the loaded state of the map */
  setLoaded: (loaded: boolean) => void;
  /** Set an error message and mark map as not loaded */
  setError: (error: string | null) => void;
  /** Set the interaction state (true when user is zooming/panning) */
  setInteracting: (interacting: boolean) => void;
  /** Reset store to initial state for cleanup */
  reset: () => void;
}

/**
 * Initial state for the map store.
 * Represents uninitialized map state.
 */
const initialState: MapState = {
  instance: null,
  isLoaded: false,
  error: null,
  isInteracting: false
} as const;

/**
 * Creates the map store with methods for managing Mapbox map state.
 * Implements centralized state management for map initialization and errors.
 */
function createMapStore(): MapStore {
  const { subscribe, set, update } = writable<MapState>(initialState);

  return {
    subscribe,

    /**
     * Sets the Mapbox map instance and clears any existing errors.
     * Called when map initialization succeeds.
     */
    setInstance: (map: MapboxMap): void => {
      update(state => ({
        ...state,
        instance: map,
        error: null
      }));
    },

    /**
     * Updates the map's loaded state.
     * Called when map finishes loading or fails to load.
     */
    setLoaded: (loaded: boolean): void => {
      update(state => ({
        ...state,
        isLoaded: loaded
      }));
    },

    /**
     * Sets an error message and marks map as not loaded.
     * Automatically clears loaded state when error occurs.
     */
    setError: (error: string | null): void => {
      update(state => ({
        ...state,
        error,
        isLoaded: false
      }));
    },

    /**
     * Sets the interaction state of the map.
     * Called when user starts/stops zooming or panning.
     */
    setInteracting: (interacting: boolean): void => {
      update(state => ({
        ...state,
        isInteracting: interacting
      }));
    },

    /**
     * Resets the store to initial state.
     * Used during component cleanup and reinitialization.
     */
    reset: (): void => {
      set(initialState);
    }
  };
}

/**
 * Global map store instance for managing Mapbox GL JS state.
 * Shared across all components that need map access.
 * 
 * @example
 * ```typescript
 * import { mapStore } from '$lib/stores';
 * 
 * // Access map instance
 * const map = $mapStore.instance;
 * 
 * // Check if map is ready
 * if ($mapStore.isLoaded && !$mapStore.error) {
 *   // Map is ready for use
 * }
 * ```
 */
export const mapStore = createMapStore();
