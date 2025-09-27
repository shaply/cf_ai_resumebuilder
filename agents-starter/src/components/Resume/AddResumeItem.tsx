import { useState } from "react";
import { Card } from "../card/Card";
import { Button } from "../button/Button";
import { Textarea } from "../textarea/Textarea";
import { ResumeItemType } from "@/database";

interface FormData {
  type: ResumeItemType;
  title: string;
  organization: string;
  startDate: string;
  endDate: string;
  description: string;
  isCurrent: boolean;
}

export function AddResumeItemContent() {
  const [formData, setFormData] = useState<FormData>({
    type: ResumeItemType.EXPERIENCE,
    title: "",
    organization: "",
    startDate: "",
    endDate: "",
    description: "",
    isCurrent: false
  });

  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent, saveAndAddAnother = false) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setMessage({ type: 'error', text: 'Title is required' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/resume-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json() as any;

      if (result.success) {
        setMessage({ type: 'success', text: `Successfully saved: ${formData.title}` });
        
        if (saveAndAddAnother) {
          // Reset form but keep the type
          setFormData(prev => ({
            type: prev.type,
            title: "",
            organization: "",
            startDate: "",
            endDate: "",
            description: "",
            isCurrent: false
          }));
        } else {
          // Reset entire form
          setFormData({
            type: ResumeItemType.EXPERIENCE,
            title: "",
            organization: "",
            startDate: "",
            endDate: "",
            description: "",
            isCurrent: false
          });
        }
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save item' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Add New Resume Item</h3>
        
        {message && (
          <div className={`p-3 rounded-lg mb-4 ${
            message.type === 'success' 
              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800' 
              : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Item Type</label>
            <select 
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full p-3 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900"
            >
              <option value={ResumeItemType.EXPERIENCE}>Work Experience</option>
              <option value={ResumeItemType.PROJECT}>Project</option>
              <option value={ResumeItemType.COMPETITION}>Competition</option>
              <option value={ResumeItemType.SKILL}>Skill</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Title/Position *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-3 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900"
              placeholder="e.g., Software Engineer, Personal Website Project"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Organization/Company
            </label>
            <input
              type="text"
              name="organization"
              value={formData.organization}
              onChange={handleInputChange}
              className="w-full p-3 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900"
              placeholder="e.g., Google, Personal Project"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Start Date
              </label>
              <input
                type="month"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full p-3 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input
                type="month"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                disabled={formData.isCurrent}
                className="w-full p-3 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 disabled:opacity-50"
              />
            </div>
          </div>
          
          <div>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                name="isCurrent"
                checked={formData.isCurrent}
                onChange={handleInputChange}
                className="rounded"
              />
              This is my current position/project
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full min-h-32"
              placeholder="Describe your responsibilities, achievements, technologies used, impact, etc."
            />
          </div>
          
          <div className="flex gap-3">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Item'}
            </Button>
            <Button 
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              onClick={(e) => handleSubmit(e, true)}
            >
              Save & Add Another
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}