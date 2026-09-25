import { MODELS, generateWithFallback, parseGeminiResponse } from "@/lib/gemini";
import { Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { discovery } = await req.json();

    const prompt = `
      Based on this discovery data, generate 3 distinct positioning directions for the brand.
      Discovery: ${JSON.stringify(discovery)}

      Each direction should be unique (e.g., community-focused vs. technology-focused vs. premium-service).
    `;

    const response = await generateWithFallback({
      model: MODELS.FLASH,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            directions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  whyItFits: { type: Type.STRING },
                  strength: { type: Type.STRING },
                  risk: { type: Type.STRING },
                },
                required: ["id", "name", "description", "whyItFits", "strength", "risk"]
              }
            },
            category: { type: Type.STRING },
            positioningStatement: { type: Type.STRING },
            valueProposition: { type: Type.STRING },
            differentiator: { type: Type.STRING },
            customerPromise: { type: Type.STRING },
          },
          required: ["directions", "category", "positioningStatement", "valueProposition", "differentiator", "customerPromise"]
        },
      },
    });

    return NextResponse.json(parseGeminiResponse(response.text));
  } catch (error: any) {
    console.error("Positioning API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
