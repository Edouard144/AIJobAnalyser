import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../../config/env";
import Groq from "groq-sdk";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const groq = new Groq({ apiKey: env.GROQ_API_KEY });

const DEFAULT_MODEL = "gemini-2.5-flash";

export interface AIResult {
  candidateId: string;
  rank: number;
  score: number;
  strengths: string[];
  gaps: string[];
  recommendation: string;
}

export interface UmuravaProfile {
  firstName: string;
  lastName: string;
  email: string;
  headline: string;
  bio?: string;
  location: string;
  skills: Array<{ name: string; level: string; yearsOfExperience: number }>;
  languages?: Array<{ name: string; proficiency: string }>;
  experience: Array<{
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    description: string;
    technologies: string[];
    isCurrent: boolean;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startYear: number;
    endYear: number;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    role: string;
    link?: string;
    startDate: string;
    endDate: string;
  }>;
  availability: {
    status: string;
    type: string;
    startDate?: string;
  };
  socialLinks?: Record<string, string>;
}

export const geminiService = {
  async screenCandidates(
    job: {
      title: string;
      description: string | null;
      requiredSkills: string[] | null;
      experienceYears: number | null;
      educationLevel: string | null;
      location: string | null;
    },
    candidates: any[],
    topN: number = 10
  ): Promise<AIResult[]> {
    const cleanCandidate = (c: any) => {
  const fname = c.firstName || '';
  const lname = c.lastName || '';
  const name = String(c.fullName || (fname && lname ? fname + ' ' + lname : fname || lname || 'Unknown')).substring(0, 100);
  const skills = (c.skills || []).map((s: any) => typeof s === 'string' ? s : s?.name || '').filter((s: string) => s && s.length < 50).slice(0, 5);
  const email = String(c.email || '').substring(0, 80);
  return {
    id: String(c.id || '').substring(0, 50),
    name: name || 'Unknown',
    email: email,
    skills: skills,
    yearsOfExperience: Number(c.experienceYears) || 0,
    currentPosition: String(c.currentPosition || '').substring(0, 100),
  };
};

const prompt = `
You are an expert AI recruiter assistant, evaluating candidates against a specific job role.
You must return ONLY a strict JSON array containing the top ${topN} ranked candidates.

JOB TITLE: ${job.title}
REQUIRED SKILLS: ${job.requiredSkills?.join(", ") || "None"}
REQUIRED EXPERIENCE: ${job.experienceYears || 0} years

CANDIDATES:
${candidates.map((c, i) => {
  const clean = cleanCandidate(c);
  return `${i + 1}. ${clean.name} | ${clean.yearsOfExperience}y exp | Skills: ${clean.skills.join(', ')}`;
}).join('\n')}

Return JSON array with this EXACT structure (use candidate UUIDs from the list above):
[
  { "candidateId": "uuid-from-above-list", "rank": 1, "score": 85, "strengths": ["..."], "gaps": ["..."], "finalRecommendation": "SHORTLIST: ..." }
]
`;
    try {

      const geminiModel = genAI.getGenerativeModel({ model: DEFAULT_MODEL });
      const result = await geminiModel.generateContent(prompt);
      const rawText = result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const text = rawText.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
      const parsed = JSON.parse(text);
      
      // Map results back to actual candidate IDs using the candidateId field
      return parsed.map((item: any, index: number) => {
        const candidateId = item.candidateId;
        const rank = item.rank || (index + 1);
        return {
          candidateId: candidateId, // Use the UUID from AI results
          rank: rank,
          score: item.score,
          strengths: item.strengths || [],
          gaps: item.gapsRisks || item.gaps || [],
          recommendation: item.finalRecommendation || item.recommendation || ""
        };
      });
    } catch (geminiError: any) {
      console.warn("⚠️ GEMINI FAILED. Falling back to GROQ (Llama 3.3)...", geminiError.message);
      try {
        const fallbackPrompt = prompt;
        const groqResponse = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: fallbackPrompt + "\nProvide pure JSON output strictly formatted as expected." }],
          response_format: { type: "json_object" }
        });
        const groqText = groqResponse.choices[0]?.message?.content || "{}";
        const cleanGroqText = groqText.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
        let parsed = JSON.parse(cleanGroqText);
        if (parsed && !Array.isArray(parsed) && Array.isArray(parsed.results)) parsed = parsed.results;
        else if (parsed && !Array.isArray(parsed) && Array.isArray(parsed.candidates)) parsed = parsed.candidates;
        else if (parsed && !Array.isArray(parsed)) parsed = [parsed];
        
        // Map results back to actual candidate IDs using index order
        return parsed.map((item: any, index: number) => {
          const rank = item.rank || (index + 1);
          // Map by array position since AI should return candidateId
          const matchedCandidate = candidates[rank - 1] || candidates[index] || candidates[candidates.length - 1];
          return {
            candidateId: matchedCandidate?.id || candidates[0]?.id || item.candidateId,
            rank: rank,
            score: item.score || 50,
            strengths: item.strengths || [],
            gaps: item.gapsRisks || item.gaps || [],
            recommendation: item.finalRecommendation || item.recommendation || ""
          };
        });
      } catch (groqError: any) {
        console.warn("❌ GROQ FAILED. Activating Precise Heuristic Rescue Engine...", groqError.message);

        const TECH_STACK = ["React", "Node", "TypeScript", "Python", "Java", "SQL", "AWS", "Docker", "Next.js", "Figma"];

        const scored = candidates.map(c => {
          let score = 30;
          const jobSkills = (job.requiredSkills || []).map(s => String(s).toLowerCase());

          const candidateProfileText = [
            ...(c.skills || []).map((s: any) => typeof s === 'string' ? s : s.name),
            ...(c.projects || []).flatMap((p: any) => [p.name, p.description, ...(p.technologies || [])]),
            c.headline,
            c.bio
          ].join(" ").toLowerCase();

          const projectTechs = (c.projects || []).flatMap((p: any) => p.technologies || []).map((t: string) => t.toLowerCase());
          const projectMatches = jobSkills.filter(s => projectTechs.includes(s));
          if (projectMatches.length > 0) score += 10;

          const matches = jobSkills.filter(s => candidateProfileText.includes(s));
          score += (matches.length / Math.max(jobSkills.length, 1)) * 30;

          const expMatch = c.experienceYears >= (job.experienceYears || 0);
          if (expMatch) score += 15;

          const edu = String(c.educationLevel || "").toLowerCase();
          if (edu.includes("phd") || edu.includes("doctorate")) score += 15;
          else if (edu.includes("master")) score += 10;
          else if (edu.includes("bachelor") || edu.includes("degree")) score += 5;

          const strengths: string[] = [];
          if (matches.length > 0) strengths.push(`Detected expertise in: ${matches.slice(0, 3).join(", ")}`);
          if (projectMatches.length > 0) strengths.push(`Applied ${projectMatches.join(", ")} in real projects`);
          if (expMatch) strengths.push(`${c.experienceYears || 0}y professional experience meets requirements`);

          const gaps = jobSkills.filter(s => !matches.includes(s)).slice(0, 2);
          if (c.experienceYears < (job.experienceYears || 0)) gaps.push(`Short on experience (Needs ${job.experienceYears}y)`);

          return {
            candidateId: c.id,
            score: Math.min(Math.round(score), 100),
            strengths: strengths.length > 0 ? strengths : ["General profile relevance matches standard expectations"],
            gaps: gaps.length > 0 ? gaps.map(g => `Gap identified: ${g}`) : [],
            recommendation: score > 80 ? "SHORTLIST: Exceptional match verified by multi-dimensional heuristic scan." :
              score > 60 ? "CONSIDER: Viable candidate with substantial overlap in core requirements." : "REJECT: Critical mismatches found during heuristic evaluation."
          };
        });

        return scored
          .sort((a, b) => b.score - a.score)
          .slice(0, topN)
          .map((s, i) => ({ ...s, rank: i + 1 }));
      }
    }
  },


  async generateInterviewKit(
    job: { title: string; requiredSkills: string[] },
    candidate: any
  ): Promise<string[]> {
    const prompt = `
Generate 3 tailored interview questions for ${candidate.firstName} for the ${job.title} position.
RELEVANT SKILLS: ${candidate.skills?.map((s: any) => typeof s === 'string' ? s : s.name).join(", ")}
JOB REQS: ${job.requiredSkills.join(", ")}
Focus on their specific gaps or how their unique projects relate to the job.
RETURN ONLY A JSON ARRAY OF STRINGS.
`;
    try {
      const geminiModel = genAI.getGenerativeModel({ model: DEFAULT_MODEL });
      const result = await geminiModel.generateContent(prompt);
      const rawText = result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const text = rawText.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
      return JSON.parse(text);
    } catch (geminiErr: any) {
      console.warn("⚠️ GEMINI FAILED. Falling back to GROQ...");
      try {
        const fallbackPrompt = prompt;
        const groqResponse = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: fallbackPrompt + "\nWrap the array inside a JSON object: { \"questions\": [...] }" }],
          response_format: { type: "json_object" }
        });
        const groqText = groqResponse.choices[0]?.message?.content || "{}";
        return JSON.parse(groqText.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim()).questions || [];
      } catch (groqErr: any) {
        console.warn("⚠️ GROQ FAILED. Using Smart Question Fallback.");
        return [
          `How have you applied your ${candidate.skills?.[0]?.name || 'technical'} skills in your most significant project?`,
          `Given the requirements for ${job.title}, how do you plan to address the learning curve for any tools you haven't used yet?`,
          `Can you walk us through a challenging project where you had to solve a complex performance or architectural issue?`
        ];
      }
    }
  },
};
