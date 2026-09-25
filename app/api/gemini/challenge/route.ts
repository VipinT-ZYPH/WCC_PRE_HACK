import { ai, MODELS, parseGeminiResponse } from "@/lib/gemini";
import { Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { project } = await req.json();

    const prompt = `
      You are an elite brand strategist and critic. Your job is to challenge the current brand system and find weaknesses.
      Evaluate the entire brand system for:
      1. Generic or cliché ideas
      2. Audience mismatch
      3. Positioning weakness
      4. Contradictory personality
      5. Weak naming
      6. Messaging inconsistency
      7. Visual/strategic mismatch
      8. Unclear value proposition

      Full Brand Project Data: ${JSON.stringify(project)}

      Be honest and constructive.
    `;

    const response = await ai.models.generateContent({
      model: MODELS.PRO,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallStatus: { type: Type.STRING },
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: ["low", "medium", "high"] },
                  problem: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  suggestion: { type: Type.STRING },
                },
                required: ["category", "severity", "problem", "reason", "suggestion"]
              }
            },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendedChanges: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["overallStatus", "issues", "strengths", "recommendedChanges"]
        },
      },
    });

    return NextResponse.json(parseGeminiResponse(response.text));
  } catch (error: any) {
    console.error("Challenge API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
