import { Button } from "../button/Button";
import { Card } from "../card/Card";

export function EditResumeItemContent() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Your Resume Items</h3>
        <Button variant="ghost">+ Add New Item</Button>
      </div>

      <div className="grid gap-4">
        {/* Sample resume items */}
        <Card className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-xs">
                  Experience
                </span>
                <span className="text-sm text-neutral-500">
                  Jan 2023 - Present
                </span>
              </div>
              <h4 className="font-medium">Software Engineer</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Tech Company Inc.
              </p>
              <p className="text-sm mt-2 text-neutral-700 dark:text-neutral-300">
                Developed and maintained web applications using React and
                Node.js...
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                Edit
              </Button>
              <Button variant="ghost" size="sm">
                Delete
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded text-xs">
                  Project
                </span>
                <span className="text-sm text-neutral-500">
                  Mar 2023 - May 2023
                </span>
              </div>
              <h4 className="font-medium">E-commerce Platform</h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Personal Project
              </p>
              <p className="text-sm mt-2 text-neutral-700 dark:text-neutral-300">
                Built a full-stack e-commerce application with payment
                integration...
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                Edit
              </Button>
              <Button variant="ghost" size="sm">
                Delete
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}