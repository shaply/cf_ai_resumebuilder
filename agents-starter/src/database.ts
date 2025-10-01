// Database utilities for Resume Builder
import type { D1Database } from "@cloudflare/workers-types";

// Types for our database models
export interface User {
  id: number;
  email: string;
  name: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResumeItem {
  id: number;
  user_id: number;
  type: ResumeItemType;
  title: string;
  description: string | null;
  // Experience fields
  organization: string | null;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  is_current: boolean;
  // Project fields
  tools: string | null; // comma-separated list
  project_type: 'school' | 'personal' | null;
  github_link: string | null;
  // Competition fields
  award: string | null;
  resume_item_name: string | null;
  created_at: string;
  updated_at: string;
}

export type ResumeItemType = 'experience' | 'project' | 'competition' | 'skill' | 'extracurricular';

export interface GeneratedResume {
  id: number;
  user_id: number;
  title: string;
  job_posting: string | null;
  job_company: string | null;
  job_title: string | null;
  template_name: string;
  selected_items: string | null; // JSON string
  latex_content: string | null;
  pdf_url: string | null;
  status: 'draft' | 'generating' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export class DatabaseService {
  constructor(private db: D1Database) {}

  // User operations
  async createUser(email: string, name?: string): Promise<User> {
    const result = await this.db.prepare(`
      INSERT INTO users (email, name) 
      VALUES (?, ?) 
      RETURNING *
    `).bind(email, name || null).first<User>();
    
    if (!result) {
      throw new Error('Failed to create user');
    }
    return result;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.db.prepare(`
      SELECT * FROM users WHERE email = ?
    `).bind(email).first<User>();
  }

  async getUserById(id: number): Promise<User | null> {
    return await this.db.prepare(`
      SELECT * FROM users WHERE id = ?
    `).bind(id).first<User>();
  }

  // Resume item operations
  async createResumeItem(item: Omit<ResumeItem, 'id' | 'created_at' | 'updated_at'>): Promise<ResumeItem> {
    const result = await this.db.prepare(`
      INSERT INTO resume_items (
        user_id, type, title, description, organization, start_date, end_date, 
        location, is_current, tools, project_type, github_link, award, resume_item_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      item.user_id,
      item.type,
      item.title,
      item.description,
      item.organization,
      item.start_date,
      item.end_date,
      item.location,
      item.is_current,
      item.tools,
      item.project_type,
      item.github_link,
      item.award,
      item.resume_item_name
    ).first<ResumeItem>();

    if (!result) {
      throw new Error('Failed to create resume item');
    }
    return result;
  }

  async getResumeItemsByUserId(userId: number): Promise<ResumeItem[]> {
    const result = await this.db.prepare(`
      SELECT * FROM resume_items 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).bind(userId).all<ResumeItem>();
    
    return result.results || [];
  }

  async getResumeItemById(id: number): Promise<ResumeItem | null> {
    return await this.db.prepare(`
      SELECT * FROM resume_items WHERE id = ?
    `).bind(id).first<ResumeItem>();
  }

  async updateResumeItem(id: number, updates: Partial<Omit<ResumeItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<ResumeItem> {
    const updateFields = [];
    const values = [];
    
    if (updates.type !== undefined) {
      updateFields.push('type = ?');
      values.push(updates.type);
    }
    if (updates.title !== undefined) {
      updateFields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      updateFields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.organization !== undefined) {
      updateFields.push('organization = ?');
      values.push(updates.organization);
    }
    if (updates.start_date !== undefined) {
      updateFields.push('start_date = ?');
      values.push(updates.start_date);
    }
    if (updates.end_date !== undefined) {
      updateFields.push('end_date = ?');
      values.push(updates.end_date);
    }
    if (updates.location !== undefined) {
      updateFields.push('location = ?');
      values.push(updates.location);
    }
    if (updates.is_current !== undefined) {
      updateFields.push('is_current = ?');
      values.push(updates.is_current);
    }
    if (updates.tools !== undefined) {
      updateFields.push('tools = ?');
      values.push(updates.tools);
    }
    if (updates.project_type !== undefined) {
      updateFields.push('project_type = ?');
      values.push(updates.project_type);
    }
    if (updates.github_link !== undefined) {
      updateFields.push('github_link = ?');
      values.push(updates.github_link);
    }
    if (updates.award !== undefined) {
      updateFields.push('award = ?');
      values.push(updates.award);
    }
    if (updates.resume_item_name !== undefined) {
      updateFields.push('resume_item_name = ?');
      values.push(updates.resume_item_name);
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const result = await this.db.prepare(`
      UPDATE resume_items 
      SET ${updateFields.join(', ')} 
      WHERE id = ? 
      RETURNING *
    `).bind(...values).first<ResumeItem>();

    if (!result) {
      throw new Error('Failed to update resume item');
    }
    return result;
  }

  async deleteResumeItem(id: number): Promise<boolean> {
    const result = await this.db.prepare(`
      DELETE FROM resume_items WHERE id = ?
    `).bind(id).run();
    
    return result.success && result.meta.changes > 0;
  }

  // Generated resume operations
  async createGeneratedResume(resume: Omit<GeneratedResume, 'id' | 'created_at' | 'updated_at'>): Promise<GeneratedResume> {
    const result = await this.db.prepare(`
      INSERT INTO generated_resumes (
        user_id, title, job_posting, job_company, job_title, 
        template_name, selected_items, latex_content, pdf_url, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      resume.user_id,
      resume.title,
      resume.job_posting,
      resume.job_company,
      resume.job_title,
      resume.template_name,
      resume.selected_items,
      resume.latex_content,
      resume.pdf_url,
      resume.status
    ).first<GeneratedResume>();

    if (!result) {
      throw new Error('Failed to create generated resume');
    }
    return result;
  }

  async getGeneratedResumesByUserId(userId: number): Promise<GeneratedResume[]> {
    const result = await this.db.prepare(`
      SELECT * FROM generated_resumes 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).bind(userId).all<GeneratedResume>();
    
    return result.results || [];
  }

  async updateGeneratedResume(id: number, updates: Partial<Omit<GeneratedResume, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<GeneratedResume> {
    const updateFields = [];
    const values = [];
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    });

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const result = await this.db.prepare(`
      UPDATE generated_resumes 
      SET ${updateFields.join(', ')} 
      WHERE id = ? 
      RETURNING *
    `).bind(...values).first<GeneratedResume>();

    if (!result) {
      throw new Error('Failed to update generated resume');
    }
    return result;
  }

  async deleteGeneratedResume(id: number): Promise<boolean> {
    const result = await this.db.prepare(`
      DELETE FROM generated_resumes WHERE id = ?
    `).bind(id).run();
    
    return result.success && result.meta.changes > 0;
  }

  // Utility functions
  async getResumeItemsByType(userId: number, type: ResumeItem['type']): Promise<ResumeItem[]> {
    const result = await this.db.prepare(`
      SELECT * FROM resume_items 
      WHERE user_id = ? AND type = ? 
      ORDER BY start_date DESC, created_at DESC
    `).bind(userId, type).all<ResumeItem>();
    
    return result.results || [];
  }

  async searchResumeItems(userId: number, searchTerm: string): Promise<ResumeItem[]> {
    const result = await this.db.prepare(`
      SELECT * FROM resume_items 
      WHERE user_id = ? AND (
        title LIKE ? OR 
        organization LIKE ? OR 
        description LIKE ? OR
        tools LIKE ? OR
        award LIKE ?
      )
      ORDER BY created_at DESC
    `).bind(
      userId, 
      `%${searchTerm}%`, 
      `%${searchTerm}%`, 
      `%${searchTerm}%`, 
      `%${searchTerm}%`,
      `%${searchTerm}%`
    ).all<ResumeItem>();
    
    return result.results || [];
  }
}