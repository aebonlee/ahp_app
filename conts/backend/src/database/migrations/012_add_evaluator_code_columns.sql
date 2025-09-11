-- Add missing columns to project_evaluators table
-- 012_add_evaluator_code_columns.sql

-- Add evaluator_code column if not exists
ALTER TABLE project_evaluators 
ADD COLUMN IF NOT EXISTS evaluator_code VARCHAR(50);

-- Add access_key column if not exists
ALTER TABLE project_evaluators 
ADD COLUMN IF NOT EXISTS access_key VARCHAR(100);

-- Create evaluator_weights table if not exists
CREATE TABLE IF NOT EXISTS evaluator_weights (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    evaluator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    weight DECIMAL(5,3) DEFAULT 1.000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_project_evaluator_weight UNIQUE (project_id, evaluator_id)
);

-- Create evaluator_progress table if not exists
CREATE TABLE IF NOT EXISTS evaluator_progress (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    evaluator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_tasks INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0.00,
    last_activity TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_project_evaluator_progress UNIQUE (project_id, evaluator_id)
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_project_evaluators_code ON project_evaluators(evaluator_code);
CREATE INDEX IF NOT EXISTS idx_project_evaluators_access_key ON project_evaluators(access_key);
CREATE INDEX IF NOT EXISTS idx_evaluator_weights_project ON evaluator_weights(project_id);
CREATE INDEX IF NOT EXISTS idx_evaluator_progress_project ON evaluator_progress(project_id);