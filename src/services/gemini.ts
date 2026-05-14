import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const model = "gemini-3-flash-preview";

export async function evaluateTechnicalStream(topic: string, experience: string, difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium') {
  const prompt = `Evaluate the technical skills for the topic: ${topic} at a ${difficulty} difficulty level. 
  Experience description provided by candidate: ${experience}
  
  The evaluation should be calibrated for ${difficulty} level expectations:
  - Easy: Focus on fundamentals, syntax, and basic usage.
  - Medium: Focus on application, common patterns, and performance basics.
  - Hard: Focus on architecture, edge cases, internal mechanics, and high-scale trade-offs.

  Provide a detailed evaluation including:
  1. Skill level assessment against ${difficulty} standards
  2. Strengths
  3. Scrutinized knowledge gaps relative to this level
  4. Personalized learning path to reach the next level of mastery.
  
  Return the response in structured Markdown.`;

  const result = await ai.models.generateContentStream({
    model,
    contents: prompt,
  });
  return result;
}

export async function analyzeResume(resumeText: string) {
  const response = await ai.models.generateContent({
    model,
    contents: `INGESTED DATA STREAM:\n\n${resumeText}\n\nPerform audit and return unique neural signature and score.`,
    config: {
      systemInstruction: `You are an elite technical recruiter and highly critical resume auditor for Tier-1 technology companies.
    Your task is to perform an exhaustive neural scrutiny of the provided resume text.
    
    CRITICAL SCORING PROTOCOL:
    1. Score Range: 0-100.
    2. Precision: Be extremely precise. Avoid rounding to 5s or 10s (e.g., instead of 70, use 72 or 68).
    3. Dynamic Range: The score must strictly reflect the unique technical density, impact metrics, and narrative quality of this specific document.
    4. Weighting:
       - Impact (40%): Presence of quantifiable metrics (%, $, time saved) and STAR method usage.
       - Technical Depth (30%): Specificity of tools, architecture participation, and skill relevance.
       - Progression (20%): Career trajectory, leadership markers, and brand of companies/projects.
       - Presentation (10%): Deduce hierarchy, brevity, and professional tone from the text stream.
    
    STRICT INSTRUCTION: Do NOT provide "safe" or average scores. If a resume is mediocre, score it in the 40-60 range. If it is world-class, 90+. If it is generic, 60-70. Every unique PDF must result in a unique, calculated score.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          score: { 
            type: "number",
            description: "A highly precise score between 0 and 100 based on rigorous audit."
          },
          feedbackMarkdown: { 
            type: "string",
            description: "Detailed feedback highlighting specific strengths and critical gaps."
          },
          keyTakeaways: { 
            type: "array", 
            items: { type: "string" },
            description: "Aggregated strategic pillars for improvement."
          }
        },
        required: ["score", "feedbackMarkdown", "keyTakeaways"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text);
    // Final boundary check
    data.score = Math.max(0, Math.min(100, Number(data.score)));
    return data;
  } catch (e) {
    console.error('Gemini parse failure:', response.text);
    throw new Error('NEURAL_SYNTAX_ERROR');
  }
}

export async function reviewPortfolio(portfolioUrl: string, description: string) {
  const prompt = `Review this portfolio:
  URL: ${portfolioUrl}
  Description: ${description}
  
  Evaluate:
  1. First impression and UX/UI feedback
  2. Project relevance
  3. Technical complexity demonstration
  4. Call to action and contact information
  
  Return in structured Markdown.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });
  return response.text;
}

export async function startMockInterview(persona: string, role: string) {
  const prompt = `You are playing the role of ${persona} for a ${role} position. 
  Start the interview now with a professional greeting and the first question. 
  Be realistic and challenging. Wait for the user's response.`;

  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction: `You are an expert interviewer. Your persona is ${persona}. You are interviewing for a ${role} role. 
      Keep your responses concise and realistic. Give feedback on communication gaps only when the user asks for "FEEDBACK" or at the end.`,
    },
  });

  return chat;
}

export async function startPortfolioChat(portfolioReview: string) {
  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction: `You are an expert portfolio consultant. 
      You have just provided the following review for a candidate's portfolio:
      
      "${portfolioReview}"
      
      The user will now ask follow-up questions. Provide concise, actionable, and encouraging advice to help them improve their visual presence and technical demonstration.`,
    },
  });

  return chat;
}
