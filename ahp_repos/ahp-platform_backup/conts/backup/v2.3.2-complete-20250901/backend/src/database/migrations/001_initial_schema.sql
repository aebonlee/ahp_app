-- Users table for admin and evaluator accounts
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'evaluator')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Projects table for AHP project metadata
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed')),
    admin_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criteria table for hierarchical structure with self-referencing parent_id
CREATE TABLE criteria (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES criteria(id) ON DELETE CASCADE,
    level INTEGER NOT NULL DEFAULT 1,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_name_per_parent UNIQUE (project_id, parent_id, name),
    CONSTRAINT max_hierarchy_level CHECK (level <= 4)
);

-- Alternatives table for decision alternatives linked to projects
CREATE TABLE alternatives (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_alternative_name UNIQUE (project_id, name)
);

-- Many-to-many relationship for project assignments
CREATE TABLE project_evaluators (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    evaluator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_project_evaluator UNIQUE (project_id, evaluator_id)
);

-- Store all pairwise comparison values
CREATE TABLE pairwise_comparisons (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    evaluator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    criterion_id INTEGER REFERENCES criteria(id) ON DELETE CASCADE,
    element1_id INTEGER NOT NULL,
    element2_id INTEGER NOT NULL,
    element1_type VARCHAR(20) NOT NULL CHECK (element1_type IN ('criterion', 'alternative')),
    element2_type VARCHAR(20) NOT NULL CHECK (element2_type IN ('criterion', 'alternative')),
    comparison_value DECIMAL(10, 6) NOT NULL CHECK (comparison_value >= 0.111111 AND comparison_value <= 9.0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_comparison UNIQUE (project_id, evaluator_id, criterion_id, element1_id, element2_id, element1_type, element2_type)
);

-- Calculated weights and consistency ratios
CREATE TABLE results (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    evaluator_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    criterion_id INTEGER REFERENCES criteria(id) ON DELETE CASCADE,
    element_id INTEGER NOT NULL,
    element_type VARCHAR(20) NOT NULL CHECK (element_type IN ('criterion', 'alternative')),
    local_weight DECIMAL(10, 6) NOT NULL,
    global_weight DECIMAL(10, 6),
    consistency_ratio DECIMAL(10, 6),
    calculation_type VARCHAR(20) NOT NULL DEFAULT 'individual' CHECK (calculation_type IN ('individual', 'group')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_projects_admin_id ON projects(admin_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_criteria_project_id ON criteria(project_id);
CREATE INDEX idx_criteria_parent_id ON criteria(parent_id);
CREATE INDEX idx_criteria_level ON criteria(level);
CREATE INDEX idx_alternatives_project_id ON alternatives(project_id);
CREATE INDEX idx_project_evaluators_project_id ON project_evaluators(project_id);
CREATE INDEX idx_project_evaluators_evaluator_id ON project_evaluators(evaluator_id);
CREATE INDEX idx_pairwise_comparisons_project_evaluator ON pairwise_comparisons(project_id, evaluator_id);
CREATE INDEX idx_pairwise_comparisons_criterion ON pairwise_comparisons(criterion_id);
CREATE INDEX idx_results_project_id ON results(project_id);
CREATE INDEX idx_results_evaluator_id ON results(evaluator_id);
CREATE INDEX idx_results_criterion_id ON results(criterion_id);

-- Create triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_criteria_updated_at BEFORE UPDATE ON criteria
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alternatives_updated_at BEFORE UPDATE ON alternatives
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pairwise_comparisons_updated_at BEFORE UPDATE ON pairwise_comparisons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_results_updated_at BEFORE UPDATE ON results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();