import React, { useState } from 'react';
import { useApp } from '../store';
import { Plus, Trash2, Folder, ChevronRight, Zap } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

export const StrategyList: React.FC = () => {
  const { state, dispatch } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStrategyName, setNewStrategyName] = useState('');
  const t = TRANSLATIONS[state.settings.language];
  const isRtl = state.settings.language === 'fa';

  const handleAdd = () => {
    if (newStrategyName.trim()) {
      dispatch({ type: 'ADD_STRATEGY', payload: newStrategyName });
      setNewStrategyName('');
      setIsModalOpen(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-end justify-between mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">{t.strategies}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-base">Manage your trading ecosystem.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="group flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-xl transition-all hover:shadow-lg hover:shadow-slate-500/20 font-semibold text-sm"
        >
          <Plus size={18} strokeWidth={2} />
          {t.addStrategy}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.strategies.map((strategy) => (
          <div 
            key={strategy.id}
            className="group relative bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl p-6 ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-2 hover:ring-indigo-500 dark:hover:ring-indigo-400 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
            onClick={() => dispatch({ type: 'SELECT_STRATEGY', payload: strategy.id })}
          >
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                        <Folder size={20} strokeWidth={1.5} />
                    </div>
                    <button 
                        onClick={(e) => { e.stopPropagation(); dispatch({ type: 'DELETE_STRATEGY', payload: strategy.id }); }}
                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                        <Trash2 size={16} strokeWidth={1.5} />
                    </button>
                </div>
                
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-1 truncate">{strategy.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Active Strategy
                </p>
                
                <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Zap size={13} className="text-amber-500" fill="currentColor" />
                    {strategy.months.length} {t.months}
                  </span>
                  <ChevronRight size={14} strokeWidth={1.5} className={`text-slate-400 group-hover:text-indigo-500 transition-colors ${isRtl ? 'rotate-180' : ''}`} />
                </div>
            </div>
          </div>
        ))}

        {state.strategies.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/20">
             <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Folder size={20} strokeWidth={1.5} />
             </div>
             <p className="text-slate-500 font-medium">No strategies found</p>
             <p className="text-sm text-slate-400 mt-1">Create your first strategy to get started</p>
          </div>
        )}
      </div>

      {/* Modern Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-950 p-8 rounded-3xl w-full max-w-sm shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 scale-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">{t.addStrategy}</h3>
            <input
              autoFocus
              value={newStrategyName}
              onChange={(e) => setNewStrategyName(e.target.value)}
              placeholder={t.newStrategyName}
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border-none ring-1 ring-slate-200 dark:ring-slate-800 rounded-xl mb-6 outline-none focus:ring-2 focus:ring-indigo-500 text-base transition-all placeholder:text-slate-400"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium transition-colors text-sm"
              >
                {t.cancel}
              </button>
              <button 
                onClick={handleAdd}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 text-sm"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};