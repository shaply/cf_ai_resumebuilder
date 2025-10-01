import type { ExperienceFormData } from "@/lib/types";
import type { ResumeItem } from "@/database";
import { Card } from "../card/Card";
import { Button } from "../button/Button";
import { useState } from "react";
import { Textarea } from "../textarea/Textarea";

interface FormExperienceProps extends ExperienceFormData {
  onUpdate?: (updatedItem: ResumeItem) => void;
  mode?: 'add' | 'edit';
}

export function FormExperience(props: FormExperienceProps) {
  const { onUpdate, mode = 'add', ...initialData } = props;
  const [formData, setFormData] = useState<ExperienceFormData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent, saveAndAddAnother = false) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
        const isEdit = mode === 'edit' && formData.id;
        const url = isEdit ? `/api/resume-items/${formData.id}` : "/api/resume-items";
        const method = isEdit ? "PUT" : "POST";
        
        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json() as any;
        
        if (result.success) {
            const successMessage = isEdit ? "Experience updated successfully!" : "Experience saved successfully!";
            setMessage({ type: "success", text: successMessage });
            
            if (isEdit && onUpdate) {
                onUpdate(result.data);
            } else if (saveAndAddAnother) {
                setFormData(initialData); // Reset form for new entry
            }
        } else {
            setMessage({ type: "error", text: result.error || "Failed to save experience." });
        }
    } catch (error) {
        setMessage({ type: "error", text: error instanceof Error ? error.message : String(error) });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{mode === 'edit' ? 'Edit Experience' : 'Experience'}</h3>

      {message && (
        <div
          className={`p-3 rounded-lg mb-4 ${
            message.type === "success"
              ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800"
              : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <>
          <div>
            <label className="block text-sm font-medium mb-2">
              Position Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-3 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900"
              placeholder="e.g., Software Engineer, Marketing Intern"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Organization *
            </label>
            <input
              type="text"
              name="organization"
              value={formData.organization}
              onChange={handleInputChange}
              className="w-full p-3 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900"
              placeholder="e.g., Google, Microsoft, Startup Inc."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full p-3 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900"
              placeholder="e.g., San Francisco, CA or Remote"
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
              This is my current position
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
        </>

        <div className="flex gap-3">
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : (mode === 'edit' ? "Update Item" : "Save Item")}
          </Button>
          {mode === 'add' && (
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              onClick={(e) => handleSubmit(e, true)}
            >
              Save & Add Another
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
