import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../../config/env";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

// Use gemini-1.5-flash-latest — more robust alias for current SDK
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

export interface AIResult {
  candidateId:    string;
  rank:           number;
  score:          number;
  strengths:      string[];
  gaps:           string[];
  recommendation: string;
}

export interface ParsedProfile {
  fullName:        string;
  email:           string | null;
  phone:           string | null;
  skills:          string[];
  experienceYears: number;
  educationLevel:  string | null;
  currentPosition: string | null;
  summary:         string | null;
}

export const geminiService = {

  async screenCandidates(
    job: {
      title:           string;
      description:     string | null;
      requiredSkills:  string[] | null;
      experienceYears: number | null;
      educationLevel:  string | null;
      location:        string | null;
    },
    candidates: {
      id:              string;
      fullName:        string | null;
      skills:          string[] | null;
      experienceYears: number | null;
      educationLevel:  string | null;
      currentPosition: string | null;
      profileData:     unknown;
      resumeUrl:       string | null;
      source:          string | null;
    }[],
    topN: number = 10
  ): Promise<AIResult[]> {

    const prompt = `
You are an expert AI recruiter assistant. Your job is to screen candidates for a job and return a ranked shortlist.

## JOB DETAILS
- Title: ${job.title}
- Description: ${job.description || "Not provided"}
- Required Skills: ${job.requiredSkills?.join(", ") || "Not specified"}
- Minimum Experience: ${job.experienceYears ?? 0} years
- Education Level: ${job.educationLevel || "Not specified"}
- Location: ${job.location || "Not specified"}

## CANDIDATES
${candidates.map((c, i) => `
Candidate ${i + 1}:
- ID: ${c.id}
- Name: ${c.fullName || "Unknown"}
- Skills: ${c.skills?.join(", ") || "Not listed"}
- Experience: ${c.experienceYears ?? 0} years
- Education: ${c.educationLevel || "Not specified"}
- Current Position: ${c.currentPosition || "Not specified"}
- Resume: ${c.resumeUrl || "Not provided"}
`).join("\n")}

## SCORING CRITERIA (weighted)
- Skills match: 40%
- Years of experience: 25%
- Education level: 15%
- Current role relevance: 20%

## YOUR TASK
1. Evaluate every candidate against the job requirements
2. Score each from 0 to 100 using the weighted criteria above
3. Return ONLY the top ${topN} candidates, ranked by score (highest first)
4. Be honest about gaps — do not inflate scores

## OUTPUT FORMAT
Return ONLY a valid JSON array. No explanation, no markdown, no code blocks. Just raw JSON.

[
  {
    "candidateId": "exact candidate ID from above",
    "rank": 1,
    "score": 92.5,
    "strengths": ["strength one", "strength two"],
    "gaps": ["gap one"],
    "recommendation": "One clear sentence on why this candidate should be interviewed"
  }
]
`;

    const result = await model.generateContent(prompt);
    const text   = result.response.text().trim();

    // Strip markdown code blocks if Gemini wraps response anyway
    const clean = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    let parsed: AIResult[];

    try {
      parsed = JSON.parse(clean);
    } catch {
      throw new Error(`Gemini returned invalid JSON: ${clean.slice(0, 300)}`);
    }

    if (!Array.isArray(parsed)) {
      throw new Error("Gemini response is not an array");
    }

    return parsed;
  },

  async parseResume(fileBuffer: Buffer): Promise<ParsedProfile> {
    const prompt = `
You are an expert HR data extractor. Your task is to extract structured information from a resume PDF.
Focus on accuracy and professional details.

## OUTPUT FORMAT
Return ONLY a valid JSON object. No explanation, no markdown, no code blocks. Just raw JSON.

{
  "fullName": "Full Name",
  "email": "email@example.com",
  "phone": "+123456789",
  "skills": ["Skill 1", "Skill 2"],
  "experienceYears": 5,
  "educationLevel": "Bachelor's Degree",
  "currentPosition": "Senior Software Engineer",
  "summary": "Brief professional summary extracted from the profile"
}
`;

    const result = await model.generateContent([
      {
        inlineData: {
          data: fileBuffer.toString("base64"),
          mimeType: "application/pdf",
        },
      },
      prompt,
    ]);

    const text = result.response.text().trim();
    const clean = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    try {
      return JSON.parse(clean);
    } catch {
      throw new Error(`Gemini returned invalid JSON for resume: ${clean.slice(0, 300)}`);
    }
  },
};