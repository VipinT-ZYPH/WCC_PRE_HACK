import { ai, MODELS, parseGeminiResponse } from "@/lib/gemini";
import { Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { project } = await req.json();

    const prompt = `
      Consolidate the entire BrandForge AI workflow into a final launch-ready Brand Kit.
      Brand: ${project.shape.selectedName}
      Full Data: ${JSON.stringify(project)}

      Generate launch assets like social posts and a landing page headline.
    `;

    const response = await ai.models.generateContent({
      model: MODELS.FLASH,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            launchAssets: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  content: { type: Type.STRING },
                },
                required: ["type", "content"]
              }
            },
            finalSummary: { type: Type.STRING },
          },
          required: ["launchAssets", "finalSummary"]
        },
      },
    });

    return NextResponse.json(parseGeminiResponse(response.text));
  } catch (error: any) {
    console.error("Deliver API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
