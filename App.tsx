
import React from 'react';
import { Layout } from './components/ui/Layout';
import { Onboarding } from './components/Onboarding';
import { Auth } from './components/Auth';
import { StrategyList } from './components/StrategyList';
import { MonthList } from './components/MonthList';
import { MonthView } from './components/MonthView';
import { AppProvider, useApp } from './store';

// Inner component to access context
const AppContent = () => {
  const { state } = useApp();

  // Route Logic
  // 1. Onboarding
  // 2. Auth (if not logged in)
  // 3. Main App
  
  if (!state.settings.isOnboardingComplete) {
      return <Onboarding />;
  }

  if (!state.user) {
      return <Auth />;
  }

  let CurrentView;
  if (state.currentStrategyId && state.currentMonthId) {
    CurrentView = MonthView;
  } else if (state.currentStrategyId) {
    CurrentView = MonthList;
  } else {
    CurrentView = StrategyList;
  }

  return (
    <Layout>
      <CurrentView />
    </Layout>
  );
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
