/**
 * Core data types for the XGE Climate Explorer application
 */

import type { Map as MapboxMap } from 'mapbox-gl';

export interface Project {
  id: string;
  title: string;
  description: string;
  impactCategory:
  | 'renewable-energy'
  | 'conservation'
  | 'sustainable-agriculture'
  | 'waste-management';
  region: 'north-america'; // All projects are Canadian
  coordinates: [number, number]; // [longitude, latitude]
  url?: string; // HTTPS external reference
  verified?: boolean; // True if vetted
  source?: string; // Organization or program name
  dateVerified?: string; // ISO date (YYYY-MM-DD)
}

export interface MapState {
  instance: MapboxMap | null;
  isLoaded: boolean;
  error: string | null;
}

export interface FilterState {
  region: string | null;
  impactCategory: string | null;
}

export interface MapStore {
  instance: MapboxMap | null;
  isLoaded: boolean;
  error: string | null;
  setInstance: (map: MapboxMap) => void;
  setLoaded: (loaded: boolean) => void;
  setError: (error: string | null) => void;
}

export interface ProjectsStore {
  allProjects: Project[];
  filteredProjects: Project[];
  updateFilters: (filters: FilterState) => void;
}

export interface SelectedProjectStore {
  project: Project | null;
  isOpen: boolean;
  select: (project: Project) => void;
  close: () => void;
}

export interface FiltersStore {
  region: string | null;
  impactCategory: string | null;
  setRegion: (region: string | null) => void;
  setImpactCategory: (category: string | null) => void;
  clear: () => void;
}
