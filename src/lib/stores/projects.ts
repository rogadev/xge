import { writable, derived } from 'svelte/store';
import type { Project } from '../types/index.js';
import { projects } from '../data/projects.js';
import { handleError } from '../utils/errors.js';

interface FilterState {
  region: string | null;
  impactCategory: string | null;
}

interface ProjectsState {
  allProjects: Project[];
  filters: FilterState;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

const initialState: ProjectsState = {
  allProjects: [],
  filters: {
    region: null,
    impactCategory: null
  },
  isLoading: false,
  error: null,
  lastUpdated: null
};

function createProjectsStore() {
  const { subscribe, set, update } = writable<ProjectsState>(initialState);

  // Derived store for filtered projects
  const filteredProjects = derived(
    { subscribe },
    ($state) => {
      let filtered = $state.allProjects;

      // Apply region filter
      if ($state.filters.region) {
        filtered = filtered.filter(project => project.region === $state.filters.region);
      }

      // Apply impact category filter
      if ($state.filters.impactCategory) {
        filtered = filtered.filter(project => project.impactCategory === $state.filters.impactCategory);
      }

      return filtered;
    }
  );

  return {
    subscribe,
    filteredProjects,

    // Data loading methods
    loadProjects: async () => {
      try {
        update(state => ({ ...state, isLoading: true, error: null }));

        // Simulate async loading (replace with actual API call if needed)
        await new Promise(resolve => setTimeout(resolve, 100));

        // Validate projects data
        if (!Array.isArray(projects)) {
          throw new Error('Invalid projects data format');
        }

        // Validate each project
        const validProjects = projects.filter(project => {
          if (!project.id || !project.title || !project.coordinates) {
            console.warn('Skipping invalid project:', project);
            return false;
          }
          return true;
        });

        update(state => ({
          ...state,
          allProjects: validProjects,
          isLoading: false,
          error: null,
          lastUpdated: new Date()
        }));

      } catch (error) {
        const errorInfo = handleError(error, 'Projects Loading');
        update(state => ({
          ...state,
          allProjects: [],
          isLoading: false,
          error: errorInfo.message,
          lastUpdated: null
        }));
      }
    },

    // Filter methods
    updateFilters: (filters: FilterState) => {
      update(state => ({
        ...state,
        filters: { ...filters }
      }));
    },
    setRegionFilter: (region: string | null) => {
      update(state => ({
        ...state,
        filters: {
          ...state.filters,
          region
        }
      }));
    },
    setImpactCategoryFilter: (impactCategory: string | null) => {
      update(state => ({
        ...state,
        filters: {
          ...state.filters,
          impactCategory
        }
      }));
    },
    clearFilters: () => {
      update(state => ({
        ...state,
        filters: {
          region: null,
          impactCategory: null
        }
      }));
    },

    // Utility methods
    clearError: () => {
      update(state => ({ ...state, error: null }));
    },
    reset: () => {
      set(initialState);
    }
  };
}

export const projectsStore = createProjectsStore();
