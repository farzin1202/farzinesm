
import React, { useState, useEffect, useCallback, memo } from 'react';
import { useApp } from '../store';
import { Trade } from '../types';
import { Trash2, Plus, Calendar, Hash, BarChart3, ChevronUp, FileText, FileEdit } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

const CellInput = memo(({ 
  value, 
  onChange, 
  type = 'text',
  className = '',
  placeholder = '',
  min,
  max
}: { 
  value: string | number, 
  onChange: (val: any) => void, 
  type?: string,
  className?: string,
  placeholder?: string,
  min?: string,
  max?: string
}) => {
  const [localValue, setLocalValue] = useState(value);

  // Sync local state when prop changes (external update)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleBlur = () => {
    if (localValue !== value) {
        onChange(localValue);
    }
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
      className={`w-full bg-transparent outline-none py-2 px-2 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:shadow-sm transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 ${className}`}
    />
  );
});

CellInput.displayName = 'CellInput';

interface TradeRowProps {
    trade: Trade;
    isExpanded: boolean;
    onToggleExpand: (id: string) => void;
    onUpdate: (id: string, field: keyof Trade, value: any) => void;
    onDelete: (id: string) => void;
    t: any;
}

const TradeRow = memo(({ trade, isExpanded, onToggleExpand, onUpdate, onDelete, t }: TradeRowProps) => {
    const isWin = trade.result === 'Win';
    const isLoss = trade.result === 'Loss';
    const colorClass = isWin ? 'text-emerald-600 dark:text-emerald-400' : isLoss ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500';
    const hasNotes = trade.notes && trade.notes.trim().length > 0;

    return (
        <>
            <tr className={`group hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors ${isExpanded ? 'bg-slate-50/80 dark:bg-slate-800/30' : ''}`}>
                {/* Index / Expand Toggle */}
                <td className="text-center">
                        <button 
                        onClick={() => onToggleExpand(trade.id)}
                        className={`p-1 rounded-md transition-colors ${hasNotes ? 'text-indigo-500' : 'text-slate-300 hover:text-indigo-500'}`}
                        title={hasNotes ? "Has Notes" : "Add Notes"}
                        >
                        {isExpanded ? <ChevronUp size={14} /> : (
                            hasNotes ? <FileText size={14} fill="currentColor" /> : <FileEdit size={14} />
                        )}
                        </button>
                </td>

                {/* Day Input */}
                <td>
                    <CellInput 
                        value={trade.date} 
                        onChange={(v) => onUpdate(trade.id, 'date', v)} 
                        type="number" 
                        min="1" max="31"
                        className="font-mono font-medium text-slate-600 dark:text-slate-300 text-center" 
                    />
                </td>
                
                {/* Pair */}
                <td><CellInput value={trade.pair} onChange={(v) => onUpdate(trade.id, 'pair', v)} className="uppercase font-bold tracking-wide text-slate-700 dark:text-slate-200" /></td>
                
                {/* Direction */}
                <td>
                    <div className="px-1">
                            <select
                            value={trade.direction}
                            onChange={(e) => onUpdate(trade.id, 'direction', e.target.value)}
                            className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold outline-none cursor-pointer border-0 transition-all shadow-sm
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
                <td><CellInput value={trade.rr} onChange={(v) => onUpdate(trade.id, 'rr', v)} type="number" className="font-mono font-medium" /></td>
                
                {/* Result */}
                <td>
                    <div className="px-1">
                            <select
                            value={trade.result}
                            onChange={(e) => onUpdate(trade.id, 'result', e.target.value)}
                            className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold outline-none cursor-pointer border-0 transition-all shadow-sm
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
                <td><CellInput value={trade.pips} onChange={(v) => onUpdate(trade.id, 'pips', v)} type="number" className={`font-mono font-medium ${colorClass}`} /></td>
                
                {/* PnL Percent */}
                <td><CellInput value={trade.pnlPercent} onChange={(v) => onUpdate(trade.id, 'pnlPercent', v)} type="number" className={`font-mono font-bold ${colorClass}`} /></td>

                {/* Max Excursion % */}
                <td>
                    {isWin ? (
                        <CellInput 
                            value={trade.maxExcursionPercent || 0} 
                            onChange={(v) => onUpdate(trade.id, 'maxExcursionPercent', v)} 
                            type="number" 
                            className="font-mono text-slate-400 dark:text-slate-500 text-xs" 
                            placeholder="Max %"
                        />
                    ) : (
                        <div className="px-2 text-center text-slate-300 dark:text-slate-700">-</div>
                    )}
                </td>

                <td className="text-center pr-2">
                    <button 
                        onClick={() => onDelete(trade.id)}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 opacity-0 group-hover:opacity-100 transition-all"
                    >
                        <Trash2 size={15} strokeWidth={1.5} />
                    </button>
                </td>
            </tr>
            
            {/* Expanded Row for Notes */}
            {isExpanded && (
                <tr className="bg-slate-50/50 dark:bg-slate-900/50 animate-in fade-in duration-200">
                    <td colSpan={10} className="p-0 border-b border-slate-100 dark:border-slate-800">
                        <div className="p-4 pl-12">
                            <div className="relative">
                                <div className="absolute left-3 top-3 text-slate-400">
                                    <FileText size={16} />
                                </div>
                                <textarea 
                                    value={trade.notes || ''}
                                    onChange={(e) => onUpdate(trade.id, 'notes', e.target.value)}
                                    placeholder={t.notesPlaceholder}
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 pl-10 text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[80px]"
                                />
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}, (prev, next) => {
    // Custom comparison to avoid re-renders if trade data hasn't changed
    // We only re-render if the specific trade object changed reference or expansion state changed
    return prev.trade === next.trade && prev.isExpanded === next.isExpanded;
});

TradeRow.displayName = 'TradeRow';

export const TradeGrid: React.FC<{ trades: Trade[] }> = ({ trades }) => {
  const { state, dispatch } = useApp();
  const [expandedTradeIds, setExpandedTradeIds] = useState<Set<string>>(new Set());
  const t = TRANSLATIONS[state.settings.language];

  const toggleExpand = useCallback((id: string) => {
    setExpandedTradeIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const updateTrade = useCallback((id: string, field: keyof Trade, value: any) => {
    // We need to access the trade data to perform logic, but 'trades' prop changes often.
    // Instead of depending on 'trades' inside useCallback (which kills memoization),
    // we compute the update payload and dispatch. The Reducer handles the update, 
    // and the new 'trade' object flows down to the specific TradeRow.
    
    // NOTE: For complex logic like the sign flipping, strictly speaking, we need the current trade state.
    // To keep it performant, we trust the TradeRow passed the current trade values or we use a "functional" update approach
    // in the reducer, BUT here we are inside the component. 
    // Optimization: We will do a quick lookup in the `trades` prop. It technically adds `trades` to dep array,
    // but since we are memoizing TradeRow, only the row that changed will re-render.
    
    // However, to avoid 'trades' dependency in useCallback, we can move the "Business Logic" of flipping signs
    // into the Reducer. But for now, let's keep it simple and efficient enough.
    
    dispatch({ type: 'UPDATE_TRADE', payload: { id, data: { [field]: value } } });
    
    // If strict logic is needed (like the sign flipping), we can do it here, but it requires 'trades' dependency.
    // Let's implement the sign logic here for correctness, accepting `trades` dependency. 
    // React.memo on TradeRow protects other rows.
  }, [dispatch]); // We removed 'trades' from dependency. We will handle logic inside Reducer or accept simple updates here.
                  // *Correction*: The prompt asked to fix errors/logic. The previous logic for auto-sign flipping was in the component.
                  // To restore that behavior efficiently without breaking memoization:
                  // We can pass the logic to the child, OR implement a specialized Action in Reducer.
                  // Let's implement the smarter update in this wrapper function, but access the trade from the list.

  const handleUpdateSmart = useCallback((id: string, field: keyof Trade, value: any) => {
      const trade = trades.find(t => t.id === id);
      if (!trade) return;

      let updates: Partial<Trade> = { [field]: value };

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
        const isWin = value === 'Win';
        const isLoss = value === 'Loss';
        const flip = (val: number) => {
            if (isWin) return Math.abs(val);
            if (isLoss) return -Math.abs(val);
            return 0; 
        }
        updates.pips = flip(trade.pips);
        updates.pnlPercent = flip(trade.pnlPercent);
        if (!isWin) updates.maxExcursionPercent = 0;
    }

    dispatch({ type: 'UPDATE_TRADE', payload: { id, data: updates } });
  }, [trades, dispatch]);

  const handleDelete = useCallback((id: string) => {
      dispatch({ type: 'DELETE_TRADE', payload: id });
  }, [dispatch]);

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
                            <th className="w-12 px-2 py-4 text-center">#</th>
                            <th className="w-16 px-2">{t.day}</th>
                            <th className="w-28 px-2">{t.pair}</th>
                            <th className="w-24 px-2">{t.dir}</th>
                            <th className="w-20 px-2">{t.rr}</th>
                            <th className="w-28 px-2">{t.result}</th>
                            <th className="w-24 px-2">{t.pips}</th>
                            <th className="w-24 px-2">{t.pnl}</th>
                            <th className="w-24 px-2">{t.maxExcursion}</th>
                            <th className="w-20 text-center">{t.actions}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {trades.map((trade) => (
                            <TradeRow 
                                key={trade.id} 
                                trade={trade} 
                                isExpanded={expandedTradeIds.has(trade.id)} 
                                onToggleExpand={toggleExpand}
                                onUpdate={handleUpdateSmart}
                                onDelete={handleDelete}
                                t={t}
                            />
                        ))}
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
