
import { AppState } from "../types";
import { INITIAL_STATE } from "../constants";

const STORAGE_KEY = 'tradeMaster_app_state_v1';

export const storageService = {
  /**
   * Loads the application state from the persistence layer.
   */
  loadState: (): AppState => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_STATE;
    } catch (e) {
      console.error("Failed to load state from storage", e);
      return INITIAL_STATE;
    }
  },

  /**
   * Saves the application state to the persistence layer.
   */
  saveState: (state: AppState): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save state to storage", e);
    }
  },

  /**
   * Clears the persistence layer (useful for logout/reset).
   */
  clearState: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error("Failed to clear storage", e);
    }
  }
};
