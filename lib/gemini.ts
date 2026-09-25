import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

export const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export const MODELS = {
  FLASH: "gemini-3.6-flash",
  PRO: "gemini-3.6-flash", 
};

export function parseGeminiResponse(text: string | undefined) {
  if (!text) return {};
  
  // Remove markdown code blocks if present
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/);
  const cleanText = jsonMatch ? jsonMatch[1] : text;
  
  try {
    return JSON.parse(cleanText.trim());
  } catch (e) {
    console.error("Failed to parse Gemini JSON:", e);
    console.log("Raw text:", text);
    // Attempt to find any JSON-like structure if parsing fails
    const lastDitchMatch = cleanText.match(/\{[\s\S]*\}/);
    if (lastDitchMatch) {
      try {
        return JSON.parse(lastDitchMatch[0]);
      } catch (e2) {
        return {};
      }
    }
    return {};
  }
}
