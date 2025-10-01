import { useState, useEffect } from "react";
import { Button } from "../button/Button";
import { Card } from "../card/Card";
import { Loader } from "../loader/Loader";
import type { ResumeItem, ResumeItemType } from "@/database";
import type {
  ExperienceFormData,
  ProjectFormData,
  CompetitionFormData,
  SkillFormData,
  ExtracurricularFormData
} from "@/lib/types";
import { FormExperience } from "./FormExperience";
import { FormProject } from "./FormProject";
import { FormCompetition } from "./FormCompetition";
import { FormSkill } from "./FormSkill";
import { FormExtracurricular } from "./FormExtracurricular";

// Type color mapping for consistent styling
const TYPE_COLORS = {
  experience:
    "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  project:
    "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
  competition:
    "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
  skill:
    "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
  extracurricular:
    "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300"
} as const;

const TYPE_LABELS = {
  experience: "Experience",
  project: "Project",
  competition: "Competition",
  skill: "Skill",
  extracurricular: "Extracurricular"
} as const;

interface ResumeItemCardProps {
  item: ResumeItem;
  isSelected: boolean;
  onClick: () => void;
  onDelete: (id: number) => void;
}

function ResumeItemCard({
  item,
  isSelected,
  onClick,
  onDelete
}: ResumeItemCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
      onDelete(item.id);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr + "-01").toLocaleDateString("en-US", {
        year: "numeric",
        month: "short"
      });
    } catch {
      return dateStr;
    }
  };

  const getDateRange = () => {
    if (item.type === "skill") return null;

    const start = formatDate(item.start_date);
    const end = item.is_current ? "Present" : formatDate(item.end_date);

    if (!start && !end) return null;
    if (start && end) return `${start} - ${end}`;
    if (start) return start;
    if (end) return end;
    return null;
  };

  return (
    <div
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? "ring-2 ring-blue-500 shadow-md" : ""
      }`}
      onClick={onClick}
    >
      <Card className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${TYPE_COLORS[item.type]}`}
              >
                {TYPE_LABELS[item.type]}
              </span>
              {getDateRange() && (
                <span className="text-sm text-neutral-500">
                  {getDateRange()}
                </span>
              )}
            </div>
            <h4 className="font-medium truncate">{item.title}</h4>
            {item.organization && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                {item.organization}
              </p>
            )}
            {item.description && (
              <p className="text-sm mt-2 text-neutral-700 dark:text-neutral-300 line-clamp-2">
                {item.description}
              </p>
            )}
          </div>
          <div className="flex gap-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              {isSelected ? "Close" : "Edit"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700"
            >
              Delete
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function convertResumeItemToFormData(
  item: ResumeItem
):
  | ExperienceFormData
  | ProjectFormData
  | CompetitionFormData
  | SkillFormData
  | ExtracurricularFormData {
  const baseData = {
    id: item.id,
    title: item.title,
    description: item.description || ""
  };

  switch (item.type) {
    case "experience":
      return {
        ...baseData,
        type: "experience",
        organization: item.organization || "",
        startDate: item.start_date || "",
        endDate: item.end_date || "",
        isCurrent: item.is_current || false,
        location: item.location || ""
      };
    case "project":
      return {
        ...baseData,
        type: "project",
        tools: item.tools || "",
        projectType: (item.project_type as "school" | "personal") || "personal",
        githubLink: item.github_link || ""
      };
    case "competition":
      return {
        ...baseData,
        type: "competition",
        award: item.award || "",
        organization: item.organization || "",
        resumeItemName: item.resume_item_name || ""
      };
    case "skill":
      return {
        ...baseData,
        type: "skill"
      };
    case "extracurricular":
      return {
        ...baseData,
        type: "extracurricular",
        organization: item.organization || "",
        startDate: item.start_date || "",
        endDate: item.end_date || "",
        isCurrent: item.is_current || false,
        location: item.location || ""
      };
    default:
      throw new Error(`Unknown item type: ${item.type}`);
  }
}

export function EditResumeItemContent() {
  const [items, setItems] = useState<ResumeItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [selectedItemDetails, setSelectedItemDetails] =
    useState<ResumeItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all resume items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/resume-items");
        const result = (await response.json()) as {
          success: boolean;
          data: ResumeItem[];
          error?: string;
        };

        if (result.success) {
          setItems(result.data);
        } else {
          setError(result.error || "Failed to fetch resume items");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch resume items"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Fetch individual item details when selected
  const handleItemSelect = async (itemId: number) => {
    if (selectedItemId === itemId) {
      // Clicking the same item closes the detail view
      setSelectedItemId(null);
      setSelectedItemDetails(null);
      return;
    }

    try {
      setDetailLoading(true);
      setSelectedItemId(itemId);

      const response = await fetch(`/api/resume-items/${itemId}`);
      const result = (await response.json()) as {
        success: boolean;
        data: ResumeItem;
        error?: string;
      };

      if (result.success) {
        setSelectedItemDetails(result.data);
      } else {
        setError(result.error || "Failed to fetch item details");
        setSelectedItemId(null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch item details"
      );
      setSelectedItemId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  // Handle item deletion
  const handleItemDelete = async (itemId: number) => {
    try {
      const response = await fetch(`/api/resume-items/${itemId}`, {
        method: "DELETE"
      });
      const result = (await response.json()) as {
        success: boolean;
        message?: string;
        error?: string;
      };

      if (result.success) {
        // Remove from local state
        setItems(items.filter((item) => item.id !== itemId));

        // Close detail view if this item was selected
        if (selectedItemId === itemId) {
          setSelectedItemId(null);
          setSelectedItemDetails(null);
        }
      } else {
        setError(result.error || "Failed to delete item");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item");
    }
  };

  // Handle successful form updates
  const handleItemUpdate = (updatedItem: ResumeItem) => {
    // Update the items list
    setItems(
      items.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );

    // Update the detail view if this item is selected
    if (selectedItemId === updatedItem.id) {
      setSelectedItemDetails(updatedItem);
    }
  };

  // Group items by type
  const groupedItems = items.reduce(
    (acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = [];
      }
      acc[item.type].push(item);
      return acc;
    },
    {} as Record<ResumeItemType, ResumeItem[]>
  );

  // Render the appropriate form component
  const renderEditForm = () => {
    if (!selectedItemDetails) return null;

    const formData = convertResumeItemToFormData(selectedItemDetails);
    const commonProps = {
      onUpdate: handleItemUpdate,
      mode: "edit" as const
    };

    switch (selectedItemDetails.type) {
      case "experience":
        return (
          <FormExperience
            {...(formData as ExperienceFormData)}
            {...commonProps}
          />
        );
      case "project":
        return (
          <FormProject {...(formData as ProjectFormData)} {...commonProps} />
        );
      case "competition":
        return (
          <FormCompetition
            {...(formData as CompetitionFormData)}
            {...commonProps}
          />
        );
      case "skill":
        return <FormSkill {...(formData as SkillFormData)} {...commonProps} />;
      case "extracurricular":
        return (
          <FormExtracurricular
            {...(formData as ExtracurricularFormData)}
            {...commonProps}
          />
        );
      default:
        return <div>Unknown item type</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-lg">
          Error: {error}
        </div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex gap-6 h-[calc(100vh-200px)]">
        {/* Left Panel - Items List */}
        <div
          className={`transition-all duration-300 ${
            selectedItemId ? "w-1/2" : "w-full"
          }`}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Your Resume Items</h3>
            <span className="text-sm text-neutral-500">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          </div>

          <div className="space-y-6 overflow-y-auto pr-2 h-full">
            {items.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-neutral-500 mb-4">No resume items found</p>
                <p className="text-sm text-neutral-400">
                  Go to the Add tab to create your first resume item
                </p>
              </Card>
            ) : (
              Object.entries(groupedItems).map(([type, typeItems]) => (
                <div key={type}>
                  <h4 className="text-md font-medium mb-3 text-neutral-700 dark:text-neutral-300">
                    {TYPE_LABELS[type as ResumeItemType]} ({typeItems.length})
                  </h4>
                  <div className="space-y-3 mb-6">
                    {typeItems.map((item) => (
                      <ResumeItemCard
                        key={item.id}
                        item={item}
                        isSelected={selectedItemId === item.id}
                        onClick={() => handleItemSelect(item.id)}
                        onDelete={handleItemDelete}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Edit Form */}
        {selectedItemId && (
          <div className="w-1/2 border-l border-neutral-200 dark:border-neutral-700 pl-6">
            <div className="h-full overflow-y-auto">
              {detailLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader />
                </div>
              ) : selectedItemDetails ? (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Edit Item</h3>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSelectedItemId(null);
                        setSelectedItemDetails(null);
                      }}
                    >
                      ✕ Close
                    </Button>
                  </div>
                  {renderEditForm()}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  Failed to load item details
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
