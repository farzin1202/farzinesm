import React, { useState } from 'react';
import { useApp } from '../store';
import { ArrowRight, BarChart2, CheckCircle } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

export const Onboarding: React.FC = () => {
  const { state, dispatch } = useApp();
  const [step, setStep] = useState(1);
  const t = TRANSLATIONS[state.settings.language];

  if (state.settings.isOnboardingComplete) return null;

  const handleComplete = () => {
    dispatch({ type: 'COMPLETE_ONBOARDING' });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="p-8 flex flex-col items-center text-center">
          
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full flex flex-col items-center">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-indigo-100 dark:ring-indigo-800">
                <BarChart2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">{t.welcomeTitle}</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">{t.welcomeSubtitle}</p>
              <button
                onClick={() => setStep(2)}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25"
              >
                <span>Next</span>
                <ArrowRight size={16} strokeWidth={2} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 w-full flex flex-col items-center">
               <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-emerald-100 dark:ring-emerald-800">
                <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Ready to Master the Markets?</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">Your journey to consistency starts with a single log.</p>
              <button
                onClick={handleComplete}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-indigo-500/25"
              >
                {t.getStarted}
              </button>
            </div>
          )}

          <div className="flex gap-2 mt-8">
            <div className={`h-1 rounded-full transition-all duration-300 ${step === 1 ? 'w-6 bg-indigo-600' : 'w-1.5 bg-slate-200 dark:bg-slate-700'}`} />
            <div className={`h-1 rounded-full transition-all duration-300 ${step === 2 ? 'w-6 bg-indigo-600' : 'w-1.5 bg-slate-200 dark:bg-slate-700'}`} />
          </div>
        </div>
      </div>
    </div>
  );
};