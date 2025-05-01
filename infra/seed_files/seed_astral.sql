-- Insert an admin user
INSERT INTO User (id, username, name, role, passwordHash, createdAt, lastLogin)
VALUES (
    UUID(),
    'admin',
    'Administrator',
    'ADMIN',
    '$2b$10$DOHpMMZVyKtrfpBG2Qjrau6D0cWpy97/iCOvMOQIZTHyyHxO1bqPm', -- 'admin123'
    NOW(),
    NOW()
);