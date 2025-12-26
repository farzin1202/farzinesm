
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trade } from '../types';

interface EquityChartProps {
  trades: Trade[];
}

export const EquityChart: React.FC<EquityChartProps> = ({ trades }) => {
  
  const data = useMemo(() => {
    let runningBalance = 0;
    const points = [{ name: '0', value: 0 }];

    trades.forEach((trade, index) => {
        runningBalance += (Number(trade.pnlPercent) || 0);
        points.push({
            name: `${index + 1}`,
            value: Number(runningBalance.toFixed(2))
        });
    });
    return points;
  }, [trades]);

  const isPositive = data.length > 0 && data[data.length - 1].value >= 0;
  // Use brighter, more modern colors
  const color = isPositive ? '#34d399' : '#f87171'; // emerald-400 vs red-400
  const stopColor = isPositive ? 'rgba(52, 211, 153, 0.2)' : 'rgba(248, 113, 113, 0.2)';

  if (trades.length === 0) {
      return (
          <div className="w-full h-[350px] flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 text-sm">No trades data available for chart</span>
          </div>
      )
  }

  return (
    <div className="w-full h-[350px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
            <AreaChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={color} stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.1} vertical={false} />
                <XAxis 
                    dataKey="name" 
                    hide={true} 
                />
                <YAxis 
                    tick={{fill: '#64748b', fontSize: 11}} 
                    axisLine={false} 
                    tickLine={false}
                    tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                        borderColor: 'rgba(30, 41, 59, 1)', 
                        color: '#f8fafc',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                        padding: '8px 12px',
                        fontSize: '12px'
                    }}
                    itemStyle={{ color: '#f8fafc' }}
                    formatter={(value: number) => [`${value}%`, 'Equity']}
                    labelFormatter={(label) => label === '0' ? 'Start' : `Trade #${label}`}
                />
                <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={color} 
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    strokeWidth={3}
                    animationDuration={1500}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                />
            </AreaChart>
        </ResponsiveContainer>
    </div>
  );
};
