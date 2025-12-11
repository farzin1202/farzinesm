import { MonthData, Strategy } from "../types";

export const analyzeMonthPerformance = async (
  strategy: Strategy,
  month: MonthData
): Promise<string> => {
  // Mock simulation to restore local functionality without external service connection
  return new Promise((resolve) => {
    setTimeout(() => {
      const winRate = month.trades.length > 0 
        ? (month.trades.filter(t => t.result === 'Win').length / month.trades.length * 100).toFixed(1)
        : 0;

      resolve(`
### Analysis Report (Local Mode)

**Strategy:** ${strategy.name}
**Period:** ${month.name}
**Trades:** ${month.trades.length}
**Win Rate:** ${winRate}%

**Overview:**
This is a simulated analysis because the external AI service is currently disconnected. 

**Observations:**
- You have recorded ${month.trades.length} trades for this period.
- Ensure you are following your risk management rules consistently.
- Review your losing trades to identify any common patterns.

*(AI features are currently running in local offline mode)*
      `);
    }, 1500);
  });
};