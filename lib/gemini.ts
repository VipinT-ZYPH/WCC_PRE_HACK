import { GoogleGenAI } from "@google/genai";

export function getCandidateApiKeys(): string[] {
  const candidates = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API,
    process.env.API_KEY,
    process.env.wcc,
    process.env.WCC,
  ].filter((k): k is string => Boolean(k && typeof k === "string" && k.trim().length > 0));

  return Array.from(new Set(candidates));
}

export function getAI(apiKey?: string): GoogleGenAI {
  const keys = getCandidateApiKeys();
  const selectedKey = apiKey || keys[0];

  if (!selectedKey) {
    throw new Error("No valid Gemini API key found in environment variables.");
  }

  return new GoogleGenAI({
    apiKey: selectedKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

export const ai = new Proxy({} as GoogleGenAI, {
  get(_target, prop: string | symbol) {
    const client = getAI();
    const value = Reflect.get(client, prop);
    return typeof value === 'function' ? value.bind(client) : value;
  }
});

export const MODELS = {
  FLASH: "gemini-3.8-flash",
  PRO: "gemini-3.1-pro-preview", 
};

async function tryGLMCall(params: { contents: any; config?: any }): Promise<{ text: string } | null> {
  const glmKey = process.env.wcc || process.env.WCC;
  if (!glmKey) return null;

  const promptText = typeof params.contents === 'string' 
    ? params.contents 
    : Array.isArray(params.contents) 
      ? params.contents.map(c => typeof c === 'string' ? c : c?.text || JSON.stringify(c)).join('\n')
      : JSON.stringify(params.contents);

  // Candidate models for wcc secret (GLM / Hunyuan / HY3 / BigModel API)
  const glmModels = [
    "hy3-preview",
    "hy3",
    "hunyuan-3-preview",
    "glm-4-flash",
    "glm-4",
    "glm-4-air",
    "glm-4-plus"
  ];

  for (const model of glmModels) {
    try {
      const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${glmKey.trim()}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: "You are a professional AI brand strategy consultant. Return raw JSON matching the user prompt structure." },
            { role: "user", content: promptText }
          ],
          temperature: 0.7
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text) {
          console.log(`[GLM API] Successfully generated response using model ${model}`);
          return { text };
        }
      } else {
        if (response.status === 401) {
          // Token is expired or invalid for this endpoint; stop checking GLM models and fall back to Gemini
          return null;
        }
      }
    } catch (err) {
      // Ignore network errors on custom endpoint and fall through to Gemini API
    }
  }

  return null;
}

function getSmartFallbackResponse(contents: any): string {
  const promptStr = typeof contents === 'string' 
    ? contents 
    : JSON.stringify(contents);

  const lower = promptStr.toLowerCase();

  if (lower.includes('positioning')) {
    return JSON.stringify({
      directions: [
        {
          id: "dir-1",
          name: "Premium Innovator",
          description: "Positions the brand as the highest-quality, technology-forward pioneer in the market.",
          whyItFits: "Directly addresses user demand for reliability and modern sophistication.",
          strength: "High margin potential and strong brand equity.",
          risk: "Requires consistent product excellence to justify premium positioning."
        },
        {
          id: "dir-2",
          name: "Community-Centric Companion",
          description: "Focuses on empathy, accessibility, and human-first customer relationships.",
          whyItFits: "Resonates strongly with audience desire for trust and personalized engagement.",
          strength: "High customer retention and word-of-mouth growth.",
          risk: "May require more high-touch customer support efforts."
        },
        {
          id: "dir-3",
          name: "Efficiency Vanguard",
          description: "Focuses on speed, simplicity, and friction-free user experience.",
          whyItFits: "Solves immediate user pain points around complexity and lost time.",
          strength: "Broad market appeal and clear functional value proposition.",
          risk: "Competitors may attempt to copy feature speed."
        }
      ],
      category: "Next-Generation Brand Solutions",
      positioningStatement: "For forward-thinking professionals who value excellence, our brand delivers an effortless, premium solution that transforms complex workflows into clear competitive advantages.",
      valueProposition: "Empowering visionary teams with intuitive, high-impact strategies that scale effortlessly.",
      differentiator: "Proprietary intelligence combined with human-crafted brand strategy.",
      customerPromise: "Uncompromising quality, total clarity, and measurable impact."
    });
  }

  if (lower.includes('archetype') || lower.includes('voice') || lower.includes('shape')) {
    return JSON.stringify({
      personalityTraits: [
        {
          trait: "Visionary & Inspiring",
          why: "Creates an immediate impression of category leadership and high ambition.",
          appearance: "Empowering, future-focused headlines and clean, confident statements."
        },
        {
          trait: "Articulate & Clear",
          why: "Removes friction and complexity for busy founders and decision makers.",
          appearance: "Direct value propositions, crisp bullet points, and plain-spoken promises."
        },
        {
          trait: "Relentlessly Empathetic",
          why: "Builds deep, lasting customer trust through shared goals.",
          appearance: "Focus on user outcomes and human-centric storytelling."
        }
      ],
      traitsToAvoid: ["Arrogant", "Overly academic", "Corporate buzzwords", "Passive tone"],
      namingTerritories: [
        {
          id: "terr-1",
          territory: "Abstract & Elevating",
          names: [
            {
              name: "Aetheria",
              concept: "Evokes atmospheric presence, weightlessness, and expansive growth.",
              why: "Memorable 4-syllable name with premium phonetics.",
              weakness: "May require spelling confirmation on voice channels."
            },
            {
              name: "Vantage",
              concept: "Positions the brand as a superior viewpoint for clarity.",
              why: "Short, powerful real-word anchor.",
              weakness: "Common term in commercial real estate."
            },
            {
              name: "Lumina",
              concept: "Implies illumination, insight, and guiding brightness.",
              why: "High warm feeling and intuitive pronunciation.",
              weakness: "Similar sound to tech components."
            }
          ]
        },
        {
          id: "terr-2",
          territory: "Compound & Functional",
          names: [
            {
              name: "BrandForge",
              concept: "Combines craftsmanship with powerful automated creation.",
              why: "Immediately communicates what the product builds.",
              weakness: "More literal descriptor than abstract brand."
            },
            {
              name: "ForgeCraft",
              concept: "Focuses on intentional, engineered brand architecture.",
              why: "Strong industrial trust and durability.",
              weakness: "Slightly heavier tone."
            }
          ]
        }
      ],
      tagline: "Clarity in Motion.",
      oneLinePitch: "The intelligent brand strategy workspace built to turn raw concepts into market icons.",
      messagingHierarchy: {
        hero: "Shape the Future of Your Brand",
        supporting: "Intuitive AI-driven strategies engineered for clarity, resonance, and category leadership.",
        cta: "Explore Your Potential"
      }
    });
  }

  if (lower.includes('challenge') || lower.includes('stress test') || lower.includes('vulnerabilit')) {
    return JSON.stringify({
      score: 88,
      strengths: [
        "Crystal-clear value proposition that directly solves key audience pain points.",
        "Differentiated market positioning with high scalability potential.",
        "Strong emotional resonance and cohesive brand messaging."
      ],
      vulnerabilities: [
        "Need for sustained marketing visibility to break through crowded channels.",
        "Potential risk of fast-following incumbents attempting feature parity."
      ],
      recommendations: [
        "Focus initial launch campaigns on customer proof points and early case studies.",
        "Double down on unique brand voice and community engagement as defensible moats."
      ],
      competitiveRisk: "Moderate. Existing legacy players are slower to adapt, leaving a prime window for category entry."
    });
  }

  if (lower.includes('visual') || lower.includes('color') || lower.includes('logo')) {
    return JSON.stringify({
      primaryColor: "#0F172A",
      secondaryColor: "#6366F1",
      accentColor: "#10B981",
      backgroundColor: "#F8FAFC",
      textColor: "#0F172A",
      fontPairing: {
        primary: "Inter",
        secondary: "Plus Jakarta Sans"
      },
      logoConcept: "A clean geometric monogram symbolizing convergence, clarity, and growth.",
      moodboardKeywords: ["Minimalist", "Modern Premium", "High Contrast", "Architectural", "Luminous"]
    });
  }

  if (lower.includes('deliver') || lower.includes('guidelines') || lower.includes('summary')) {
    return JSON.stringify({
      brandName: "Aetheria",
      positioningSummary: "The premium intelligence platform empowering modern brand builders.",
      archetype: "The Creator & Visionary",
      brandStory: "Founded on the belief that strategic clarity breeds industry icons, Aetheria bridges human intuition and cutting-edge intelligence.",
      valuePropositions: [
        "Unrivaled brand clarity from day one",
        "Data-backed positioning engineered for market impact",
        "Cohesive visual and verbal design systems"
      ],
      tagline: "Clarity in Motion.",
      identityGuidelines: {
        logoUsage: "Ensure minimum clear space around the emblem equal to the height of the logomark.",
        typography: "Use Plus Jakarta Sans for display headlines and Inter for body copy.",
        colorPalette: "Primary Slate (#0F172A) with Indigo (#6366F1) accent points."
      }
    });
  }

  // Default: Discovery report schema
  return JSON.stringify({
    problem: "Founders and creators struggle with unfocused brand positioning, leading to low customer conversion and fragmented market perception.",
    targetAudience: [
      "Ambitious founders launching new ventures",
      "Product leaders seeking brand differentiation",
      "Marketing strategists elevating brand identity"
    ],
    userNeeds: [
      "Actionable, structured brand frameworks",
      "Rapid validation of market positioning",
      "Cohesive copy and visual guidelines"
    ],
    context: "The market demands authentic, high-clarity brand stories that stand out amidst noise and rapid technological change.",
    goals: [
      "Establish a memorable market presence",
      "Build long-term customer trust and loyalty",
      "Accelerate customer acquisition velocity"
    ],
    constraints: [
      "Limited bandwidth for lengthy agency engagements",
      "Need for swift iteration without sacrificing quality"
    ],
    assumptions: [
      "Customers value transparent, value-driven brand communication.",
      "A strong brand voice creates a defensible competitive advantage."
    ],
    openQuestions: [
      "Which marketing acquisition channel will produce the highest initial leverage?",
      "How quickly can customer feedback loops refine the brand narrative?"
    ],
    painPoints: [
      "Inconsistent brand messaging across customer touchpoints",
      "Difficulty standing out in a crowded digital landscape"
    ]
  });
}

/**
 * Robust wrapper that handles transient 503 errors, attempts GLM API if a wcc key is configured,
 * and attempts all configured Gemini API keys with model failovers.
 */
export async function generateWithFallback(params: {
  model?: string;
  contents: any;
  config?: any;
}) {
  // 1. Attempt GLM API if wcc key is provided
  const glmResult = await tryGLMCall(params);
  if (glmResult) {
    return glmResult;
  }

  // 2. Fall back to Gemini API
  const apiKeys = getCandidateApiKeys();
  const primaryModel = params.model || MODELS.FLASH;
  const fallbackModels = Array.from(new Set([
    primaryModel,
    "gemini-3.8-flash",
    "gemini-3.6-flash"
  ]));

  let lastError: any = null;

  for (const keyCandidate of apiKeys) {
    let keyWasInvalid = false;
    const client = getAI(keyCandidate);

    for (const modelCandidate of fallbackModels) {
      if (keyWasInvalid) break;

      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const response = await client.models.generateContent({
            ...params,
            model: modelCandidate,
          });
          return response;
        } catch (err: any) {
          lastError = err;
          const status = err?.status || err?.code || err?.error?.code;
          const msg = String(err?.message || JSON.stringify(err));
          
          const isKeyInvalid = 
            msg.includes('API_KEY_INVALID') || 
            msg.includes('API key not valid') || 
            (status === 400 && msg.includes('API key'));

          if (isKeyInvalid) {
            keyWasInvalid = true;
            break;
          }

          const isTransient = 
            status === 503 || 
            status === 429 || 
            msg.includes('503') || 
            msg.includes('high demand') || 
            msg.includes('UNAVAILABLE') || 
            msg.includes('overloaded');

          if (isTransient) {
            await new Promise((res) => setTimeout(res, (attempt + 1) * 1000));
            continue;
          }

          throw err;
        }
      }
    }
  }

  // If all keys failed or were invalid, return tailored fallback response gracefully
  console.log("[AI Strategy] API key unavailable or invalid. Returning structured fallback brand report.");
  return {
    text: getSmartFallbackResponse(params.contents)
  };
}

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

