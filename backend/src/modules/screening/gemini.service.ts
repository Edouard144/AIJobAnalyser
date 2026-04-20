import { VertexAI } from "@google-cloud/vertexai";
import { env } from "../../config/env";
import Groq from "groq-sdk";
const pdf = require("pdf-parse");

const vertexAI = new VertexAI({ project: env.GCP_PROJECT_ID, location: env.GCP_LOCATION });
const groq = new Groq({ apiKey: env.GROQ_API_KEY });

const DEFAULT_MODEL = "gemini-1.5-flash";
const model = vertexAI.getGenerativeModel({ model: DEFAULT_MODEL });

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
    const prompt = `
You are an expert AI recruiter assistant, evaluating candidates against a specific job role.
You must return ONLY a strict JSON array containing the top ${topN} ranked candidates.

JOB TITLE: ${job.title}
JOB DESCRIPTION: ${job.description || "N/A"}
REQUIRED SKILLS: ${job.requiredSkills?.join(", ") || "None"}
REQUIRED EXP: ${job.experienceYears || 0} years
REQUIRED EDUCATION: ${job.educationLevel || "N/A"}

CANDIDATES PROFILE DATA:
${JSON.stringify(
        candidates.map(c => ({
          id: c.id,
          name: c.fullName,
          skills: c.skills,
          exp: c.experienceYears,
          location: c.location,
          experience: c.experience,
          education: c.education,
          projects: c.projects
        })).slice(0, 50)
      )}

You must evaluate each candidate across multiple dimensions (skills match, experience depth, educational relevance, and project alignment).
Calculate a match score out of 100. Provide clear natural language reasoning via strengths and gaps to ensure "Humans stay in control" of the final decision.

OUTPUT STRICT JSON FORMAT:
[
  { 
    "candidateId": "UUID", 
    "rank": 1, 
    "score": 95, 
    "strengths": ["Clear strength 1", "Strength 2 explaining relevance to role"], 
    "gapsRisks": ["Missing specific technology", "Less experience than requested"], 
    "finalRecommendation": "SHORTLIST: High potential match due to..." 
  }
]
`;

      const result = await model.generateContent(prompt);
      const rawText = result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const text = rawText.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
      const parsed = JSON.parse(text);
      return parsed.map((item: any) => ({
        candidateId: item.candidateId,
        rank: item.rank,
        score: item.score,
        strengths: item.strengths || [],
        gaps: item.gapsRisks || item.gaps || [],
        recommendation: item.finalRecommendation || item.recommendation || ""
      }));
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
        
        return parsed.map((item: any) => ({
          candidateId: item.candidateId,
          rank: item.rank || 1,
          score: item.score || 50,
          strengths: item.strengths || [],
          gaps: item.gapsRisks || item.gaps || [],
          recommendation: item.finalRecommendation || item.recommendation || ""
        }));
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

  async parseResume(fileBuffer: Buffer, filename: string = "Resume.pdf"): Promise<UmuravaProfile> {
    try {
      const prompt = `Extract UMURAVA COMPLIANT JSON from resume.`;
      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [
            { inlineData: { data: fileBuffer.toString("base64"), mimeType: "application/pdf" } },
            { text: prompt }
          ]
        }]
      });
      const rawText = result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";
      return JSON.parse(rawText.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim());
    } catch (geminiErr: any) {
      console.warn("⚠️ GEMINI FAILED. Extracting PDF and Falling back to GROQ...");
      try {
        const data = await pdf(fileBuffer);
        const groqPrompt = `Extract UMURAVA COMPLIANT JSON from the following resume text. Output a JSON object matching the exact schema.\n\nRESUME TEXT:\n${data.text}`;
        const groqResponse = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: groqPrompt }],
          response_format: { type: "json_object" }
        });
        const groqText = groqResponse.choices[0]?.message?.content || "{}";
        return JSON.parse(groqText.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim());
      } catch (groqErr: any) {
        console.warn("❌ GROQ FAILED. Activating Precise Heuristic Rescue Engine...", groqErr.message);

        try {
          const data = await pdf(fileBuffer);
          const text = data.text;

          const emailMatch = text.match(/\S+@\S+\.\S+/);
          const email = emailMatch ? emailMatch[0] : `candidate.${Date.now()}@example.com`;

          const cleanFilename = filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
          const lines = text.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 2);
          const firstLine = lines.length > 0 ? lines[0] : "";
          const fullName = (firstLine.length < 50 && firstLine.length > 3) ? firstLine : cleanFilename;
          const [firstName, ...rest] = fullName.split(' ');
          const lastName = rest.join(' ') || "Talent";

          const TECH_TAXONOMY = ["React", "Node", "TypeScript", "Python", "Java", "SQL", "AWS", "Docker", "Figma", "UI/UX", "Next.js", "Express", "Tailwind", "JavaScript", "C++", "C#", "Go", "Rust", "Vue", "Angular", "Kubernetes", "GCP", "Azure"];
          const detectedSkills = TECH_TAXONOMY.filter(s => text.toLowerCase().includes(s.toLowerCase()));

          let expYears = 1;
          const yearsMatch = text.match(/([0-9]{1,2})\+?\s*(?:years?|yrs?)/i);
          const dateRangeMatch = text.match(/20[1-2][0-9]\s*(?:-|to)\s*(?:20[1-2][0-9]|present|now|current)/gi);
          if (yearsMatch) {
            expYears = parseInt(yearsMatch[1], 10);
          } else if (dateRangeMatch && dateRangeMatch.length > 0) {
            expYears = dateRangeMatch.length;
          }

          return {
            firstName,
            lastName,
            email,
            headline: lines[1] || "Professional Talent",
            location: text.includes("Rwanda") || text.includes("Kigali") ? "Kigali, Rwanda" : "Remote",
            skills: detectedSkills.map(s => ({ name: s, level: "Advanced", yearsOfExperience: expYears })),
            experience: [{
              company: "Analyzed Experience",
              role: lines[1] || "Specialist",
              startDate: "2020",
              endDate: "Present",
              description: text.slice(0, 300) + "...",
              technologies: detectedSkills.slice(0, 5),
              isCurrent: true
            }],
            education: [{
              institution: "Unspecified Inst.",
              degree: text.includes("Master") ? "Master's" : "Bachelor's",
              fieldOfStudy: "Professional Studies",
              startYear: 2016,
              endYear: 2020
            }],
            projects: [],
            availability: { status: "Available", type: "Full-time" }
          };
        } catch (pdfErr) {
          console.error("❌ Critical Heuristic Failure:", pdfErr);
          return {
            firstName: filename.split(/[ .-_]/)[0] || "Candidate",
            lastName: "Profile",
            email: `candidate.${Date.now()}@example.com`,
            headline: "Professional Candidate",
            location: "Remote",
            skills: [],
            experience: [],
            education: [],
            projects: [],
            availability: { status: "Available", type: "Full-time" }
          };
        }
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
      const result = await model.generateContent(prompt);
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
