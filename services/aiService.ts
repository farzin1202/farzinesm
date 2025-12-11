
import { GoogleGenAI } from "@google/genai";
import { MonthData, Strategy } from "../types";

// Initialize the AI client
// Note: The API key is securely accessed via process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeMonthPerformance = async (
  strategy: Strategy,
  month: MonthData
): Promise<string> => {
  try {
    const tradeData = month.trades.map((t) => ({
      Day: t.date,
      Pair: t.pair,
      Direction: t.direction,
      RR: t.rr,
      Result: t.result,
      Pips: t.pips,
      "PnL %": t.pnlPercent,
      "Max %": t.maxExcursionPercent || 0,
    }));

    const prompt = `
        I want you to act as a professional trading mentor. Analyze the following backtest results for a trading strategy.
        Provide a detailed, data-driven review with actionable advice.

        ### Context
        Strategy Name: ${strategy.name}
        Period: ${month.name}
        
        ### Trade Data (JSON)
        ${JSON.stringify(tradeData, null, 2)}

        ### Analysis Requirements:
        1. **Performance Overview**: Assess the overall quality (Good/Average/Poor) and consistency.
        2. **Risk Assessment**: Analyze drawdowns, actual Risk:Reward ratio vs planned, and specific outliers.
        3. **Behavioral Analysis**: Does the strategy rely on a few lucky trades? Is the win rate sustainable?
        4. **Weaknesses**: Identify potential overfitting, time-of-day sensitivity, or pair-specific issues.
        5. **Actionable Recommendations**: Suggest specific improvements for entry/exit, risk management rules, or filters.

        ### Output Format
        Provide a structured response with clear headings. Use bullet points for readability. Conclude with a "Confidence Score" (0-10) for this strategy based *only* on the provided data.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Efficient model for text analysis
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster response on standard analysis
      },
    });

    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("AI Service Error:", error);
    throw new Error("Failed to generate analysis. Please check your connection and API limits.");
  }
};
