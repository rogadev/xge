import { writable } from 'svelte/store';
import type { Map as MapboxMap } from 'mapbox-gl';

interface MapState {
  instance: MapboxMap | null;
  isLoaded: boolean;
  error: string | null;
}

const initialState: MapState = {
  instance: null,
  isLoaded: false,
  error: null
};

function createMapStore() {
  const { subscribe, set, update } = writable<MapState>(initialState);

  return {
    subscribe,
    setInstance: (map: MapboxMap) => {
      update(state => ({
        ...state,
        instance: map,
        error: null
      }));
    },
    setLoaded: (loaded: boolean) => {
      update(state => ({
        ...state,
        isLoaded: loaded
      }));
    },
    setError: (error: string | null) => {
      update(state => ({
        ...state,
        error,
        isLoaded: false
      }));
    },
    reset: () => {
      set(initialState);
    }
  };
}

export const mapStore = createMapStore();
