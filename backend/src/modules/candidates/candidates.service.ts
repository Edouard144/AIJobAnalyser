// candidates service
import { eq, and } from "drizzle-orm";
import { parse } from "csv-parse/sync";
import { db } from "../../config/db";
import { candidates } from "../../db/schema/candidates";
import { jobs } from "../../db/schema/jobs";
import { CandidateInput } from "./candidates.schema";
import { geminiService } from "../screening/gemini.service";

export const candidatesService = {

  // ── Verify job exists and belongs to this recruiter ────────────────────────
  async verifyJobOwnership(jobId: string, recruiterId: string) {
    const [job] = await db
      .select()
      .from(jobs)
      .where(and(eq(jobs.id, jobId), eq(jobs.recruiterId, recruiterId)))
      .limit(1);

    return job || null;
  },

  // ── Scenario 1: Bulk insert structured Umurava profiles ───────────────────
  async bulkInsert(jobId: string, inputs: CandidateInput[]) {
    // Insert all candidates in one DB call — much faster than looping
    const inserted = await db
      .insert(candidates)
      .values(inputs.map((c) => ({ ...c, jobId })))
      .returning();

    return inserted;
  },

  // ── Scenario 2: Parse CSV buffer and insert candidates ────────────────────
  async insertFromCSV(jobId: string, fileBuffer: Buffer) {
    // Parse CSV from memory buffer — no disk I/O
    // Try standard parse first, if fails use raw parsing
    let rows: Record<string, string>[] = [];
    try {
      rows = parse(fileBuffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true,
      }) as Record<string, string>[];
    } catch (parseError: any) {
      // Fallback: parse line by line without complex quote handling
      const lines = fileBuffer.toString().split('\n').filter(line => line.trim());
      if (lines.length < 2) throw new Error("CSV file is empty");
      const headers = lines[0].split(',').map(h => h.trim());
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const row: Record<string, string> = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx]?.trim() || '';
        });
        rows.push(row);
      }
    }

    if (rows.length === 0) throw new Error("CSV file is empty");

    // Helper: parse a cell that may contain JSON array, pipe-separated, or comma-separated values
    const parseArrayField = (value: string | undefined): string[] => {
      if (!value) return [];
      const trimmed = value.trim();
      if (!trimmed) return [];
      // Try JSON parse first (for cells that are JSON arrays like '["Node.js","Python"]')
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => {
            if (typeof item === 'string') return item;
            if (item && typeof item === 'object') {
              if ('name' in item) return String(item.name);
              if ('skill' in item) return String(item.skill);
              if ('title' in item) return String(item.title);
              if ('institution' in item) return String(item.institution);
              if ('company' in item) return String(item.company);
            }
            return String(item);
          }).filter((s: string) => s && s.trim());
        }
      } catch {
        // Not JSON — try pipe-separated (|), then comma-separated
      }
      if (trimmed.includes('|')) {
        return trimmed.split('|').map(s => s.trim()).filter(s => s);
      }
      return trimmed.split(',').map(s => s.trim()).filter(s => s);
    };

    // Helper: parse object field (JSON or pipe-separated key:value pairs)
    const parseObjectField = (value: string | undefined): any => {
      if (!value) return null;
      const trimmed = value.trim();
      if (!trimmed) return null;
      // Try JSON parse first
      try {
        return JSON.parse(trimmed);
      } catch {
        // Try pipe-separated: key:value|key:value
      }
      if (trimmed.includes('|')) {
        const obj: Record<string, string> = {};
        trimmed.split('|').forEach(pair => {
          const [key, val] = pair.split(':');
          if (key && val) obj[key.trim()] = val.trim();
        });
        return Object.keys(obj).length > 0 ? obj : null;
      }
      return null;
    };

    // Map CSV columns to our candidate schema
    const values = rows.map((row) => {
      // Handle separate firstName/lastName or combined fullName
      const fName = row.firstName || row.first_name || row.FirstName || row.fullName?.split(" ")[0] || "Unknown";
      const lName = row.lastName || row.last_name || row.LastName || row.fullName?.split(" ").slice(1).join(" ") || "Candidate";
      
      // Parse complex fields that may be JSON-encoded
      const skillNames = parseArrayField(row.skills);
      const languageNames = parseArrayField(row.languages);
      const educationData = parseArrayField(row.education).length > 0 ? [parseObjectField(row.education)] : [];
      const experienceData = parseArrayField(row.experience).length > 0 ? [parseObjectField(row.experience)] : [];
      const projectData = parseArrayField(row.projects);
      const certData = parseArrayField(row.certifications);
      const availabilityData = parseObjectField(row.availability) || { status: "Available", type: "Full-time" };
      const socialData = parseObjectField(row.social_links) || {};
      
      return {
        jobId,
        firstName:       fName,
        lastName:        lName,
        fullName:        `${fName} ${lName}`.trim(),
        email:           row.email || row.Email || null,
        phone:           row.phone || row.Phone || null,
        headline:        row.headline || row.Headline || row.current_position || "Talent",
        bio:             row.bio || row.Bio || null,
        location:        row.location || row.Location || "Remote",
        
        // Structured fields
        skills:          skillNames.map(name => ({ name, level: "Intermediate", yearsOfExperience: 1 })),
        languages:       languageNames.map(name => ({ name, proficiency: "Fluent" })),
        experience:      experienceData.length > 0 ? experienceData : [],
        education:       educationData.length > 0 ? educationData : [],
        projects:        projectData.length > 0 ? projectData : [],
        certifications:  certData.length > 0 ? certData : [],
        availability:    availabilityData,
        socialLinks:     Object.keys(socialData).length > 0 ? socialData : undefined,
        
        experienceYears: parseInt(row.experience_years || row.experienceYears || row.experience || "0") || 0,
        educationLevel:  row.education_level || row.educationLevel || row.education || null,
        currentPosition: row.current_position || row.position || null,
        source:          "external" as const,
        profileData:     row, 
      };
    });

    const inserted = await db
      .insert(candidates)
      .values(values)
      .returning();

    return inserted;
  },

  // ── Scenario 3: Parse PDF buffer using Gemini and insert candidate ────────
  async insertFromPDF(jobId: string, fileBuffer: Buffer, filename: string = "Resume.pdf") {
    const profile = await geminiService.parseResume(fileBuffer, filename);
    
    if (!profile) throw new Error("Failed to parse resume with AI");

    const [inserted] = await db
      .insert(candidates)
      .values({
        jobId,
        firstName:       profile.firstName,
        lastName:        profile.lastName,
        fullName:        `${profile.firstName} ${profile.lastName}`.trim(),
        email:           profile.email,
        headline:        profile.headline,
        bio:             profile.bio,
        location:        profile.location,
        skills:          profile.skills,
        experience:      profile.experience,
        education:       profile.education,
        projects:        profile.projects,
        availability:    profile.availability,
        socialLinks:     profile.socialLinks,
        source:          "external",
        profileData:     profile,
      })
      .returning();

    return inserted;
  },

  // ── Get all candidates for a job ──────────────────────────────────────────
  async getByJob(jobId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    // Get total count
    const [countResult] = await db
      .select({ count: candidates.id })
      .from(candidates)
      .where(eq(candidates.jobId, jobId));

    const total = Number(countResult?.count) || 0;

    // Get paginated data
    const data = await db
      .select()
      .from(candidates)
      .where(eq(candidates.jobId, jobId))
      .limit(limit)
      .offset(offset);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // ── Get one candidate ─────────────────────────────────────────────────────
  async getOne(candidateId: string, jobId: string) {
    const [candidate] = await db
      .select()
      .from(candidates)
      .where(and(eq(candidates.id, candidateId), eq(candidates.jobId, jobId)))
      .limit(1);

    return candidate || null;
  },

  // ── Delete one candidate ──────────────────────────────────────────────────
  async remove(candidateId: string, jobId: string) {
    const [deleted] = await db
      .delete(candidates)
      .where(and(eq(candidates.id, candidateId), eq(candidates.jobId, jobId)))
      .returning({ id: candidates.id });

    return deleted || null;
  },

  // ── Delete ALL candidates for a job (before re-uploading) ─────────────────
  async removeAll(jobId: string) {
    await db.delete(candidates).where(eq(candidates.jobId, jobId));
  },
};