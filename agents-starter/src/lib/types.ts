import type { ResumeItemType } from "@/database";

export interface BaseFormData {
  id: number | null;
  type: ResumeItemType;
  title: string;
  description: string;
}
export interface ExperienceFormData extends BaseFormData {
  type: 'experience';
  organization: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  location: string;
}
export interface ProjectFormData extends BaseFormData {
  type: 'project';
  tools: string;
  projectType: "school" | "personal";
  githubLink: string;
}

export interface CompetitionFormData extends BaseFormData {
  type: 'competition';
  award: string;
  organization: string;
  resumeItemName: string;
}

export interface SkillFormData extends BaseFormData {
  type: 'skill';
}

export interface ExtracurricularFormData extends BaseFormData {
  type: 'extracurricular';
  organization: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  location: string;
}