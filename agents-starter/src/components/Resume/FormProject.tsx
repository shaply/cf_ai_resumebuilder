import type { ProjectFormData } from "@/lib/types";
import type { ResumeItem } from "@/database";
import { Card } from "../card/Card";
import { Button } from "../button/Button";
import { useState } from "react";
import { Textarea } from "../textarea/Textarea";

interface FormProjectProps extends ProjectFormData {
  onUpdate?: (updatedItem: ResumeItem) => void;
  mode?: 'add' | 'edit';
}

export function FormProject(props: FormProjectProps) {
  const { onUpdate, mode = 'add', ...initialData } = props;
  const [formData, setFormData] = useState<ProjectFormData>(initialData);
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
        const successMessage = isEdit ? "Project updated successfully!" : "Project saved successfully!";
        setMessage({ type: "success", text: successMessage });
        
        if (isEdit && onUpdate) {
          onUpdate(result.data);
        } else if (saveAndAddAnother) {
          setFormData(initialData);
        }
      } else {
        setMessage({ type: "error", text: result.error || "Failed to save project." });
      }
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : String(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{mode === 'edit' ? 'Edit Project' : 'Project'}</h3>

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
              Project Name *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-3 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900"
              placeholder="e.g., Personal Website, E-commerce App"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Tools/Technologies *
            </label>
            <input
              type="text"
              name="tools"
              value={formData.tools}
              onChange={handleInputChange}
              className="w-full p-3 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900"
              placeholder="e.g., React, Node.js, Python, AWS (comma-separated)"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Project Type</label>
            <select 
              name="projectType"
              value={formData.projectType}
              onChange={handleInputChange}
              className="w-full p-3 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900"
            >
              <option value="personal">Personal</option>
              <option value="school">School</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              GitHub Link (Optional)
            </label>
            <input
              type="url"
              name="githubLink"
              value={formData.githubLink}
              onChange={handleInputChange}
              className="w-full p-3 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900"
              placeholder="https://github.com/username/project"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Project Description
            </label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full min-h-32"
              placeholder="Describe what the project does, your role, challenges overcome, etc."
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