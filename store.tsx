
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, AppAction, Trade, Strategy, MonthData, User } from './types';
import { INITIAL_STATE } from './constants';
import { storageService } from './services/storageService';

// --- Helpers ---
const generateId = () => Math.random().toString(36).substring(2, 9);

// --- Reducer ---
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOAD_STATE':
      return { 
        ...state,
        strategies: action.payload.strategies || [],
        settings: { ...state.settings, ...action.payload.settings }
      };
    
    case 'LOGIN':
      return { ...state, user: action.payload };
    
    case 'LOGOUT':
      return { ...INITIAL_STATE, user: null };

    case 'UPDATE_USER':
      if (!state.user) return state;
      return { ...state, user: { ...state.user, ...action.payload } };

    case 'SET_THEME':
      return { ...state, settings: { ...state.settings, theme: action.payload } };
    case 'SET_LANGUAGE':
      return { ...state, settings: { ...state.settings, language: action.payload } };
    case 'COMPLETE_ONBOARDING':
      return { ...state, settings: { ...state.settings, isOnboardingComplete: true } };
    
    case 'ADD_STRATEGY':
      const newStrategy: Strategy = {
        id: generateId(),
        name: action.payload,
        months: []
      };
      return { ...state, strategies: [...state.strategies, newStrategy] };

    case 'UPDATE_STRATEGY':
      return {
        ...state,
        strategies: state.strategies.map(s =>
          s.id === action.payload.id ? { ...s, ...action.payload.updates } : s
        )
      };

    case 'DELETE_STRATEGY':
      return {
        ...state,
        strategies: state.strategies.filter(s => s.id !== action.payload),
        currentStrategyId: state.currentStrategyId === action.payload ? null : state.currentStrategyId
      };

    case 'SELECT_STRATEGY':
      return { ...state, currentStrategyId: action.payload, currentMonthId: null };

    case 'ADD_MONTH': {
      if (!state.currentStrategyId) return state;
      const newMonth: MonthData = {
        id: generateId(),
        name: action.payload,
        trades: []
      };
      return {
        ...state,
        strategies: state.strategies.map(s => 
          s.id === state.currentStrategyId 
            ? { ...s, months: [...s.months, newMonth] } 
            : s
        )
      };
    }

    case 'UPDATE_MONTH':
      return {
        ...state,
        strategies: state.strategies.map(s =>
          s.id === action.payload.strategyId
            ? {
                ...s,
                months: s.months.map(m =>
                  m.id === action.payload.monthId ? { ...m, ...action.payload.updates } : m
                )
              }
            : s
        )
      };

    case 'DELETE_MONTH': {
      if (!state.currentStrategyId) return state;
      return {
        ...state,
        strategies: state.strategies.map(s => 
          s.id === state.currentStrategyId 
            ? { ...s, months: s.months.filter(m => m.id !== action.payload) } 
            : s
        ),
        currentMonthId: state.currentMonthId === action.payload ? null : state.currentMonthId
      };
    }

    case 'SELECT_MONTH':
      return { ...state, currentMonthId: action.payload };

    case 'ADD_TRADE': {
      if (!state.currentStrategyId || !state.currentMonthId) return state;

      const strategy = state.strategies.find(s => s.id === state.currentStrategyId);
      const month = strategy?.months.find(m => m.id === state.currentMonthId);
      const lastPair = month && month.trades.length > 0 
        ? month.trades[month.trades.length - 1].pair 
        : 'EURUSD';

      const newTrade: Trade = {
        id: generateId(),
        date: new Date().getDate().toString(),
        pair: lastPair,
        direction: 'Long',
        rr: 2, 
        result: 'BE',
        pips: 0,
        pnlPercent: 0,
        maxExcursionPercent: 0,
        ...action.payload
      };

      return {
        ...state,
        strategies: state.strategies.map(s => {
          if (s.id !== state.currentStrategyId) return s;
          return {
            ...s,
            months: s.months.map(m => {
              if (m.id !== state.currentMonthId) return m;
              return { ...m, trades: [...m.trades, newTrade] };
            })
          };
        })
      };
    }

    case 'UPDATE_TRADE': {
        if (!state.currentStrategyId || !state.currentMonthId) return state;
        return {
          ...state,
          strategies: state.strategies.map(s => {
            if (s.id !== state.currentStrategyId) return s;
            return {
              ...s,
              months: s.months.map(m => {
                if (m.id !== state.currentMonthId) return m;
                return {
                  ...m,
                  trades: m.trades.map(t => t.id === action.payload.id ? { ...t, ...action.payload.data } : t)
                };
              })
            };
          })
        };
      }

    case 'DELETE_TRADE': {
        if (!state.currentStrategyId || !state.currentMonthId) return state;
        return {
          ...state,
          strategies: state.strategies.map(s => {
            if (s.id !== state.currentStrategyId) return s;
            return {
              ...s,
              months: s.months.map(m => {
                if (m.id !== state.currentMonthId) return m;
                return {
                  ...m,
                  trades: m.trades.filter(t => t.id !== action.payload)
                };
              })
            };
          })
        };
    }

    default:
      return state;
  }
}

// --- Context ---
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}>({ state: INITIAL_STATE, dispatch: () => null });

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from Storage Service
  const [state, dispatch] = useReducer(appReducer, INITIAL_STATE, (initial) => {
    return storageService.loadState() || initial;
  });

  // Persistence Effect: Debounced save to storage
  useEffect(() => {
    const handler = setTimeout(() => {
        storageService.saveState(state);
    }, 1000);
    return () => clearTimeout(handler);
  }, [state]);

  // Handle Theme Effect
  useEffect(() => {
    if (state.settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.settings.theme]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
