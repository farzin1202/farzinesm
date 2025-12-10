import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { Trade, Direction, Result } from '../types';
import { Trash2, Plus, Calendar, Hash, BarChart3 } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

const CellInput = ({ 
  value, 
  onChange, 
  type = 'text',
  className = '',
  onBlur,
  placeholder = '',
  min,
  max
}: { 
  value: string | number, 
  onChange: (val: any) => void, 
  type?: string,
  className?: string,
  onBlur?: () => void,
  placeholder?: string,
  min?: string,
  max?: string
}) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBlur = () => {
    if (localValue !== value) {
        onChange(localValue);
    }
    if (onBlur) onBlur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        e.currentTarget.blur();
    }
  };

  return (
    <input
      type={type}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      min={min}
      max={max}
      className={`w-full bg-transparent outline-none py-2.5 px-3 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:shadow-sm transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 ${className}`}
    />
  );
};

export const TradeGrid: React.FC<{ trades: Trade[] }> = ({ trades }) => {
  const { state, dispatch } = useApp();
  const t = TRANSLATIONS[state.settings.language];

  const updateTrade = (id: string, field: keyof Trade, value: any) => {
    let updates: Partial<Trade> = { [field]: value };
    const trade = trades.find(t => t.id === id);
    if (!trade) return;

    if (['rr', 'pips', 'pnlPercent', 'maxExcursionPercent'].includes(field)) {
        let numValue = parseFloat(value);
        if (isNaN(numValue)) numValue = 0;
        
        // Auto-sign logic: If Result is Win -> Positive, If Loss -> Negative
        if (field === 'pips' || field === 'pnlPercent') {
             if (trade.result === 'Win') {
                 numValue = Math.abs(numValue);
             } else if (trade.result === 'Loss') {
                 numValue = -Math.abs(numValue);
             }
        }
        (updates as any)[field] = numValue;
    }

    if (field === 'result') {
        // When changing result, flip signs of existing values
        const isWin = value === 'Win';
        const isLoss = value === 'Loss';
        
        const flip = (val: number) => {
            if (isWin) return Math.abs(val);
            if (isLoss) return -Math.abs(val);
            return 0; // BE
        }

        updates.pips = flip(trade.pips);
        updates.pnlPercent = flip(trade.pnlPercent);
        
        // Reset Max Excursion if not Win
        if (!isWin) {
            updates.maxExcursionPercent = 0;
        }
    }

    dispatch({ type: 'UPDATE_TRADE', payload: { id, data: updates } });
  };

  return (
    <div className="flex flex-col gap-4">
        <div className="w-full bg-white dark:bg-slate-900 rounded-3xl ring-1 ring-slate-200 dark:ring-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                        <Hash size={18} strokeWidth={1.5} />
                    </div>
                    <div>
                        <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">{t.tradeLog}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Detailed execution records</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                     <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <BarChart3 size={14} className="text-slate-400" strokeWidth={2} />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                             {trades.length} {t.totalTrades}
                        </span>
                     </div>
                    <button
                        onClick={() => dispatch({ type: 'ADD_TRADE', payload: {} })}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-all font-semibold text-xs shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
                    >
                        <Plus size={16} strokeWidth={2} />
                        {t.addTrade}
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-950/30 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                            <th className="w-20 px-3 py-4">{t.day}</th>
                            <th className="w-32 px-3">{t.pair}</th>
                            <th className="w-24 px-3">{t.dir}</th>
                            <th className="w-20 px-3">{t.rr}</th>
                            <th className="w-28 px-3">{t.result}</th>
                            <th className="w-28 px-3">{t.pips}</th>
                            <th className="w-28 px-3">{t.pnl}</th>
                            <th className="w-28 px-3">{t.maxExcursion}</th>
                            <th className="w-14 text-center"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {trades.map((trade, idx) => {
                            const isWin = trade.result === 'Win';
                            const isLoss = trade.result === 'Loss';
                            const colorClass = isWin ? 'text-emerald-600 dark:text-emerald-400' : isLoss ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500';

                            return (
                            <tr key={trade.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                                {/* Day Input */}
                                <td>
                                    <CellInput 
                                        value={trade.date} 
                                        onChange={(v) => updateTrade(trade.id, 'date', v)} 
                                        type="number" 
                                        min="1" max="31"
                                        className="font-mono font-medium text-slate-600 dark:text-slate-300 text-center" 
                                    />
                                </td>
                                
                                {/* Pair - Auto filled in store, but editable */}
                                <td><CellInput value={trade.pair} onChange={(v) => updateTrade(trade.id, 'pair', v)} className="uppercase font-bold tracking-wide text-slate-700 dark:text-slate-200" /></td>
                                
                                {/* Direction - Colored */}
                                <td>
                                    <div className="px-3">
                                         <select
                                            value={trade.direction}
                                            onChange={(e) => updateTrade(trade.id, 'direction', e.target.value)}
                                            className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold outline-none cursor-pointer border-0 transition-all shadow-sm
                                                ${trade.direction === 'Long' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : ''}
                                                ${trade.direction === 'Short' ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400' : ''}
                                            `}
                                        >
                                            <option value="Long">LONG</option>
                                            <option value="Short">SHORT</option>
                                        </select>
                                    </div>
                                </td>

                                {/* RR */}
                                <td><CellInput value={trade.rr} onChange={(v) => updateTrade(trade.id, 'rr', v)} type="number" className="font-mono font-medium" /></td>
                                
                                {/* Result */}
                                <td>
                                    <div className="px-3">
                                         <select
                                            value={trade.result}
                                            onChange={(e) => updateTrade(trade.id, 'result', e.target.value)}
                                            className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold outline-none cursor-pointer border-0 transition-all shadow-sm
                                                ${isWin ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : ''}
                                                ${isLoss ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' : ''}
                                                ${trade.result === 'BE' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' : ''}
                                            `}
                                        >
                                            <option value="Win">WIN</option>
                                            <option value="Loss">LOSS</option>
                                            <option value="BE">BE</option>
                                        </select>
                                    </div>
                                </td>

                                {/* Pips */}
                                <td><CellInput value={trade.pips} onChange={(v) => updateTrade(trade.id, 'pips', v)} type="number" className={`font-mono font-medium ${colorClass}`} /></td>
                                
                                {/* PnL Percent */}
                                <td><CellInput value={trade.pnlPercent} onChange={(v) => updateTrade(trade.id, 'pnlPercent', v)} type="number" className={`font-mono font-bold ${colorClass}`} /></td>

                                {/* Max Excursion % - Only if Win */}
                                <td>
                                    {isWin ? (
                                        <CellInput 
                                            value={trade.maxExcursionPercent || 0} 
                                            onChange={(v) => updateTrade(trade.id, 'maxExcursionPercent', v)} 
                                            type="number" 
                                            className="font-mono text-slate-400 dark:text-slate-500 text-xs" 
                                            placeholder="Max %"
                                        />
                                    ) : (
                                        <div className="px-3 text-center text-slate-300 dark:text-slate-700">-</div>
                                    )}
                                </td>

                                <td className="text-center pr-4">
                                    <button 
                                        onClick={() => dispatch({ type: 'DELETE_TRADE', payload: trade.id })}
                                        className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 size={15} strokeWidth={1.5} />
                                    </button>
                                </td>
                            </tr>
                        )})}
                    </tbody>
                </table>
            </div>
             {trades.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                    <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <Calendar size={20} strokeWidth={1.5} className="text-slate-300 dark:text-slate-600" />
                    </div>
                    <p className="font-semibold text-slate-600 dark:text-slate-300 text-base">Journal is empty</p>
                    <p className="text-xs text-slate-400 mt-1">Record your first trade to generate analytics.</p>
                </div>
            )}
        </div>
    </div>
  );
};