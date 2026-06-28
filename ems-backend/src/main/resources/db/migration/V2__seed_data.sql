-- ============================================
-- V2: Seed data
-- ============================================

-- Roles
INSERT INTO roles (name) VALUES ('SUPER_ADMIN'), ('HR_MANAGER'), ('EMPLOYEE');

-- Default Super Admin user
-- username: admin | password: Admin@123  (CHANGE THIS IMMEDIATELY AFTER FIRST LOGIN)
-- Hash generated with BCrypt, strength 10, verified to match the plaintext above.
INSERT INTO users (username, email, password_hash, role_id, is_enabled)
VALUES (
    'admin',
    'admin@ems.local',
    '$2a$10$ALvaJT34mGUvMsezY0YLwu9eIwWIuBWXaFyWQBPnQx6MiZ0/okySm',
    (SELECT id FROM roles WHERE name = 'SUPER_ADMIN'),
    TRUE
);

-- Leave types
INSERT INTO leave_types (name, default_annual_days) VALUES
    ('CASUAL', 12),
    ('SICK', 10),
    ('PAID', 15),
    ('EMERGENCY', 5);

-- Departments
INSERT INTO departments (name, description) VALUES
    ('Engineering', 'Product engineering and platform teams'),
    ('Human Resources', 'People operations and HR'),
    ('Sales', 'Sales and business development'),
    ('Finance', 'Finance and accounting'),
    ('Marketing', 'Marketing and brand');

-- Designations
INSERT INTO designations (title, department_id) VALUES
    ('Software Engineer', (SELECT id FROM departments WHERE name = 'Engineering')),
    ('Senior Software Engineer', (SELECT id FROM departments WHERE name = 'Engineering')),
    ('Engineering Manager', (SELECT id FROM departments WHERE name = 'Engineering')),
    ('HR Executive', (SELECT id FROM departments WHERE name = 'Human Resources')),
    ('HR Manager', (SELECT id FROM departments WHERE name = 'Human Resources')),
    ('Sales Executive', (SELECT id FROM departments WHERE name = 'Sales')),
    ('Sales Manager', (SELECT id FROM departments WHERE name = 'Sales')),
    ('Accountant', (SELECT id FROM departments WHERE name = 'Finance')),
    ('Finance Manager', (SELECT id FROM departments WHERE name = 'Finance')),
    ('Marketing Executive', (SELECT id FROM departments WHERE name = 'Marketing'));

-- Sample holidays (current year)
INSERT INTO holidays (name, holiday_date, description) VALUES
    ('New Year''s Day', '2026-01-01', 'New Year holiday'),
    ('Republic Day', '2026-01-26', 'National holiday'),
    ('Independence Day', '2026-08-15', 'National holiday'),
    ('Gandhi Jayanti', '2026-10-02', 'National holiday'),
    ('Christmas', '2026-12-25', 'Christmas holiday');
