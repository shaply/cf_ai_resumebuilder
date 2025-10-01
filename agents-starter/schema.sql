-- Resume Builder Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Resume items table
CREATE TABLE IF NOT EXISTS resume_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('experience', 'project', 'competition', 'skill', 'extracurricular')),
    title TEXT NOT NULL,
    description TEXT,
    -- Experience fields
    organization TEXT,
    start_date DATE,
    end_date DATE,
    location TEXT,
    is_current BOOLEAN DEFAULT FALSE,
    -- Project fields
    tools TEXT, -- comma-separated list of tools/technologies
    project_type TEXT CHECK (project_type IN ('school', 'personal')),
    github_link TEXT,
    -- Competition fields
    award TEXT,
    resume_item_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Generated resumes table
CREATE TABLE IF NOT EXISTS generated_resumes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    job_posting TEXT,
    job_company TEXT,
    job_title TEXT,
    template_name TEXT DEFAULT 'professional',
    selected_items TEXT, -- JSON array of resume_item IDs that were included
    latex_content TEXT,
    pdf_url TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'completed', 'failed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_resume_items_user_id ON resume_items(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_items_type ON resume_items(type);
CREATE INDEX IF NOT EXISTS idx_generated_resumes_user_id ON generated_resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_resumes_status ON generated_resumes(status);