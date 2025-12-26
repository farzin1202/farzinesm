
export type Direction = 'Long' | 'Short';
export type Result = 'Win' | 'Loss' | 'BE';

export interface Trade {
  id: string;
  date: string; // Stores Day number (e.g., "1", "15")
  pair: string;
  direction: Direction;
  rr: number;
  result: Result;
  pips: number;
  pnlPercent: number;
  maxExcursionPercent?: number; // Only for Wins
  notes?: string;
}

export interface MonthData {
  id: string;
  name: string; // e.g., "January 2024"
  trades: Trade[];
  notes?: string;
  aiAnalysis?: string;
}

export interface Strategy {
  id: string;
  name: string;
  months: MonthData[];
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  rememberMe?: boolean;
}

export interface AppState {
  user: User | null;
  strategies: Strategy[];
  currentStrategyId: string | null;
  currentMonthId: string | null;
  settings: {
    theme: 'light' | 'dark';
    language: 'en' | 'fa';
    isOnboardingComplete: boolean;
    apiKey?: string;
  };
}

export type AppAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_LANGUAGE'; payload: 'en' | 'fa' }
  | { type: 'SET_API_KEY'; payload: string }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'ADD_STRATEGY'; payload: string }
  | { type: 'UPDATE_STRATEGY'; payload: { id: string; updates: Partial<Strategy> } }
  | { type: 'DELETE_STRATEGY'; payload: string }
  | { type: 'SELECT_STRATEGY'; payload: string | null }
  | { type: 'ADD_MONTH'; payload: string }
  | { type: 'UPDATE_MONTH'; payload: { strategyId: string; monthId: string; updates: Partial<MonthData> } }
  | { type: 'DELETE_MONTH'; payload: string }
  | { type: 'SELECT_MONTH'; payload: string | null }
  | { type: 'ADD_TRADE'; payload: Partial<Trade> }
  | { type: 'UPDATE_TRADE'; payload: { id: string; data: Partial<Trade> } }
  | { type: 'DELETE_TRADE'; payload: string }
  | { type: 'LOAD_STATE'; payload: AppState };

export interface Translations {
  welcomeTitle: string;
  welcomeSubtitle: string;
  getStarted: string;
  strategies: string;
  addStrategy: string;
  newStrategyName: string;
  months: string;
  addMonth: string;
  newMonthName: string;
  back: string;
  winRate: string;
  netProfit: string;
  totalGain: string;
  totalLoss: string;
  totalTrades: string;
  equityCurve: string;
  tradeLog: string;
  date: string;
  day: string;
  pair: string;
  dir: string;
  rr: string;
  result: string;
  pnl: string;
  pips: string;
  maxExcursion: string;
  actions: string;
  addTrade: string;
  delete: string;
  cancel: string;
  save: string;
  notes: string;
  notesPlaceholder: string;
  aiAnalysis: string;
  askAi: string;
  analyzing: string;
  viewAnalysis: string;
  close: string;
  signOut: string;
  profile: string;
  theme: string;
  language: string;
  apiKeyLabel: string;
  apiKeyPlaceholder: string;
  apiKeyHelp: string;
  confirmDeleteTitle: string;
  confirmDeleteStrategyMsg: string;
  confirmDeleteMonthMsg: string;
  confirmDeleteAction: string;
  chooseAccount: string;
  useAnotherAccount: string;
  stayLoggedIn: string;
}
