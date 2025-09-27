import { Card } from "../card/Card";
import { Button } from "../button/Button";
import { Textarea } from "../textarea/Textarea";

export function BuildResumeContent() {
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
              />
            </div>
            <Button className="w-full">Analyze Job Posting</Button>
          </div>
        </Card>

        {/* Resume Generation */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Generate Resume</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Resume Template
              </label>
              <select className="w-full p-3 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900">
                <option>Professional</option>
                <option>Modern</option>
                <option>Academic</option>
                <option>Creative</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Target Length
              </label>
              <select className="w-full p-3 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900">
                <option>1 Page</option>
                <option>2 Pages</option>
                <option>No Limit</option>
              </select>
            </div>
            <Button className="w-full" disabled>
              Generate Resume
            </Button>
            <p className="text-xs text-neutral-500 text-center">
              First analyze a job posting to enable resume generation
            </p>
          </div>
        </Card>
      </div>

      {/* AI Chat for Resume Building */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">AI Resume Assistant</h3>
        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4 min-h-32 mb-4">
          <p className="text-sm text-neutral-500 text-center">
            AI conversation will appear here. Ask questions like:
            <br />
            "Make my bullet points more quantitative"
            <br />
            "Focus more on leadership skills"
            <br />
            "Remove items that don't match this job"
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 p-3 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900"
            placeholder="Ask the AI to help optimize your resume..."
          />
          <Button>Send</Button>
        </div>
      </Card>
    </div>
  );
}