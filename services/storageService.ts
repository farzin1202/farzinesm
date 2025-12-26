
import { AppState, User } from "../types";
import { INITIAL_STATE } from "../constants";

const USER_REGISTRY_KEY = 'fx_users_registry';
const DATA_PREFIX = 'fx_data_';
const SESSION_ACTIVE_KEY = 'fx_session_user';

interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  password?: string; // Optional for Google-auth simulated users
  avatarUrl?: string;
}

export const storageService = {
  /**
   * Get all registered users (for auth check)
   */
  getRegistry: (): RegisteredUser[] => {
    try {
      const data = localStorage.getItem(USER_REGISTRY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Registry corrupted, resetting:", e);
      return [];
    }
  },

  /**
   * Register a new user
   */
  registerUser: (user: RegisteredUser): boolean => {
    try {
      const registry = storageService.getRegistry();
      if (registry.find(u => u.email.toLowerCase() === user.email.toLowerCase())) {
          return false; // User exists
      }
      registry.push(user);
      localStorage.setItem(USER_REGISTRY_KEY, JSON.stringify(registry));
      
      // Initialize empty DB for this user
      // CRITICAL FIX: Set isOnboardingComplete to true so they don't see it again after login
      const initialState: AppState = {
          ...INITIAL_STATE,
          user: { ...user, rememberMe: true }, // Hydrate user into state
          settings: {
              ...INITIAL_STATE.settings,
              isOnboardingComplete: true // Assume onboarding is done if they reached auth and signed up
          }
      };
      storageService.saveState(initialState);
      return true;
    } catch (e) {
      console.error("Failed to register user:", e);
      return false;
    }
  },

  /**
   * Load specific user state by ID with error recovery
   */
  loadUserState: (userId: string): AppState => {
    try {
      const key = `${DATA_PREFIX}${userId}`;
      const stored = localStorage.getItem(key);
      if (!stored) return INITIAL_STATE;
      
      return JSON.parse(stored);
    } catch (e) {
      console.error(`Failed to load data for user ${userId}. Data might be corrupted.`, e);
      // Optional: Backup corrupted data just in case
      try {
         const key = `${DATA_PREFIX}${userId}`;
         const corrupted = localStorage.getItem(key);
         if (corrupted) localStorage.setItem(`${key}_corrupt_bk`, corrupted);
      } catch {}
      
      return INITIAL_STATE;
    }
  },

  /**
   * Main load function called by AppProvider
   */
  loadState: (): AppState => {
    try {
      // Check if there is an active session
      const currentUserId = sessionStorage.getItem(SESSION_ACTIVE_KEY) || localStorage.getItem(SESSION_ACTIVE_KEY);
      
      if (currentUserId) {
        const state = storageService.loadUserState(currentUserId);
        
        // Ensure the state has the user object (recovery logic)
        if (!state.user || state.user.id !== currentUserId) {
            const registry = storageService.getRegistry();
            const regUser = registry.find(u => u.id === currentUserId);
            if (regUser) {
                state.user = { ...regUser, rememberMe: true };
            } else {
                // If user not in registry, invalid session
                storageService.clearSession();
                return INITIAL_STATE;
            }
        }
        return state;
      }
      
      return INITIAL_STATE;
    } catch (e) {
      console.error("Failed to load global state", e);
      return INITIAL_STATE;
    }
  },

  /**
   * Save state to the specific user's bucket
   */
  saveState: (state: AppState): void => {
    try {
      if (!state.user || !state.user.id) return; // Don't save if no user logged in
      
      const key = `${DATA_PREFIX}${state.user.id}`;
      const serializedState = JSON.stringify(state);
      localStorage.setItem(key, serializedState);

      // Handle Session Persistence
      if (state.user.rememberMe) {
          localStorage.setItem(SESSION_ACTIVE_KEY, state.user.id);
          sessionStorage.setItem(SESSION_ACTIVE_KEY, state.user.id);
      } else {
          localStorage.removeItem(SESSION_ACTIVE_KEY);
          sessionStorage.setItem(SESSION_ACTIVE_KEY, state.user.id);
      }

    } catch (e) {
      console.error("Failed to save state (Quota exceeded?)", e);
    }
  },

  /**
   * Logout cleanup
   */
  clearSession: (): void => {
    localStorage.removeItem(SESSION_ACTIVE_KEY);
    sessionStorage.removeItem(SESSION_ACTIVE_KEY);
  }
};
