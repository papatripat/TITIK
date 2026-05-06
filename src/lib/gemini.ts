import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export type WasteClassification = {
  severity: 1 | 2 | 3;
  waste_type: 'plastic' | 'organic' | 'mixed';
  confidence: number;
};

const FALLBACK_CLASSIFICATION: WasteClassification = {
  severity: 2,
  waste_type: 'mixed',
  confidence: 50,
};

export async function classifyWaste(
  imageBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<WasteClassification> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const prompt = `You are an expert environmental inspector AI. Analyze this image of illegal waste/garbage dumping.

Classify the waste and return ONLY a valid JSON object with these exact fields:
- "severity": Must be exactly 1, 2, or 3. 
    * 1 = Small/minimal waste (scattered trash, single items, minor litter).
    * 2 = Moderate pile (a few trash bags, small localized dump).
    * 3 = Large/critical pile (massive amount of garbage, mountain of trash, extensive illegal dumping).
- "waste_type": "plastic", "organic", or "mixed".
- "confidence": a number from 0 to 100 indicating your confidence.

Return ONLY the JSON object, no markdown, no explanation, no extra text.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType,
        },
      },
    ]);

    const response = result.response;
    const text = response.text().trim();

    // Try to parse the JSON response
    // Remove possible markdown code fences
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanText);

    // Validate the response
    const severity = [1, 2, 3].includes(parsed.severity) ? parsed.severity : 2;
    const wasteTypes = ['plastic', 'organic', 'mixed'];
    const waste_type = wasteTypes.includes(parsed.waste_type) ? parsed.waste_type : 'mixed';
    const confidence = typeof parsed.confidence === 'number'
      ? Math.min(100, Math.max(0, Math.round(parsed.confidence)))
      : 50;

    return { severity, waste_type, confidence };
  } catch (error) {
    console.error('Gemini classification failed:', error);
    return FALLBACK_CLASSIFICATION;
  }
}
