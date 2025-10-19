-- Insert sample admin user
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('admin@ahp-system.com', '$2b$10$rO0H6AhOXQjwVqwYFQGBTO.1vQG/QQTXxhj1KYzI1PZYvN4K7nD0u', 'John', 'Administrator', 'admin');

-- Insert sample evaluators
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('evaluator1@ahp-system.com', '$2b$10$rO0H6AhOXQjwVqwYFQGBTO.1vQG/QQTXxhj1KYzI1PZYvN4K7nD0u', 'Alice', 'Smith', 'evaluator'),
('evaluator2@ahp-system.com', '$2b$10$rO0H6AhOXQjwVqwYFQGBTO.1vQG/QQTXxhj1KYzI1PZYvN4K7nD0u', 'Bob', 'Johnson', 'evaluator'),
('evaluator3@ahp-system.com', '$2b$10$rO0H6AhOXQjwVqwYFQGBTO.1vQG/QQTXxhj1KYzI1PZYvN4K7nD0u', 'Carol', 'Davis', 'evaluator');

-- Insert sample project
INSERT INTO projects (name, description, status, admin_id) VALUES
('Software Selection Project', 'Evaluate different software solutions for company needs', 'active', 1);

-- Insert main criteria
INSERT INTO criteria (project_id, name, description, parent_id, level, order_index) VALUES
(1, 'Cost', 'Financial considerations including purchase price and maintenance', NULL, 1, 1),
(1, 'Features', 'Functionality and capabilities of the software', NULL, 1, 2),
(1, 'Usability', 'Ease of use and user experience factors', NULL, 1, 3);

-- Insert sub-criteria for Cost
INSERT INTO criteria (project_id, name, description, parent_id, level, order_index) VALUES
(1, 'Initial Cost', 'Upfront purchase or licensing fees', 1, 2, 1),
(1, 'Maintenance Cost', 'Ongoing support and maintenance expenses', 1, 2, 2),
(1, 'Training Cost', 'Cost of training users on the new system', 1, 2, 3);

-- Insert sub-criteria for Features
INSERT INTO criteria (project_id, name, description, parent_id, level, order_index) VALUES
(1, 'Core Functionality', 'Basic features required for operations', 2, 2, 1),
(1, 'Advanced Features', 'Additional capabilities beyond basic needs', 2, 2, 2);

-- Insert sub-criteria for Usability
INSERT INTO criteria (project_id, name, description, parent_id, level, order_index) VALUES
(1, 'User Interface', 'Quality and intuitiveness of the user interface', 3, 2, 1),
(1, 'Learning Curve', 'How quickly users can become proficient', 3, 2, 2),
(1, 'Documentation', 'Quality and completeness of user documentation', 3, 2, 3);

-- Insert alternatives
INSERT INTO alternatives (project_id, name, description, order_index) VALUES
(1, 'Software A', 'Comprehensive enterprise solution with advanced features', 1),
(1, 'Software B', 'Mid-range solution with good balance of features and cost', 2),
(1, 'Software C', 'Budget-friendly option with basic functionality', 3),
(1, 'Software D', 'Premium solution with cutting-edge features', 4),
(1, 'Software E', 'Open-source alternative with community support', 5);

-- Assign evaluators to the project
INSERT INTO project_evaluators (project_id, evaluator_id) VALUES
(1, 2),
(1, 3),
(1, 4);