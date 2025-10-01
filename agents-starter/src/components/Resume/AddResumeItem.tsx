import { useState } from "react";
import { Card } from "../card/Card";
import type {
  ExperienceFormData,
  ProjectFormData,
  CompetitionFormData,
  SkillFormData,
  ExtracurricularFormData,
} from "../../lib/types";
import { FormExperience } from "./FormExperience";
import { FormProject } from "./FormProject";
import { FormCompetition } from "./FormCompetition";
import { FormSkill } from "./FormSkill";
import { FormExtracurricular } from "./FormExtracurricular";
import type { ResumeItemType } from "@/database";

const getInitialExperienceData = (): ExperienceFormData => ({
  id: null,
  type: 'experience',
  title: "",
  description: "",
  organization: "",
  startDate: "",
  endDate: "",
  isCurrent: false,
  location: ""
});

const getInitialProjectData = (): ProjectFormData => ({
  id: null,
  type: 'project',
  title: "",
  description: "",
  tools: "",
  projectType: "personal",
  githubLink: ""
});

const getInitialCompetitionData = (): CompetitionFormData => ({
  id: null,
  type: 'competition',
  title: "",
  description: "",
  award: "",
  organization: "",
  resumeItemName: ""
});

const getInitialSkillData = (): SkillFormData => ({
  id: null,
  type: 'skill',
  title: "",
  description: ""
});

const getInitialExtracurricularData = (): ExtracurricularFormData => ({
  id: null,
  type: 'extracurricular',
  title: "",
  description: "",
  organization: "",
  startDate: "",
  endDate: "",
  isCurrent: false,
  location: ""
});

export function AddResumeItemContent() {
  const [currentType, setCurrentType] = useState<ResumeItemType>('experience');

  const handleTypeChange = (newType: ResumeItemType) => {
    setCurrentType(newType);
  };

  const renderForm = () => {
    switch (currentType) {
      case 'experience':
        return <FormExperience {...getInitialExperienceData()} />;
      case 'project':
        return <FormProject {...getInitialProjectData()} />;
      case 'competition':
        return <FormCompetition {...getInitialCompetitionData()} />;
      case 'skill':
        return <FormSkill {...getInitialSkillData()} />;
      case 'extracurricular':
        return <FormExtracurricular {...getInitialExtracurricularData()} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Add New Resume Item</h3>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Item Type</label>
          <select
            value={currentType}
            onChange={(e) => handleTypeChange(e.target.value as ResumeItemType)}
            className="w-full p-3 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900"
          >
            <option value='experience'>Work Experience</option>
            <option value='project'>Project</option>
            <option value='competition'>Competition</option>
            <option value='skill'>Skill</option>
            <option value='extracurricular'>Extracurricular Activity</option>
          </select>
        </div>
      </Card>

      {renderForm()}
    </div>
  );
}
