-- Force create AHP platform tables
-- This script ensures all necessary tables exist

-- Create users table first (Custom User Model)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    password VARCHAR(128) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE,
    is_superuser BOOLEAN NOT NULL DEFAULT FALSE,
    username VARCHAR(150) UNIQUE NOT NULL,
    first_name VARCHAR(150) DEFAULT '',
    last_name VARCHAR(150) DEFAULT '',
    email VARCHAR(254) DEFAULT '',
    is_staff BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    date_joined TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    full_name VARCHAR(100) DEFAULT '',
    organization VARCHAR(200) DEFAULT '',
    department VARCHAR(100) DEFAULT '',
    position VARCHAR(100) DEFAULT '',
    phone VARCHAR(20) DEFAULT '',
    is_evaluator BOOLEAN DEFAULT FALSE,
    is_project_manager BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE,
    language VARCHAR(10) DEFAULT 'ko',
    timezone VARCHAR(50) DEFAULT 'Asia/Seoul'
);

-- Create simple_projects table
CREATE TABLE IF NOT EXISTS simple_projects (
    id UUID PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    objective TEXT NOT NULL,
    owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'draft',
    visibility VARCHAR(20) DEFAULT 'private',
    consistency_ratio_threshold FLOAT DEFAULT 0.1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deadline TIMESTAMP WITH TIME ZONE,
    tags JSONB DEFAULT '[]'::jsonb,
    settings JSONB DEFAULT '{}'::jsonb
);

-- Create project_members table
CREATE TABLE IF NOT EXISTS project_members (
    id SERIAL PRIMARY KEY,
    project_id UUID REFERENCES simple_projects(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL,
    role VARCHAR(20) NOT NULL,
    can_edit_structure BOOLEAN DEFAULT FALSE,
    can_manage_evaluators BOOLEAN DEFAULT FALSE,
    can_view_results BOOLEAN DEFAULT TRUE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    invited_by_id INTEGER,
    UNIQUE(project_id, user_id)
);

-- Create criteria table
CREATE TABLE IF NOT EXISTS criteria (
    id SERIAL PRIMARY KEY,
    project_id UUID REFERENCES simple_projects(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT DEFAULT '',
    type VARCHAR(20) NOT NULL,
    parent_id INTEGER REFERENCES criteria(id) ON DELETE CASCADE,
    "order" INTEGER DEFAULT 0,
    level INTEGER DEFAULT 0,
    weight FLOAT DEFAULT 0.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, name)
);

-- Create project_templates table  
CREATE TABLE IF NOT EXISTS project_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    structure JSONB NOT NULL,
    default_settings JSONB DEFAULT '{}'::jsonb,
    created_by_id INTEGER NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_simple_projects_owner ON simple_projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_simple_projects_status ON simple_projects(status);
CREATE INDEX IF NOT EXISTS idx_simple_projects_created ON simple_projects(created_at);
CREATE INDEX IF NOT EXISTS idx_criteria_project ON criteria(project_id);
CREATE INDEX IF NOT EXISTS idx_criteria_parent ON criteria(parent_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);