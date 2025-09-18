-- Update user roles check constraint to include new roles
-- Drop existing constraint and create new one with all supported roles

ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('super_admin', 'admin', 'service_tester', 'evaluator'));

-- Ensure compatibility with existing data
UPDATE users SET role = 'admin' WHERE role NOT IN ('super_admin', 'admin', 'service_tester', 'evaluator');