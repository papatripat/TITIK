import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export type WasteClassification = {
  severity: 1 | 2 | 3;
  waste_type: 'plastic' | 'organic' | 'mixed';
  confidence: number;
  _debug?: {
    model?: string;
    rawText?: string;
    error?: string;
    usedFallback: boolean;
    apiKeyPresent: boolean;
  };
};

const FALLBACK_CLASSIFICATION: WasteClassification = {
  severity: 2,
  waste_type: 'mixed',
  confidence: 50,
};

// Model fallback chain — kalau model pertama quota habis, otomatis coba model berikutnya
const MODEL_CANDIDATES = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
];

const PROMPT = `You are an expert environmental inspector AI. Analyze this image of illegal waste/garbage dumping.

Classify the waste and return ONLY a valid JSON object with these exact fields:
- "severity": Must be exactly 1, 2, or 3. 
    * 1 = Small/minimal waste (scattered trash, single items, minor litter).
    * 2 = Moderate pile (a few trash bags, small localized dump).
    * 3 = Large/critical pile (massive amount of garbage, mountain of trash, extensive illegal dumping).
- "waste_type": "plastic", "organic", or "mixed".
- "confidence": a number from 0 to 100 indicating your confidence.

Return ONLY the JSON object, no markdown, no explanation, no extra text.`;

export async function classifyWaste(
  imageBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<WasteClassification> {
  const apiKeyPresent = !!process.env.GEMINI_API_KEY;

  if (!apiKeyPresent) {
    console.error('GEMINI_API_KEY is not set!');
    return {
      ...FALLBACK_CLASSIFICATION,
      _debug: {
        error: 'GEMINI_API_KEY environment variable is not set',
        usedFallback: true,
        apiKeyPresent: false,
      },
    };
  }

  // Try each model in the fallback chain
  const errors: string[] = [];

  for (const modelName of MODEL_CANDIDATES) {
    try {
      console.log(`Trying model: ${modelName}`);
      
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
        },
      });

      const result = await model.generateContent([
        PROMPT,
        {
          inlineData: {
            data: imageBase64,
            mimeType,
          },
        },
      ]);

      const response = result.response;
      const text = response.text().trim();

      console.log(`[${modelName}] Gemini raw response:`, text);

      // Parse the JSON response
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanText);

      // Validate the response (handle potential string outputs from LLM)
      const parsedSeverity = Number(parsed.severity);
      const severity = [1, 2, 3].includes(parsedSeverity) ? (parsedSeverity as 1 | 2 | 3) : 2;

      const wasteTypes = ['plastic', 'organic', 'mixed'];
      const waste_type = wasteTypes.includes(parsed.waste_type) ? parsed.waste_type : 'mixed';

      const parsedConfidence = Number(parsed.confidence);
      const confidence = !isNaN(parsedConfidence)
        ? Math.min(100, Math.max(0, Math.round(parsedConfidence)))
        : 50;

      return {
        severity,
        waste_type,
        confidence,
        _debug: {
          model: modelName,
          rawText: text,
          usedFallback: false,
          apiKeyPresent: true,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[${modelName}] failed:`, errorMessage);
      errors.push(`${modelName}: ${errorMessage}`);
      // Continue to next model
    }
  }

  // All models failed
  console.error('All Gemini models failed:', errors);
  return {
    ...FALLBACK_CLASSIFICATION,
    _debug: {
      error: `All models failed — ${errors.join(' | ')}`,
      usedFallback: true,
      apiKeyPresent,
    },
  };
}
