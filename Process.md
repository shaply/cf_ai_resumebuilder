# Resume Builder Implementation Plan

## 🎯 High-Level Flow

```
User Input → AI Session → Resume Enhancement → LaTeX Generation → PDF Output
```

## 📋 Detailed Implementation Steps

### **Phase 1: AI Session Infrastructure**

#### 1.1 Create Durable Object for AI Sessions
**File:** `src/ai-session.ts`
```typescript
export class AISession {
  // Properties
  private jobPosting: string
  private jobAnalysis: JobAnalysis | null
  private resumeItems: ResumeItem[]
  private processedResults: Map<string, any>
  
  // Methods
  - startSession(jobPosting, userId)
  - analyzeJob() 
  - enhanceResumeItems()
  - generateSkillsSection()
  - createFinalResume()
}
```

#### 1.2 Add Session API Endpoints
**File:** `src/server.ts`
```typescript
// Session management
POST /api/ai-sessions
  - Create new session
  - Initialize with job posting + user resume items
  - Return sessionId

POST /api/ai-sessions/:id/enhance-resume
  - Enhance resume items for job posting
  - Return ranked & enhanced items

POST /api/ai-sessions/:id/generate-resume
  - Create final LaTeX resume
  - Return downloadable PDF
```

#### 1.3 Update wrangler.jsonc
```json
{
  "durable_objects": {
    "bindings": [
      {
        "name": "AI_SESSION",
        "class_name": "AISession",
        "script_name": "your-worker"
      }
    ]
  }
}
```

### **Phase 2: AI Processing Logic**

#### 2.1 Job Analysis Function
```typescript
async analyzeJob(jobPosting: string): Promise<JobAnalysis> {
  const prompt = `
  Analyze this job posting and extract key requirements:
  
  JOB POSTING:
  ${jobPosting}
  
  Return JSON:
  {
    "requiredSkills": ["skill1", "skill2"],
    "preferredExperience": ["exp1", "exp2"],
    "jobLevel": "entry|mid|senior",
    "industry": "tech|finance|etc",
    "keywords": ["keyword1", "keyword2"]
  }
  `;
  
  // Call Cloudflare Workers AI
  // Store result for reuse
}
```

#### 2.2 Resume Enhancement Function
```typescript
async enhanceResumeItems(): Promise<EnhancedItem[]> {
  const prompt = `
  Job Requirements: ${this.jobAnalysis}
  Resume Items: ${JSON.stringify(this.resumeItems)}
  
  Enhance each item for this job. Return JSON:
  {
    "items": [
      {
        "id": 1,
        "relevanceScore": 85,
        "shouldInclude": true,
        "enhancedBullets": [
          "Enhanced bullet point 1",
          "Enhanced bullet point 2"
        ],
        "reasoning": "Why this item is relevant"
      }
    ]
  }
  `;
  
  // Process and store results
}
```

#### 2.3 Skills Generation Function
```typescript
async generateSkillsSection(includedItems: EnhancedItem[]): Promise<string[]> {
  // Extract skills from included resume items
  // Match with job requirements
  // Format as resume-ready skill categories
}
```

### **Phase 3: Frontend Integration**

#### 3.1 Update BuildResume Component
**File:** `src/components/Resume/BuildResume.tsx`
```typescript
export default function BuildResume() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [jobPosting, setJobPosting] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResume, setGeneratedResume] = useState<string | null>(null);

  // Functions
  - handleStartSession()
  - handleEnhanceResume()
  - handleGenerateResume()
  - handleDownloadPDF()
}
```

#### 3.2 UI Components
```tsx
// Job posting input
<Textarea 
  placeholder="Paste job posting here..."
  value={jobPosting}
  onChange={setJobPosting}
/>

// Generate button
<Button onClick={handleGenerateResume}>
  {isGenerating ? <Loader /> : 'Generate Resume'}
</Button>

// Progress indicator
<div className="space-y-2">
  ✅ Analyzing job requirements
  ⏳ Enhancing resume items
  ⏳ Generating final resume
</div>

// Download section
{generatedResume && (
  <Card>
    <h3>Resume Generated!</h3>
    <Button onClick={handleDownloadPDF}>Download PDF</Button>
    <Button onClick={() => setGeneratedResume(null)}>Generate Another</Button>
  </Card>
)}
```

### **Phase 4: LaTeX Template & PDF Generation**

#### 4.1 Create LaTeX Template
**File:** `src/templates/resume-template.ts`
```typescript
export function generateResumeLatex(data: ResumeData): string {
  return `
\\documentclass[11pt,a4paper]{article}
\\usepackage{geometry}
\\geometry{margin=0.75in}

\\begin{document}
\\section*{Experience}
${data.experience.map(item => `
\\textbf{${item.title}} \\hfill ${item.dates}
\\\\${item.organization}
\\begin{itemize}
${item.bullets.map(bullet => `\\item ${bullet}`).join('\n')}
\\end{itemize}
`).join('\n')}

\\section*{Projects}
${data.projects.map(item => `...`).join('\n')}

\\section*{Skills}
${data.skills.join(' • ')}
\\end{document}
  `;
}
```

#### 4.2 PDF Generation Endpoint
```typescript
POST /api/generate-pdf
  - Accept LaTeX content
  - Convert to PDF (using external service or Workers)
  - Return download URL
```

### **Phase 5: Error Handling & Polish**

#### 5.1 Error States
```typescript
// Handle various error cases
- Invalid job posting
- LLM API failures
- Session timeouts
- PDF generation errors
```

#### 5.2 Loading States
```typescript
// Progress indicators for each step
- "Analyzing job posting..." (5-10s)
- "Enhancing resume items..." (10-20s)  
- "Generating final resume..." (5-10s)
- "Creating PDF..." (5s)
```

## 🔄 User Flow Walkthrough

1. **User enters BuildResume page**
   - Clean form with job posting textarea
   - "Generate Resume" button (disabled until text entered)

2. **User pastes job posting + clicks Generate**
   - Create AI session
   - Show "Analyzing job requirements..." progress
   - Job analysis completes → show ✅

3. **Resume enhancement begins**
   - Show "Enhancing your resume items..." progress  
   - Process user's 14 seed items
   - Rank and enhance for job fit → show ✅

4. **Final resume generation**
   - Show "Creating your resume..." progress
   - Generate LaTeX from enhanced items
   - Convert to PDF → show ✅

5. **Download ready**
   - Show success state with download button
   - Option to generate another resume
   - Preview of what was included/excluded

## 🎯 Success Criteria

- ✅ **Cloudflare Requirements Met**: LLM + Workflow + Input + State
- ✅ **User Experience**: 30-60 second generation time
- ✅ **Cost Efficient**: ~$0.02-0.04 per resume
- ✅ **Extensible**: Easy to add cover letter, interview prep
- ✅ **Professional Output**: Clean, one-page PDF resume

## 📁 File Structure After Implementation

```
src/
├── ai-session.ts              # Durable Object for AI sessions
├── server.ts                  # API endpoints (enhanced)
├── components/Resume/
│   ├── BuildResume.tsx        # Main resume building interface
│   └── ResumePreview.tsx      # PDF preview component
├── templates/
│   └── resume-template.ts     # LaTeX template
└── utils/
    ├── ai-helpers.ts          # LLM prompt utilities
    └── pdf-utils.ts           # PDF generation helpers
```

This plan provides a clear roadmap from start to finish. Each phase builds on the previous one, so you can implement incrementally and test as you go!

Ready to start with Phase 1?