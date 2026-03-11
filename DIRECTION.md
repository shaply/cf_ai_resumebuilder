# Project Direction

## Vision

An AI-powered resume builder that turns your personal career history into a tailored, one-page resume for any job — automatically. The user maintains a persistent database of resume items (experiences, projects, competitions, skills, extracurriculars), pastes a job posting, and the AI selects, reorders, and rewrites bullets to match the role, ultimately producing a print-ready PDF.

---

## Current State (March 2026)

The project has a solid **data layer** and **CRUD UI**, but the core AI generation pipeline is entirely unimplemented. The existing work includes:

- Full REST API for managing resume items (5 types) backed by Cloudflare D1
- React frontend with forms for adding/editing all item types
- A Cloudflare Workers AI + Durable Objects scaffold (from the `agents-starter` template)
- A heuristic job-posting keyword extractor
- A partial `/api/generate-resume` endpoint that returns keyword analysis only

The most critical missing piece is the end-to-end pipeline: **job posting → AI analysis → tailored resume items → LaTeX document → PDF download**.

---

## Immediate Priorities (Next Milestone)

### 1. Core AI Generation Pipeline
This is the product. Everything else is secondary.

1. **AI Job Analysis** — Replace the heuristic keyword extractor with a structured AI prompt. Extract required skills, preferred skills, seniority signals, and cultural keywords as a typed JSON object.
2. **Item Selection & Tailoring** — Given the job analysis and the full resume item DB, prompt the AI to select the most relevant items, rewrite bullets to match the job's language, and rank them by fit score.
3. **LaTeX Assembly** — Build a LaTeX template (start with a clean single-column template). Populate it with tailored items.
4. **PDF Rendering** — Decide on and implement the PDF render pipeline. Top candidate: Cloudflare Browser Rendering with a headless-Chrome worker that compiles LaTeX server-side. Fallback: ship a pre-compiled LaTeX binary via Wasm.

### 2. Authentication
Every API endpoint currently hardcodes `userId = 1`. Multi-user support requires:
- Cloudflare Access or a cookie-based JWT session
- Per-user D1 row isolation (the schema already has `user_id` columns)
- Session propagation into the Durable Object agent

### 3. Wire Up the AI Chat Assistant
The `Chat` Durable Object agent and the full chat UI exist but are disconnected from the resume builder views. The chat assistant should drive the Build Resume flow — letting the user refine bullets, swap items, or regenerate sections conversationally.

---

## Medium-Term Roadmap

| Feature | Notes |
|---|---|
| Cover Letter Generation | UI placeholder already exists |
| Interview Q&A Generation | UI placeholder already exists |
| Education resume item type | Standard section, not yet modeled |
| Multiple resume templates | Start with one, add Latex themes later |
| Generated Resumes history | DB table `generated_resumes` exists, no API yet |
| Resume version diffing | Show what the AI changed from a previous version |
| Export to DOCX | Secondary to PDF |

---

## Technical Decisions Needed

1. **PDF Rendering Approach** — Cloudflare Browser Rendering vs. Wasm LaTeX vs. third-party API. This is the highest-risk open question.
2. **Auth Strategy** — Cloudflare Access (zero-config for internal use) vs. a custom JWT cookie flow for public launch.
3. **AI Model** — Currently `@cf/meta/llama-3.1-8b-instruct` (Workers AI free tier). For production quality, consider routing generation requests through OpenAI `gpt-4o` or Anthropic `claude-3-5-sonnet`.
4. **LaTeX Template(s)** — Choose a base template license-compatible with redistribution.

---

## Non-Goals (for now)

- Mobile-optimized UI (resume building is a desktop task)
- Collaborative editing
- LinkedIn / resume import
- Job application tracking

---

## Guiding Principles

- **One-page output is a hard constraint.** The AI should iteratively trim content to fit, not just truncate.
- **The user owns their data.** All resume items live in the user's own D1 database; nothing is sent to third parties except the AI inference call.
- **Fast iteration > perfect architecture.** Build the pipeline end-to-end first, then refactor form duplication and add pagination.
