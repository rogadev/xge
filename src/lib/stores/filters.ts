import { writable } from 'svelte/store';
import { debounce } from '$lib/utils';

interface FilterState {
  region: string | null;
  impactCategory: string | null;
}

const initialState: FilterState = {
  region: null,
  impactCategory: null
};

function createFiltersStore() {
  const { subscribe, set, update } = writable<FilterState>(initialState);

  // Debounced update function to meet performance requirements (500ms response time)
  const debouncedUpdate = debounce((newState: FilterState) => {
    set(newState);
  }, 100); // 100ms debounce to ensure updates happen within 500ms requirement

  return {
    subscribe,
    setRegion: (region: string | null) => {
      update(state => {
        const newState = { ...state, region };
        debouncedUpdate(newState);
        return newState;
      });
    },
    setImpactCategory: (impactCategory: string | null) => {
      update(state => {
        const newState = { ...state, impactCategory };
        debouncedUpdate(newState);
        return newState;
      });
    },
    updateFilters: (filters: Partial<FilterState>) => {
      update(state => {
        const newState = { ...state, ...filters };
        debouncedUpdate(newState);
        return newState;
      });
    },
    clear: () => {
      update(state => {
        const newState = { ...initialState };
        debouncedUpdate(newState);
        return newState;
      });
    },
    reset: () => {
      set(initialState);
    }
  };
}

export const filtersStore = createFiltersStore();
