import { writable } from 'svelte/store';
import type { Project } from '../types/index.js';

interface SelectedProjectState {
  selectedProject: Project | null;
  isOpen: boolean;
  previousFocusElement: HTMLElement | null;
}

const initialState: SelectedProjectState = {
  selectedProject: null,
  isOpen: false,
  previousFocusElement: null
};

function createSelectedProjectStore() {
  const { subscribe, set, update } = writable<SelectedProjectState>(initialState);

  return {
    subscribe,
    selectProject: (project: Project) => {
      // Store the currently focused element for focus restoration
      const previousFocusElement = document.activeElement as HTMLElement;

      update(state => ({
        ...state,
        selectedProject: project,
        isOpen: true,
        previousFocusElement
      }));
    },
    closeModal: () => {
      update(state => {
        // Restore focus to the previously focused element
        if (state.previousFocusElement) {
          // Use setTimeout to ensure the modal is fully closed before restoring focus
          setTimeout(() => {
            state.previousFocusElement?.focus();
          }, 0);
        }

        return {
          ...state,
          selectedProject: null,
          isOpen: false,
          previousFocusElement: null
        };
      });
    },
    reset: () => {
      set(initialState);
    }
  };
}

export const selectedProjectStore = createSelectedProjectStore();
