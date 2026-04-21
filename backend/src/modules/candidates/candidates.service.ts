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
    // Transform inputs to proper format (Umurava Schema)
    const transformed = inputs.map((c: any) => {
      // Handle name fields
      const firstName = c.firstName || '';
      const lastName = c.lastName || '';
      const fullName = c.fullName || c.name || `${firstName} ${lastName}`.trim() || 'Unknown';
      
      // Handle skills - convert strings to objects
      let skills: any[] = [];
      if (Array.isArray(c.skills)) {
        skills = c.skills.map((s: any) => {
          if (typeof s === 'string') {
            return { name: s, level: 'Intermediate', yearsOfExperience: 1 };
          }
          return {
            name: s.name || s.skill || '',
            level: s.level || 'Intermediate',
            yearsOfExperience: s.yearsOfExperience || 1
          };
        });
      }
      
      // Handle languages
      const languages = Array.isArray(c.languages) ? c.languages.map((l: any) => ({
        name: l.name || l.language || '',
        proficiency: l.proficiency || 'Fluent'
      })) : [];

      // Handle experience
      const experience = Array.isArray(c.experience) ? c.experience.map((e: any) => ({
        company: e.company || '',
        role: e.role || e.position || '',
        startDate: e.startDate || '',
        endDate: e.endDate || (e.isCurrent ? 'Present' : ''),
        description: e.description || '',
        technologies: Array.isArray(e.technologies) ? e.technologies : [],
        isCurrent: e.isCurrent || false
      })) : [];

      // Handle education
      const education = Array.isArray(c.education) ? c.education.map((e: any) => ({
        institution: e.institution || '',
        degree: e.degree || '',
        fieldOfStudy: e.fieldOfStudy || e.field || '',
        startYear: e.startYear || 0,
        endYear: e.endYear || 0
      })) : [];

      // Handle projects
      const projects = Array.isArray(c.projects) ? c.projects.map((p: any) => ({
        name: p.name || '',
        description: p.description || '',
        technologies: Array.isArray(p.technologies) ? p.technologies : [],
        role: p.role || '',
        link: p.link || p.url || '',
        startDate: p.startDate || '',
        endDate: p.endDate || ''
      })) : [];

      // Handle certifications
      const certifications = Array.isArray(c.certifications) ? c.certifications.map((cert: any) => ({
        name: cert.name || '',
        issuer: cert.issuer || '',
        issueDate: cert.issueDate || ''
      })) : [];

      // Handle availability
      const availability = c.availability ? {
        status: c.availability.status || 'Available',
        type: c.availability.type || 'Full-time',
        startDate: c.availability.startDate || ''
      } : { status: 'Available', type: 'Full-time' };

      // Calculate years of experience from experience array
      const calculateYears = (exp: any[]): number => {
        return exp.reduce((total: number, e: any) => {
          if (e.isCurrent) {
            const start = parseInt(e.startDate?.split('-')[0] || '0');
            return total + (start > 0 ? new Date().getFullYear() - start : 0);
          }
          const start = parseInt(e.startDate?.split('-')[0] || '0');
          const end = e.endDate === 'Present' ? new Date().getFullYear() : parseInt(e.endDate?.split('-')[0] || '0');
          return total + (end > start ? end - start : 0);
        }, 0);
      };

      const expYears = experience.length > 0 ? calculateYears(experience) : (Number(c.experienceYears) || 0);
      
      return {
        jobId,
        firstName,
        lastName,
        fullName,
        email: c.email || null,
        phone: c.phone || null,
        headline: c.headline || null,
        bio: c.bio || null,
        location: c.location || null,
        skills: skills.length > 0 ? skills : [],
        languages: languages.length > 0 ? languages : [],
        experience: experience.length > 0 ? experience : [],
        education: education.length > 0 ? education : [],
        projects: projects.length > 0 ? projects : [],
        certifications: certifications.length > 0 ? certifications : [],
        availability: availability,
        socialLinks: c.socialLinks || {},
        experienceYears: expYears > 0 ? expYears : 0,
        educationLevel: c.educationLevel || c.education || null,
        currentPosition: c.currentPosition || c.position || null,
        source: c.source === 'umurava' ? 'umurava' : 'external',
      };
    });

    const inserted = await db
      .insert(candidates)
      .values(transformed)
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

    // Helper: parse availability (JSON, pipe-separated status|type, or comma)
    const parseAvailability = (value: string | undefined): { status: string; type: string } => {
      if (!value) return { status: "Available", type: "Full-time" };
      const trimmed = value.trim();
      if (!trimmed) return { status: "Available", type: "Full-time" };
      // Try JSON parse first
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.status || parsed.type) return parsed;
      } catch {}
      // Handle pipe-separated: Available|Full-time or comma: Available,Full-time
      const parts = trimmed.includes('|') ? trimmed.split('|') : trimmed.split(',');
      return {
        status: parts[0]?.trim() || "Available",
        type: parts[1]?.trim() || "Full-time"
      };
    };

    // Helper: parse experience/education (pipe-separated)
    const parseExperience = (value: string | undefined): any[] => {
      if (!value) return [];
      const trimmed = value.trim();
      if (!trimmed) return [];
      // Handle pipe-separated: company|role|start|end|description
      if (trimmed.includes('|')) {
        const parts = trimmed.split('|');
        const startYear = parseInt(parts[2]) || 0;
        const endYear = parts[3]?.trim().toLowerCase() === 'present' 
          ? new Date().getFullYear() 
          : parseInt(parts[3]) || startYear;
        const years = endYear - startYear;
        return [{
          company: parts[0]?.trim() || "",
          role: parts[1]?.trim() || "",
          startDate: parts[2]?.trim() || "",
          endDate: parts[3]?.trim() || "",
          description: parts[4]?.trim() || "",
          technologies: [],
          isCurrent: parts[3]?.trim().toLowerCase() === 'present',
          yearsOfExperience: years > 0 ? years : 0
        }];
      }
      return [];
    };

    // Helper: calculate total years of experience from experience array
    const calculateYearsOfExperience = (experienceData: any[]): number => {
      if (!experienceData || experienceData.length === 0) return 0;
      return experienceData.reduce((total: number, exp: any) => {
        return total + (exp.yearsOfExperience || 0);
      }, 0);
    };

    const parseEducation = (value: string | undefined): any[] => {
      if (!value) return [];
      const trimmed = value.trim();
      if (!trimmed) return [];
      // Handle pipe-separated: institution|degree|field|startYear|endYear
      if (trimmed.includes('|')) {
        const parts = trimmed.split('|');
        return [{
          institution: parts[0]?.trim() || "",
          degree: parts[1]?.trim() || "",
          fieldOfStudy: parts[2]?.trim() || "",
          startYear: parseInt(parts[3]) || 0,
          endYear: parseInt(parts[4]) || 0
        }];
      }
      return [];
    };

    // Map CSV columns to our candidate schema
    const values = rows.map((row) => {
      // Handle separate firstName/lastName or combined fullName
      const fName = row.firstName || row.first_name || row.FirstName || row.fullName?.split(" ")[0] || "Unknown";
      const lName = row.lastName || row.last_name || row.LastName || row.fullName?.split(" ").slice(1).join(" ") || "Candidate";
      
      // Parse complex fields using new helpers
      const skillNames = parseArrayField(row.skills);
      const languageNames = parseArrayField(row.languages);
      const educationData = parseEducation(row.education);
      const experienceData = parseExperience(row.experience);
      const projectData = parseArrayField(row.projects);
      const certData = parseArrayField(row.certifications);
      const availabilityData = parseAvailability(row.availability);
      const socialData = {};
      
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
        
        // Calculate years of experience from parsed data, fallback to CSV column
        experienceYears: calculateYearsOfExperience(experienceData) || 
                          parseInt(row.experience_years || row.experienceYears || row.years_experience || "0") || 0,
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