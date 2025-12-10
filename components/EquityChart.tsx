import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trade } from '../types';

interface EquityChartProps {
  trades: Trade[];
}

export const EquityChart: React.FC<EquityChartProps> = ({ trades }) => {
  
  const data = useMemo(() => {
    let runningBalance = 0;
    const points = [{ name: 'Start', value: 0 }];

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
  const color = isPositive ? '#10b981' : '#f43f5e'; // emerald-500 vs rose-500

  return (
    <div className="w-full h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    tick={{fill: '#64748b', fontSize: 12}} 
                    axisLine={false} 
                    tickLine={false}
                    tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                        borderColor: 'rgba(30, 41, 59, 1)', 
                        color: '#f8fafc',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}
                    itemStyle={{ color: '#f8fafc' }}
                    formatter={(value: number) => [`${value}%`, 'Equity']}
                    labelFormatter={(label) => `Trade ${label}`}
                />
                <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={color} 
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    strokeWidth={3}
                    animationDuration={1500}
                />
            </AreaChart>
        </ResponsiveContainer>
    </div>
  );
};