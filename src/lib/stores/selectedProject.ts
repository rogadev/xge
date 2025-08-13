import { writable } from 'svelte/store';
import type { Project } from '../types/index.js';

interface SelectedProjectState {
  project: Project | null;
  isOpen: boolean;
  previousFocusElement: HTMLElement | null;
}

const initialState: SelectedProjectState = {
  project: null,
  isOpen: false,
  previousFocusElement: null
};

function createSelectedProjectStore() {
  const { subscribe, set, update } = writable<SelectedProjectState>(initialState);

  return {
    subscribe,
    select: (project: Project) => {
      // Store the currently focused element for focus restoration
      const previousFocusElement = document.activeElement as HTMLElement;

      update(state => ({
        ...state,
        project,
        isOpen: true,
        previousFocusElement
      }));
    },
    close: () => {
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
          project: null,
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
