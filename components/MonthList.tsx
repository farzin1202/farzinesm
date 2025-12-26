
import React, { useState } from 'react';
import { useApp } from '../store';
import { Plus, Trash2, Calendar, ArrowLeft, TrendingUp, Percent, ChevronDown, FileText, AlertTriangle } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

export const MonthList: React.FC = () => {
  const { state, dispatch } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [monthToDelete, setMonthToDelete] = useState<string | null>(null);
  
  // Date Selection State
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.toLocaleString('default', { month: 'long' }));
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());

  const t = TRANSLATIONS[state.settings.language];
  const isRtl = state.settings.language === 'fa';

  const strategy = state.strategies.find(s => s.id === state.currentStrategyId);

  if (!strategy) return null;

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYearInt = currentDate.getFullYear();
  const years = Array.from({ length: 8 }, (_, i) => (currentYearInt - 5 + i).toString()).reverse();

  const handleAdd = () => {
    const monthName = `${selectedMonth} ${selectedYear}`;
    dispatch({ type: 'ADD_MONTH', payload: monthName });
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (monthToDelete) {
        dispatch({ type: 'DELETE_MONTH', payload: monthToDelete });
        setMonthToDelete(null);
    }
  };

  const handleNotesChange = (text: string) => {
    dispatch({ 
        type: 'UPDATE_STRATEGY', 
        payload: { id: strategy.id, updates: { notes: text } } 
    });
  };

  const getMonthStats = (trades: any[]) => {
    if (trades.length === 0) return { winRate: 0, pnl: 0 };
    const wins = trades.filter(t => t.result === 'Win').length;
    const winRate = (wins / trades.length) * 100;
    const pnl = trades.reduce((acc, curr) => acc + (Number(curr.pnlPercent) || 0), 0);
    return { winRate, pnl };
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <button 
        onClick={() => dispatch({ type: 'SELECT_STRATEGY', payload: null })}
        className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors"
      >
        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
             <ArrowLeft size={16} strokeWidth={2} className={isRtl ? 'rotate-180' : ''} />
        </div>
        <span className="font-medium text-sm">{t.back}</span>
      </button>

      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">{strategy.name}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-base">Select a trading period.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/25 font-semibold text-sm"
        >
          <Plus size={18} strokeWidth={2} />
          {t.addMonth}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-10">
        {/* Strategy Notes Section */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 rounded-3xl p-6 shadow-sm">
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <FileText size={18} strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.notes}</h3>
            </div>
            <textarea
                value={strategy.notes || ''}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder={t.notesPlaceholder}
                className="w-full h-24 bg-slate-50 dark:bg-slate-950/50 rounded-xl p-4 text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none transition-all"
            />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strategy.months.map((month) => {
          const stats = getMonthStats(month.trades);
          const isPositive = stats.pnl >= 0;

          return (
            <div 
              key={month.id}
              className="group bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-2 hover:ring-indigo-500 dark:hover:ring-indigo-400 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer relative overflow-hidden"
              onClick={() => dispatch({ type: 'SELECT_MONTH', payload: month.id })}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white dark:bg-slate-800 shadow-sm rounded-xl text-slate-700 dark:text-slate-300 ring-1 ring-slate-100 dark:ring-slate-700">
                    <Calendar size={20} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{month.name}</h3>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); setMonthToDelete(month.id); }}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                    <Trash2 size={16} strokeWidth={1.5} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        <TrendingUp size={12} strokeWidth={2} />
                        Win Rate
                    </div>
                    <span className="font-mono font-bold text-xl text-slate-700 dark:text-slate-200">{stats.winRate.toFixed(1)}%</span>
                 </div>
                 <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        <Percent size={12} strokeWidth={2} />
                        Net PnL
                    </div>
                    <span className={`font-mono font-bold text-xl ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isPositive ? '+' : ''}{stats.pnl.toFixed(2)}%
                    </span>
                 </div>
              </div>
            </div>
          );
        })}

        {strategy.months.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/20">
             <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Calendar size={20} strokeWidth={1.5} />
             </div>
             <p className="text-slate-500 font-medium">No months recorded</p>
             <p className="text-sm text-slate-400 mt-1">Add a month to begin journaling</p>
          </div>
        )}
      </div>

       {/* Add Month Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-950 p-8 rounded-3xl w-full max-w-sm shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 scale-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">{t.addMonth}</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="relative group">
                 <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full appearance-none p-3.5 bg-slate-50 dark:bg-slate-900 border-none ring-1 ring-slate-200 dark:ring-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 dark:text-white font-medium cursor-pointer text-sm"
                >
                  {months.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" size={16} strokeWidth={1.5} />
              </div>

              <div className="relative group">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full appearance-none p-3.5 bg-slate-50 dark:bg-slate-900 border-none ring-1 ring-slate-200 dark:ring-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 dark:text-white font-medium cursor-pointer text-sm"
                >
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" size={16} strokeWidth={1.5} />
              </div>
            </div>

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

      {/* Delete Confirmation Modal */}
      {monthToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl w-full max-w-sm shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 scale-100 animate-in zoom-in-95 duration-200">
                <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center mb-4 text-rose-600 dark:text-rose-400">
                    <AlertTriangle size={24} />
                </div>
                <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">{t.confirmDeleteTitle}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                    {t.confirmDeleteMonthMsg}
                </p>
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={() => setMonthToDelete(null)}
                        className="px-4 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium transition-colors text-sm"
                    >
                        {t.cancel}
                    </button>
                    <button 
                        onClick={confirmDelete}
                        className="px-4 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 font-medium shadow-lg shadow-rose-500/25 transition-all text-sm"
                    >
                        {t.confirmDeleteAction}
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};