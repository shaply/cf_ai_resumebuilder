import { useState } from "react";
import { Card } from "../card/Card";
import { Button } from "../button/Button";
import { Textarea } from "../textarea/Textarea";

interface GeneratedDocument {
  type: 'resume' | 'coverLetter' | 'questionAnswering';
  texContent: string;
  pdfUrl: string;
  generatedAt: string;
}

export function BuildResumeContent() {
  // Job posting state
  const [jobPosting, setJobPosting] = useState('');
  const [isJobPostingLocked, setIsJobPostingLocked] = useState(false);
  
  // Document selection state
  const [selectedDocuments, setSelectedDocuments] = useState({
    resume: true,
    coverLetter: false,
    questionAnswering: false,
  });
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocuments, setGeneratedDocuments] = useState<GeneratedDocument[]>([]);
  
  // AI Chat state
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);

  const handleDocumentToggle = (docType: keyof typeof selectedDocuments) => {
    setSelectedDocuments(prev => ({
      ...prev,
      [docType]: !prev[docType]
    }));
  };

  const handleGenerateDocuments = async () => {
    if (!jobPosting.trim()) return;
    setJobPosting(jobPosting.trim().toLowerCase());
    
    setIsGenerating(true);
    const resume = await fetch(`/api/generate-resume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ jobPosting })
    });

    const resumeData = await resume.json();

    // Simulate generation for now
    setTimeout(() => {
      const newDocs: GeneratedDocument[] = [];
      
      if (selectedDocuments.resume) {
        newDocs.push({
          type: 'resume',
          texContent: 'Resume LaTeX content...',
          pdfUrl: '/downloads/resume.pdf',
          generatedAt: new Date().toISOString()
        });
      }
      
      if (selectedDocuments.coverLetter) {
        newDocs.push({
          type: 'coverLetter',
          texContent: 'Cover letter LaTeX content...',
          pdfUrl: '/downloads/cover-letter.pdf',
          generatedAt: new Date().toISOString()
        });
      }
      
      setGeneratedDocuments(newDocs);
      setIsGenerating(false);
    }, 3000);
  };

  const handleDownloadFiles = (doc: GeneratedDocument) => {
    // TODO: Implement actual download logic
    console.log(`Downloading ${doc.type} files...`);
  };

  const handleSendChatMessage = () => {
    if (!chatMessage.trim()) return;
    
    // Add user message to chat
    setChatHistory(prev => [...prev, { role: 'user', content: chatMessage }]);
    
    // TODO: Implement AI chat response
    setTimeout(() => {
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: `I understand you want to "${chatMessage}". I'll help you optimize your resume accordingly.` 
      }]);
    }, 1000);
    
    setChatMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Posting Input */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Job Posting</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Paste Job Description
              </label>
              <Textarea
                className="w-full min-h-48"
                placeholder="Paste the job posting here. The AI will analyze the requirements and tailor your resume accordingly..."
                value={jobPosting}
                onChange={(e) => setJobPosting(e.target.value)}
                disabled={isJobPostingLocked}
              />
            </div>
            
            {/* Lock Job Posting Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="lockJobPosting"
                checked={isJobPostingLocked}
                onChange={(e) => setIsJobPostingLocked(e.target.checked)}
                className="rounded border-neutral-300 dark:border-neutral-700"
              />
              <label htmlFor="lockJobPosting" className="text-sm font-medium">
                Lock job posting (prevents editing)
              </label>
            </div>
          </div>
        </Card>

        {/* Document Selection & Generation */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Generate Documents</h3>
          <div className="space-y-4">
            {/* Document Type Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Select Documents to Generate
              </label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="resume"
                    checked={selectedDocuments.resume}
                    onChange={() => handleDocumentToggle('resume')}
                    className="rounded border-neutral-300 dark:border-neutral-700"
                  />
                  <label htmlFor="resume" className="text-sm">
                    Resume (LaTeX + PDF)
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="coverLetter"
                    checked={selectedDocuments.coverLetter}
                    onChange={() => handleDocumentToggle('coverLetter')}
                    className="rounded border-neutral-300 dark:border-neutral-700"
                    disabled={true}
                  />
                  <label htmlFor="coverLetter" className="text-sm text-neutral-500">
                    Cover Letter (Coming Soon)
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="questionAnswering"
                    checked={selectedDocuments.questionAnswering}
                    onChange={() => handleDocumentToggle('questionAnswering')}
                    className="rounded border-neutral-300 dark:border-neutral-700"
                    disabled={true}
                  />
                  <label htmlFor="questionAnswering" className="text-sm text-neutral-500">
                    Interview Q&A (Coming Soon)
                  </label>
                </div>
              </div>
            </div>
            
            {/* Generation Button */}
            <Button 
              className="w-full" 
              onClick={handleGenerateDocuments}
              disabled={!jobPosting.trim() || !Object.values(selectedDocuments).some(Boolean) || isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Selected Documents'}
            </Button>
            
            {!jobPosting.trim() && (
              <p className="text-xs text-neutral-500 text-center">
                Enter a job posting to enable generation
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Generated Documents Download Section */}
      {generatedDocuments.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Generated Documents</h3>
          <div className="space-y-3">
            {generatedDocuments.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                <div>
                  <h4 className="font-medium capitalize">{doc.type.replace(/([A-Z])/g, ' $1').trim()}</h4>
                  <p className="text-sm text-neutral-500">
                    Generated at {new Date(doc.generatedAt).toLocaleTimeString()}
                  </p>
                </div>
                <Button onClick={() => handleDownloadFiles(doc)}>
                  Download Files
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* AI Chat for Resume Building */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">AI Resume Assistant (Coming Soon)</h3>
        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4 min-h-32 mb-4">
          {chatHistory.length === 0 ? (
            <p className="text-sm text-neutral-500 text-center">
              AI conversation will appear here. Ask questions like:
              <br />
              "Make my bullet points more quantitative"
              <br />
              "Focus more on leadership skills"
              <br />
              "Remove items that don't match this job"
            </p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {chatHistory.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm ${
                    message.role === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                  }`}>
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 p-3 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900"
            placeholder="Ask the AI to help optimize your resume..."
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
            disabled={true}
          />
          <Button onClick={handleSendChatMessage} disabled={!chatMessage.trim()}>
            Send
          </Button>
        </div>
      </Card>
    </div>
  );
}
