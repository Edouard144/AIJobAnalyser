import swaggerJsdoc from "swagger-jsdoc";
import path from "path";

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AIRECRUIT API",
      version: "1.0.0",
      description: `
## AI-Powered Recruitment Platform API

This API powers the **AIRECRUIT** platform — an intelligent recruitment system that lets you:
- **Manage Jobs**: Create, update, and track job postings.
- **Manage Candidates**: Add candidates manually, in bulk (JSON), or via CSV upload.
- **AI Screening**: Trigger Gemini-powered AI screening to rank and evaluate candidates.
- **Auth**: JWT-based authentication with access & refresh token flows.

### Authentication
All protected endpoints require a Bearer token in the \`Authorization\` header:
\`\`\`
Authorization: Bearer <your_access_token>
\`\`\`
      `,
      contact: {
        name: "API Support",
        email: "support@airecruit.com",
      },
      license: {
        name: "ISC",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
    ],
    tags: [
      {
        name: "Auth",
        description: "User registration, login, token refresh and profile",
      },
      {
        name: "Jobs",
        description: "Job posting CRUD and status management",
      },
      {
        name: "Candidates",
        description: "Candidate management per job (JSON bulk insert & CSV upload)",
      },
      {
        name: "Screening",
        description: "AI-powered candidate screening powered by Google Gemini",
      },
      {
        name: "Health",
        description: "Server and database health checks",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter the JWT access token obtained from `/api/auth/login`",
        },
      },
      schemas: {
        // ─── Generic ─────────────────────────────────────────────────────────
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Something went wrong" },
          },
        },
        ValidationError: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Validation failed" },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string", example: "email" },
                  message: { type: "string", example: "Invalid email address" },
                },
              },
            },
          },
        },
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Operation successful" },
          },
        },
        HealthResponse: {
          type: "object",
          properties: {
            status: { type: "string", example: "ok" },
            timestamp: { type: "string", format: "date-time", example: "2024-01-01T00:00:00.000Z" },
          },
        },
        Pagination: {
          type: "object",
          properties: {
            page:       { type: "integer", example: 1 },
            limit:      { type: "integer", example: 10 },
            total:      { type: "integer", example: 42 },
            totalPages: { type: "integer", example: 5 },
          },
        },
        // ─── Auth ─────────────────────────────────────────────────────────────
        User: {
          type: "object",
          properties: {
            id:        { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" },
            email:     { type: "string", format: "email", example: "recruiter@example.com" },
            firstName: { type: "string", example: "Alice" },
            lastName:  { type: "string", example: "Smith" },
            role:      { type: "string", enum: ["ADMIN", "RECRUITER"], example: "RECRUITER" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        AuthTokens: {
          type: "object",
          properties: {
            accessToken:  { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
            refreshToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "object",
              properties: {
                user:   { $ref: "#/components/schemas/User" },
                tokens: { $ref: "#/components/schemas/AuthTokens" },
              },
            },
          },
        },
        // ─── Jobs ─────────────────────────────────────────────────────────────
        Job: {
          type: "object",
          properties: {
            id:               { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440001" },
            title:            { type: "string", example: "Senior Backend Engineer" },
            description:      { type: "string", example: "We are looking for a senior backend engineer..." },
            department:       { type: "string", example: "Engineering" },
            location:         { type: "string", example: "Remote" },
            employmentType:   { type: "string", enum: ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"], example: "FULL_TIME" },
            status:           { type: "string", enum: ["OPEN", "CLOSED", "DRAFT"], example: "OPEN" },
            requirements: {
              type: "array",
              items: { type: "string" },
              example: ["5+ years Node.js", "PostgreSQL experience"],
            },
            responsibilities: {
              type: "array",
              items: { type: "string" },
              example: ["Design REST APIs", "Mentor junior devs"],
            },
            createdBy: { type: "string", format: "uuid" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        JobResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data:    { $ref: "#/components/schemas/Job" },
          },
        },
        JobListResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "object",
              properties: {
                jobs:       { type: "array", items: { $ref: "#/components/schemas/Job" } },
                pagination: { $ref: "#/components/schemas/Pagination" },
              },
            },
          },
        },
        // ─── Candidates ───────────────────────────────────────────────────────
        Candidate: {
          type: "object",
          properties: {
            id:        { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440002" },
            jobId:     { type: "string", format: "uuid" },
            firstName: { type: "string", example: "John" },
            lastName:  { type: "string", example: "Doe" },
            email:     { type: "string", format: "email", example: "john.doe@example.com" },
            phone:     { type: "string", example: "+1-555-0100" },
            resumeUrl: { type: "string", format: "uri", example: "https://cdn.example.com/resumes/john-doe.pdf" },
            status:    { type: "string", enum: ["PENDING", "SCREENED", "SHORTLISTED", "REJECTED"], example: "PENDING" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        CandidateInput: {
          type: "object",
          required: ["firstName", "lastName", "email"],
          properties: {
            firstName: { type: "string", example: "John" },
            lastName:  { type: "string", example: "Doe" },
            email:     { type: "string", format: "email", example: "john.doe@example.com" },
            phone:     { type: "string", example: "+1-555-0100" },
            resumeUrl: { type: "string", format: "uri", example: "https://cdn.example.com/resumes/john-doe.pdf" },
          },
        },
        CandidateResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data:    { $ref: "#/components/schemas/Candidate" },
          },
        },
        CandidateListResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "object",
              properties: {
                candidates: { type: "array", items: { $ref: "#/components/schemas/Candidate" } },
                pagination: { $ref: "#/components/schemas/Pagination" },
              },
            },
          },
        },
        // ─── Screening ────────────────────────────────────────────────────────
        ScreeningResult: {
          type: "object",
          properties: {
            candidateId:  { type: "string", format: "uuid" },
            candidate:    { $ref: "#/components/schemas/Candidate" },
            score:        { type: "number", format: "float", minimum: 0, maximum: 100, example: 87.5 },
            summary:      { type: "string", example: "Strong match — 7 years Node.js, PostgreSQL expert." },
            strengths: {
              type: "array",
              items: { type: "string" },
              example: ["Strong backend experience", "Open-source contributor"],
            },
            weaknesses: {
              type: "array",
              items: { type: "string" },
              example: ["No cloud experience mentioned"],
            },
            recommendation: { type: "string", enum: ["SHORTLIST", "CONSIDER", "REJECT"], example: "SHORTLIST" },
            screenedAt:     { type: "string", format: "date-time" },
          },
        },
        ScreeningResultsResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "object",
              properties: {
                jobId:   { type: "string", format: "uuid" },
                results: { type: "array", items: { $ref: "#/components/schemas/ScreeningResult" } },
                total:   { type: "integer", example: 12 },
              },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  // Scan both .ts (dev with ts-node) and .js (production compiled) files
  apis: [
    path.join(__dirname, "../app.ts"),
    path.join(__dirname, "../app.js"),
    path.join(__dirname, "../modules/**/*.routes.ts"),
    path.join(__dirname, "../modules/**/*.routes.js"),
  ],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);