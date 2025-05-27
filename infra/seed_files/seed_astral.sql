-- Insert an admin user
INSERT IGNORE INTO User (id, username, name, role, passwordHash, createdAt, lastLogin)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'admin',
    'Administrator',
    'ADMIN',
    '$2b$10$DOHpMMZVyKtrfpBG2Qjrau6D0cWpy97/iCOvMOQIZTHyyHxO1bqPm', -- 'admin123'
    NOW(),
    NOW()
);