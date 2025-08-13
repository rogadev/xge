import { writable, derived } from 'svelte/store';
import type { Project } from '../types/index.js';
import { projects } from '../data/projects.js';

interface FilterState {
  region: string | null;
  impactCategory: string | null;
}

interface ProjectsState {
  allProjects: Project[];
  filters: FilterState;
}

const initialState: ProjectsState = {
  allProjects: projects,
  filters: {
    region: null,
    impactCategory: null
  }
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
    reset: () => {
      set(initialState);
    }
  };
}

export const projectsStore = createProjectsStore();
