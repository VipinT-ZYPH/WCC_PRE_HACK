import { MODELS, generateWithFallback, parseGeminiResponse } from "@/lib/gemini";
import { Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { shape, positioning, discovery } = await req.json();

    const prompt = `
      Create a visual identity direction based on the brand strategy.
      Brand Name: ${shape.selectedName || 'The Project'}
      Positioning: ${JSON.stringify(positioning)}
      Personality: ${JSON.stringify(shape.personalityTraits)}

      Provide colors (hex codes), typography, and visual concepts.
    `;

    const response = await generateWithFallback({
      model: MODELS.FLASH,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            primaryColor: { type: Type.STRING },
            secondaryColors: { type: Type.ARRAY, items: { type: Type.STRING } },
            accentColor: { type: Type.STRING },
            typography: {
              type: Type.OBJECT,
              properties: {
                heading: { type: Type.STRING },
                body: { type: Type.STRING },
                rationale: { type: Type.STRING },
              },
              required: ["heading", "body", "rationale"]
            },
            logoConcept: { type: Type.STRING },
            shapeLanguage: { type: Type.STRING },
            imageryDirection: { type: Type.STRING },
            visualAvoid: { type: Type.ARRAY, items: { type: Type.STRING } },
            visualMood: { type: Type.STRING },
          },
          required: ["primaryColor", "secondaryColors", "accentColor", "typography", "logoConcept", "shapeLanguage", "imageryDirection", "visualAvoid", "visualMood"]
        },
      },
    });

    return NextResponse.json(parseGeminiResponse(response.text));
  } catch (error: any) {
    console.error("Visualize API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
