
-- 002_seed.sql

BEGIN;

-- 1. Users
INSERT INTO users (username, password)
VALUES
    ('admin', 'demo_hash_admin'),
    ('duong', 'demo_hash_duong'),
    ('tester', 'demo_hash_tester');

-- 2. Tasks
INSERT INTO tasks (title, description, created_by)
VALUES
    ('Learn ExpressJS', 'Practice routing and middleware',
        (SELECT id FROM users WHERE username = 'duong')),
    ('Learn PostgreSQL', 'Practice SQL queries and transactions',
        (SELECT id FROM users WHERE username = 'duong')),
    ('Build REST API', 'Implement task management endpoints',
        (SELECT id FROM users WHERE username = 'admin')),
    ('Test API', 'Write and execute API test cases',
        (SELECT id FROM users WHERE username = 'tester'));

-- 3. Checklist items
INSERT INTO checklist_items (task_id, content, is_completed)
VALUES
    (
        (SELECT id FROM tasks WHERE title = 'Learn ExpressJS'),
        'Implement CRUD routes',
        TRUE
    ),
    (
        (SELECT id FROM tasks WHERE title = 'Learn ExpressJS'),
        'Add error handling middleware',
        TRUE
    ),
    (
        (SELECT id FROM tasks WHERE title = 'Learn PostgreSQL'),
        'Configure connection pool',
        FALSE
    ),
    (
        (SELECT id FROM tasks WHERE title = 'Learn PostgreSQL'),
        'Practice parameterized queries',
        FALSE
    ),
    (
        (SELECT id FROM tasks WHERE title = 'Build REST API'),
        'Implement Task Repository',
        FALSE
    );

COMMIT;
