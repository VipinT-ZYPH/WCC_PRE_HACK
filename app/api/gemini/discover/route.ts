import { MODELS, generateWithFallback, parseGeminiResponse } from "@/lib/gemini";
import { Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { roughIdea, targetAudience, industry, market, goal, constraints } = await req.json();

    const prompt = `
      Analyze this rough brand/startup idea and provide a structured discovery report.
      Idea: ${roughIdea}
      Target Audience: ${targetAudience || 'Not specified'}
      Industry: ${industry || 'Not specified'}
      Market: ${market || 'Not specified'}
      Goal: ${goal || 'Not specified'}
      Constraints: ${constraints || 'Not specified'}

      Think deeply about the core problem, user needs, and context.
    `;

    const response = await generateWithFallback({
      model: MODELS.FLASH,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            problem: { type: Type.STRING },
            targetAudience: { type: Type.ARRAY, items: { type: Type.STRING } },
            userNeeds: { type: Type.ARRAY, items: { type: Type.STRING } },
            context: { type: Type.STRING },
            goals: { type: Type.ARRAY, items: { type: Type.STRING } },
            constraints: { type: Type.ARRAY, items: { type: Type.STRING } },
            assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
            openQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            painPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["problem", "targetAudience", "userNeeds", "context", "goals", "constraints", "assumptions", "openQuestions", "painPoints"]
        },
      },
    });

    return NextResponse.json(parseGeminiResponse(response.text));
  } catch (error: any) {
    console.error("Discovery API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
