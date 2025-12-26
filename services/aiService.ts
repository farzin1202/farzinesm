
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

  // User Prompt content
  const userPrompt = `
    Analyze the user's trading journal for a specific month and provide a professional, constructive, and actionable performance review.
    
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
    
    // Using gemini-2.0-flash for better stability and performance
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: userPrompt,
      config: {
        systemInstruction: "You are an expert Forex Trading Mentor and Hedge Fund Portfolio Manager.",
      }
    });

    return response.text || (language === 'fa' ? "تحلیلی دریافت نشد." : "No analysis received.");
    
  } catch (error: any) {
    console.error("AI Service Error:", error);
    
    const errString = error.toString().toLowerCase();

    // Specific Error Handling
    if (errString.includes('404') || errString.includes('not found')) {
         return language === 'fa' 
            ? "خطا: مدل هوش مصنوعی یافت نشد (404). ممکن است نام مدل تغییر کرده باشد." 
            : "Error: AI Model not found (404).";
    }
    
    if (errString.includes('400') || errString.includes('invalid argument')) {
         return language === 'fa' 
            ? "خطا: درخواست نامعتبر (400). لطفا داده‌های ورودی را بررسی کنید." 
            : "Error: Invalid request (400). Check input data.";
    }

    if (errString.includes('403') || errString.includes('permission') || errString.includes('key')) {
        return language === 'fa' 
            ? "خطا: کلید API نامعتبر است یا دسترسی ندارد." 
            : "Error: Invalid API Key or permission denied.";
    }

    if (errString.includes('fetch') || errString.includes('network')) {
        return language === 'fa'
            ? "خطا در اتصال به اینترنت. لطفا اتصال خود را بررسی کنید (ممکن است نیاز به تغییر IP باشد)."
            : "Network Error. Please check your internet connection.";
    }
    
    // Fallback generic error
    return language === 'fa'
      ? `خطا در تحلیل: ${error.message || 'Unknown Error'}`
      : `Analysis Error: ${error.message || 'Unknown Error'}`;
  }
};
