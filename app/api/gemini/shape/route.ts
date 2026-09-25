import { ai, MODELS, parseGeminiResponse } from "@/lib/gemini";
import { Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { positioning, discovery } = await req.json();

    const prompt = `
      Based on the selected positioning and discovery data, generate brand personality traits and naming territories.
      Positioning: ${JSON.stringify(positioning)}
      Discovery: ${JSON.stringify(discovery)}

      Provide 3-5 personality traits and 3-5 naming territories with 3 candidate names each.
    `;

    const response = await ai.models.generateContent({
      model: MODELS.FLASH,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            personalityTraits: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  trait: { type: Type.STRING },
                  why: { type: Type.STRING },
                  appearance: { type: Type.STRING },
                },
                required: ["trait", "why", "appearance"]
              }
            },
            traitsToAvoid: { type: Type.ARRAY, items: { type: Type.STRING } },
            namingTerritories: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  territory: { type: Type.STRING },
                  names: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        concept: { type: Type.STRING },
                        why: { type: Type.STRING },
                        weakness: { type: Type.STRING },
                      },
                      required: ["name", "concept", "why", "weakness"]
                    }
                  }
                },
                required: ["id", "territory", "names"]
              }
            },
            tagline: { type: Type.STRING },
            oneLinePitch: { type: Type.STRING },
            messagingHierarchy: {
              type: Type.OBJECT,
              properties: {
                hero: { type: Type.STRING },
                supporting: { type: Type.STRING },
                cta: { type: Type.STRING },
              },
              required: ["hero", "supporting", "cta"]
            }
          },
          required: ["personalityTraits", "traitsToAvoid", "namingTerritories", "tagline", "oneLinePitch", "messagingHierarchy"]
        },
      },
    });

    return NextResponse.json(parseGeminiResponse(response.text));
  } catch (error: any) {
    console.error("Shape API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
