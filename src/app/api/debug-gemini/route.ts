import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  const debugInfo = {
    apiKeyPresent: !!apiKey,
    apiKeyLength: apiKey ? apiKey.length : 0,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 6) + '...' : 'NOT SET',
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  };

  // If API key exists, try a simple text-only call to Gemini
  if (apiKey) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
        },
      });
      
      const result = await model.generateContent(
        'Return a JSON object: {"status": "ok", "severity_test": 3}'
      );
      const text = result.response.text();
      
      return NextResponse.json({
        ...debugInfo,
        geminiTest: 'SUCCESS',
        geminiResponse: text,
      });
    } catch (error) {
      return NextResponse.json({
        ...debugInfo,
        geminiTest: 'FAILED',
        geminiError: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return NextResponse.json(debugInfo);
}
