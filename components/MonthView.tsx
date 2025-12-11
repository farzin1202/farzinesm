
import React, { useMemo, useState } from 'react';
import { useApp } from '../store';
import { ArrowLeft, TrendingUp, TrendingDown, Activity, FileText, Sparkles, Medal, X, Wallet, DollarSign } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { TRANSLATIONS } from '../constants';
import { TradeGrid } from './TradeGrid';
import { EquityChart } from './EquityChart';
import { analyzeMonthPerformance } from '../services/aiService';

const Sparkline = ({ data, color }: { data: any[], color: string }) => {
    // If no data, return placeholder to avoid Recharts errors
    if (!data || data.length < 2) return <div className="w-full h-full bg-slate-50 dark:bg-slate-800/50 rounded-lg opacity-20"></div>;
    
    return (
        <div style={{ width: '100%', height: '100%', minWidth: 10, minHeight: 10 }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.4}/>
                            <stop offset="100%" stopColor={color} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke={color} 
                        strokeWidth={2} 
                        fill={`url(#gradient-${color})`} 
                        isAnimationActive={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export const MonthView: React.FC = () => {
  const { state, dispatch } = useApp();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const t = TRANSLATIONS[state.settings.language];
  const isRtl = state.settings.language === 'fa';

  const strategy = state.strategies.find(s => s.id === state.currentStrategyId);
  const month = strategy?.months.find(m => m.id === state.currentMonthId);

  if (!strategy || !month) return null;

  const handleNotesChange = (text: string) => {
    dispatch({ 
        type: 'UPDATE_MONTH', 
        payload: { strategyId: strategy.id, monthId: month.id, updates: { notes: text } } 
    });
  };

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
        const analysisText = await analyzeMonthPerformance(strategy, month);
        
        dispatch({ 
            type: 'UPDATE_MONTH', 
            payload: { 
                strategyId: strategy.id, 
                monthId: month.id, 
                updates: { aiAnalysis: analysisText } 
            } 
        });
        setIsAnalysisModalOpen(true);

    } catch (error) {
        console.error("AI Analysis failed", error);
        alert("Analysis failed. Please try again.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  // Real-time Analytics
  const stats = useMemo(() => {
    const totalTrades = month.trades.length;
    if (totalTrades === 0) return { winRate: 0, totalProfit: 0, totalLoss: 0, netPnl: 0, profitFactor: 0, pnlData: [], totalTrades: 0 };

    const wins = month.trades.filter(t => t.result === 'Win');
    const losses = month.trades.filter(t => t.result === 'Loss');
    
    const winRate = (wins.length / totalTrades) * 100;
    
    const totalProfit = wins.reduce((acc, t) => acc + (Number(t.pnlPercent) || 0), 0);
    const totalLoss = Math.abs(losses.reduce((acc, t) => acc + (Number(t.pnlPercent) || 0), 0));
    const netPnl = totalProfit - totalLoss; 

    // Generate Sparkline Data (Cumulative PnL)
    let runningBalance = 0;
    const pnlData = month.trades.map((t, i) => {
        runningBalance += (Number(t.pnlPercent) || 0);
        return { name: i, value: runningBalance };
    });
    // Add start point if not empty
    if(pnlData.length > 0) {
        pnlData.unshift({ name: -1, value: 0 });
    }

    return { winRate, totalProfit, totalLoss, netPnl, pnlData, totalTrades };
  }, [month.trades]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
       {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
            <button 
                onClick={() => dispatch({ type: 'SELECT_MONTH', payload: null })}
                className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white mb-4 transition-colors font-medium text-sm"
            >
                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                    <ArrowLeft size={16} strokeWidth={2} className={isRtl ? 'rotate-180' : ''} />
                </div>
                {t.back}
            </button>
            <div className="flex items-baseline gap-4">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{month.name}</h1>
              <span className="text-lg text-slate-400 font-medium">/ {strategy.name}</span>
            </div>
        </div>
      </div>

      {/* Modern Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Net Profit (Replaced Chart with Icon) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm overflow-hidden h-28 flex items-center justify-between relative group hover:ring-indigo-500/50 transition-all">
             {/* Decorative Background Icon */}
             <div className="absolute -left-5 -bottom-5 text-slate-900 dark:text-slate-100 opacity-[0.03] dark:opacity-[0.05] transform rotate-12 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                 <DollarSign size={130} strokeWidth={1} />
            </div>

            <div className="flex-1 pl-4 z-10"></div>
            
            <div className="z-10 flex flex-col items-end justify-between h-full">
                 <div className="flex items-center gap-2 mb-1">
                     <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t.netProfit}</span>
                     <div className={`p-1 rounded ${stats.netPnl >= 0 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10' : 'bg-rose-100 text-rose-600 dark:bg-rose-500/10'}`}>
                        <Wallet size={14} strokeWidth={1.5} />
                     </div>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-bold font-mono ${stats.netPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                         {stats.netPnl >= 0 ? '+' : ''}{stats.netPnl.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">%</span>
                </div>
            </div>
        </div>

        {/* Card 2: Win Rate (New Icon) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm h-28 flex items-center justify-between group hover:ring-indigo-500/50 transition-all">
            {/* Left: Medal Icon */}
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-amber-50 dark:group-hover:bg-amber-900/20 group-hover:text-amber-500 transition-colors">
                 <Medal size={24} strokeWidth={1.5} />
            </div>

            {/* Right: Content */}
            <div className="flex-1 flex flex-col items-end justify-between h-full">
                 <div className="flex items-center gap-2 mb-1">
                     <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t.winRate}</span>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{stats.winRate.toFixed(1)}</span>
                    <span className="text-xs text-slate-400 font-medium">%</span>
                </div>
            </div>
        </div>

        {/* Card 3: Total Loss */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm overflow-hidden h-28 flex items-center justify-between relative group hover:ring-indigo-500/50 transition-all">
            <div className="w-1/2 h-full absolute left-0 bottom-0 top-0 opacity-20 group-hover:opacity-30 transition-opacity">
                 <Sparkline data={stats.pnlData} color={'#f43f5e'} />
            </div>
            
            <div className="flex-1 pl-4 z-10"></div>

            <div className="z-10 flex flex-col items-end justify-between h-full">
                <div className="flex items-center gap-2 mb-1">
                     <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t.totalLoss}</span>
                     <div className="p-1 rounded bg-rose-100 text-rose-600 dark:bg-rose-500/10">
                        <TrendingDown size={14} strokeWidth={1.5} />
                     </div>
                </div>
                <div className="flex items-baseline gap-1">
                     <span className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
                       -{stats.totalLoss.toFixed(2)}
                   </span>
                   <span className="text-xs text-slate-400 font-medium">%</span>
                </div>
            </div>
        </div>

        {/* Card 4: Total Gain */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm overflow-hidden h-28 flex items-center justify-between relative group hover:ring-indigo-500/50 transition-all">
             <div className="w-1/2 h-full absolute left-0 bottom-0 top-0 opacity-20 group-hover:opacity-30 transition-opacity">
                 <Sparkline data={stats.pnlData} color="#10b981" />
            </div>

            <div className="flex-1 pl-4 z-10"></div>

             <div className="z-10 flex flex-col items-end justify-between h-full">
                <div className="flex items-center gap-2 mb-1">
                     <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t.totalGain}</span>
                     <div className="p-1 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                        <TrendingUp size={14} strokeWidth={1.5} />
                     </div>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        +{stats.totalProfit.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">%</span>
                </div>
            </div>
        </div>

      </div>

      {/* Main Workspace Stack with Grid for Chart & Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <Activity size={18} strokeWidth={1.5} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.equityCurve}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Visual growth trajectory</p>
                    </div>
                </div>
            </div>
            <EquityChart trades={month.trades} />
        </div>

         {/* Notes & AI Section */}
         <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Notes */}
            <div className="bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 rounded-3xl p-6 shadow-sm flex flex-col flex-1 min-h-[250px]">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <FileText size={18} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{t.notes}</h3>
                </div>
                <textarea
                    value={month.notes || ''}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder={t.notesPlaceholder}
                    className="flex-1 w-full bg-slate-50 dark:bg-slate-950/50 rounded-xl p-3 text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none transition-all"
                />
            </div>

            {/* AI Analysis Compact Card */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 dark:from-slate-800 dark:to-indigo-950/50 ring-1 ring-indigo-500/30 rounded-3xl p-6 shadow-lg relative overflow-hidden h-[120px] flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl -mr-10 -mt-10"></div>
                
                <div className="flex items-center justify-between z-10">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300">
                            <Sparkles size={18} strokeWidth={1.5} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white">{t.aiAnalysis}</h3>
                            <p className="text-xs text-indigo-200/70">{isAnalyzing ? t.analyzing : "Powered by Farzin Esmaeli"}</p>
                        </div>
                     </div>
                     <button 
                        onClick={() => month.aiAnalysis ? setIsAnalysisModalOpen(true) : handleAIAnalysis()}
                        disabled={isAnalyzing}
                        className="text-xs bg-white text-indigo-900 px-4 py-2 rounded-xl font-bold hover:bg-indigo-50 transition-colors disabled:opacity-50 shadow-lg"
                    >
                        {isAnalyzing ? (
                            <div className="w-4 h-4 border-2 border-indigo-900 border-t-transparent rounded-full animate-spin"></div>
                        ) : month.aiAnalysis ? (
                            t.viewAnalysis
                        ) : (
                            t.askAi
                        )}
                    </button>
                </div>
            </div>
         </div>

      </div>
      
      {/* Trade Grid Section */}
      <TradeGrid trades={month.trades} />

      {/* AI Analysis Modal */}
      {isAnalysisModalOpen && month.aiAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
             <div className="bg-white dark:bg-slate-950 w-full max-w-2xl max-h-[80vh] rounded-3xl shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 flex flex-col animate-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                         <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <Sparkles size={20} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t.aiAnalysis}</h3>
                    </div>
                    <button 
                        onClick={() => setIsAnalysisModalOpen(false)}
                        className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <X size={20} strokeWidth={2} />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-8 overflow-y-auto">
                    <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-a:text-indigo-600" dir={isRtl ? 'rtl' : 'ltr'}>
                        {month.aiAnalysis.split('\n').map((line, i) => (
                            <p key={i} className="mb-4 text-base whitespace-pre-line">{line}</p>
                        ))}
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-3xl">
                     <button 
                         onClick={() => handleAIAnalysis()}
                         className="px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl font-medium transition-colors text-sm"
                     >
                         Re-Analyze
                     </button>
                     <button 
                        onClick={() => setIsAnalysisModalOpen(false)}
                        className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:shadow-lg transition-all text-sm"
                    >
                        {t.close}
                    </button>
                </div>
             </div>
        </div>
      )}
        
    </div>
  );
};
