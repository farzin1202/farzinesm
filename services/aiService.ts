import { GoogleGenAI } from "@google/genai";
import { MonthData, Strategy } from "../types";

export const analyzeMonthPerformance = async (
  strategy: Strategy,
  month: MonthData,
  apiKey?: string,
  language: 'en' | 'fa' = 'en'
): Promise<string> => {
  
  if (!apiKey || apiKey.trim() === '') {
    return language === 'fa' 
      ? "خطا: کلید API یافت نشد. لطفاً در بخش تنظیمات کلید API جمینای خود را وارد کنید."
      : "Error: API Key missing. Please enter your Gemini API Key in the Settings menu.";
  }

  const tradesSummary = month.trades.map(t => 
    `- Date: ${t.date}, Pair: ${t.pair}, Dir: ${t.direction}, Result: ${t.result}, PnL: ${t.pnlPercent}%, RR: ${t.rr}, Notes: ${t.notes || 'None'}`
  ).join('\n');

  const systemPrompt = `
    You are an expert Forex Trading Mentor and Hedge Fund Portfolio Manager. 
    Your goal is to analyze the user's trading journal for a specific month and provide a professional, constructive, and actionable performance review.
    
    The output must be in Markdown format.
    The output must be in ${language === 'fa' ? 'Persian (Farsi)' : 'English'}.

    Structure your response as follows:
    1. **Executive Summary**: A brief overview of the month's performance (Win Rate, Net PnL, General Sentiment).
    2. **Strengths**: What did the trader do well? (e.g., sticking to RR, good win rate, discipline).
    3. **Weaknesses & Leaks**: Identify bad habits (e.g., overtrading, revenge trading, poor RR, holding losers).
    4. **Risk Management Audit**: specific comments on risk per trade based on the PnL percentages.
    5. **Actionable Plan**: 3 concrete steps to improve next month.

    Data to Analyze:
    Strategy Name: ${strategy.name}
    Month: ${month.name}
    Strategy Notes: ${strategy.notes || 'None'}
    Month Notes: ${month.notes || 'None'}

    Trade Log:
    ${tradesSummary}

    If there are no trades, strictly say "No trades recorded for this month to analyze."
  `;

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Using gemini-2.5-flash-latest for fast and efficient text analysis
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-latest',
      contents: systemPrompt,
    });

    return response.text || (language === 'fa' ? "تحلیلی دریافت نشد." : "No analysis received.");
    
  } catch (error: any) {
    console.error("AI Service Error:", error);
    
    let errorMessage = language === 'fa'
      ? "خطا در برقراری ارتباط با هوش مصنوعی. لطفاً کلید API و اینترنت خود را بررسی کنید."
      : "Error connecting to AI Service. Please check your API Key and internet connection.";

    // Simple error categorization
    if (error.message?.includes('403') || error.message?.includes('key')) {
        errorMessage = language === 'fa' 
            ? "خطا: کلید API نامعتبر است." 
            : "Error: Invalid API Key.";
    }

    return errorMessage;
  }
};