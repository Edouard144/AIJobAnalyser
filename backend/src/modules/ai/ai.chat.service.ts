// AI chat service
import { GoogleGenerativeAI } from "@google/generative-ai";
import { eq, desc } from "drizzle-orm";
import { db } from "../../config/db";
import { chatSessions } from "../../db/schema/chat";
import { jobs } from "../../db/schema/jobs";
import { candidates } from "../../db/schema/candidates";
import { screeningResults } from "../../db/schema/screening";
import { env } from "../../config/env";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export const aiChatService = {
  
  // Send chat message
  async chat(userId: string, jobId: string | null, question: string) {
    // Get job context if provided
    let jobContext = null;
    let candidatesData: any[] = [];
    
    if (jobId) {
      const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);
      if (job) {
        jobContext = job;
        // Get candidates for this job
        const cands = await db.select().from(candidates).where(eq(candidates.jobId, jobId));
        candidatesData = cands;
        // Get screening results
        const results = await db.select().from(screeningResults).where(eq(screeningResults.jobId, jobId));
        candidatesData = candidatesData.map((c: any) => {
          const result = results.find((r: any) => r.candidateId === c.id);
          return { ...c, score: result?.score, rank: result?.rank };
        });
      }
    }
    
    // Build context for AI
    const contextPrompt = jobContext ? `
JOB CONTEXT:
- Title: ${jobContext.title}
- Description: ${jobContext.description || "N/A"}
- Required Skills: ${(jobContext.requiredSkills || []).join(", ")}
- Experience: ${jobContext.experienceYears || 0} years
- Location: ${jobContext.location}

CANDIDATES (${candidatesData.length}):
${JSON.stringify(candidatesData.slice(0, 20).map(c => ({
  name: c.fullName,
  skills: c.skills,
  experience: c.experienceYears,
  score: c.score,
  rank: c.rank
})), null, 2)}
` : "No specific job context. Answer generally about recruitment.";
    
    // Get chat history
    let history: any[] = [];
    if (jobId) {
      const [session] = await db.select().from(chatSessions)
        .where(eq(chatSessions.jobId, jobId))
        .orderBy(desc(chatSessions.createdAt))
        .limit(1);
      if (session?.messages && Array.isArray(session.messages)) {
        history = session.messages as any[];
      }
    }
    
    // Build prompt with history
    const chatHistory = history.map((m: any) => `${m.role === 'user' ? 'Human' : 'AI'}: ${m.content}`).join('\n');
    
    const fullPrompt = `${contextPrompt}

CHAT HISTORY:
${chatHistory}

Current question: ${question}

Instructions:
- Answer based on the job and candidate data provided
- Be concise and helpful
- If asking about specific candidates, reference their scores and strengths
- If no job specified, ask which job they want to analyze
- Format your response in clear, readable way

AI:`;
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(fullPrompt);
      const answer = result.response.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response.";
      
      // Save to chat history
      const newMessages = [...history, 
        { role: 'user', content: question, timestamp: new Date().toISOString() },
        { role: 'assistant', content: answer, timestamp: new Date().toISOString() }
      ];
      
      if (jobId) {
        await db
          .insert(chatSessions)
          .values({ userId, jobId, messages: newMessages })
          .onConflictDoUpdate({ target: chatSessions.id, set: { messages: newMessages } });
      }
      
      return { answer };
    } catch (error: any) {
      console.error("AI Chat error:", error.message);
      return { answer: "Sorry, I had trouble processing that. Please try again." };
    }
  },
  
  // Get chat history for a job
  async getHistory(userId: string, jobId: string) {
    const [session] = await db.select().from(chatSessions)
      .where(eq(chatSessions.jobId, jobId))
      .orderBy(desc(chatSessions.createdAt))
      .limit(1);
    
    return session?.messages || [];
  },
  
  // Parse natural language filter
  async parseFilter(query: string) {
    const prompt = `
Analyze this recruiter query and extract structured filters for finding candidates.

Query: "${query}"

Extract and return ONLY a valid JSON object with these fields:
- skills: array of required skills (strings)
- minExperience: number (minimum years)
- maxExperience: number (maximum years)  
- education: string (required education level, e.g. "bachelor", "master")
- location: string (preferred location)
- source: string (preferred source, e.g. "umurava", "external")

Example output:
{"skills": ["React", "TypeScript"], "minExperience": 3, "education": "bachelor"}

If any field is not mentioned, use null for that field.
Return ONLY the JSON, no other text.`;
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      
      // Parse JSON from response
      const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
      return JSON.parse(cleaned);
    } catch (error: any) {
      console.error("Filter parse error:", error.message);
      return { skills: [], minExperience: null };
    }
  }
};